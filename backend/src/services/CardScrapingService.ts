import axios from 'axios';
import puppeteer, { Browser, Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import { Card, ICard } from '../models';
import { config, logger } from '../utils';

/**
 * Interfaz para datos de carta desde SWUDB API
 */
interface SwudbCardData {
  id: string;
  name: string;
  subtitle?: string;
  cardNumber: string;
  set: {
    code: string;
    name: string;
  };
  rarity: string;
  type: string;
  aspects: string[];
  cost?: number;
  power?: number;
  hp?: number;
  arena?: string;
  text?: string;
  imageUrl?: string;
  imageUrlHd?: string;
  traits?: string[];
  keywords?: string[];
}

/**
 * Interfaz para datos adicionales desde scraping web oficial
 */
interface OfficialCardData {
  cardNumber: string;
  officialUrl: string;
  additionalImageUrls?: string[];
  flavorText?: string;
}

/**
 * Servicio para obtener y actualizar datos de cartas
 */
export class CardScrapingService {
  private browser: Browser | null = null;

  /**
   * Obtiene todas las cartas desde SWUDB API
   */
  async fetchCardsFromSwudb(): Promise<SwudbCardData[]> {
    try {
      logger.info('Iniciando fetch de cartas desde SWUDB API'); const response = await axios.get(`${config['swudb']['baseUrl']}/cards`, {
        timeout: 30000,
        headers: {
          'User-Agent': config['scraping']['userAgent'],
          'Accept': 'application/json',
        },
      });

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Respuesta inválida de SWUDB API');
      }

      logger.info(`Obtenidas ${response.data.length} cartas desde SWUDB`);
      return response.data;

    } catch (error) {
      logger.error('Error fetching cards from SWUDB:', error);
      throw new Error(`Error obteniendo cartas de SWUDB: ${error}`);
    }
  }

  /**
   * Inicia el navegador para scraping
   */
  private async initBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      });
    }
  }

  /**
   * Cierra el navegador
   */
  private async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Scrapea datos adicionales desde la web oficial
   */
  async scrapeOfficialWebsite(): Promise<OfficialCardData[]> {
    try {
      logger.info('Iniciando scraping de web oficial de SWU');

      await this.initBrowser();
      const page = await this.browser!.newPage();      // Configuramos user agent y viewport
      await page.setUserAgent(config['scraping']['userAgent']);
      await page.setViewport({ width: 1920, height: 1080 });

      // Navegamos a la página de cartas
      await page.goto(config['scraping']['officialSiteUrl'], {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // Esperamos a que cargue el contenido dinámico
      await page.waitForSelector('[data-testid="card-grid"]', { timeout: 10000 });

      // Simulamos scroll para cargar más cartas (lazy loading)
      await this.autoScroll(page);

      // Obtenemos el HTML procesado
      const content = await page.content();
      const $ = cheerio.load(content);

      const officialCards: OfficialCardData[] = [];

      // Parseamos las cartas usando selectores CSS
      $('[data-testid="card-item"]').each((_, element) => {
        const cardElement = $(element);
        const cardNumber = cardElement.find('[data-testid="card-number"]').text().trim();
        const cardUrl = cardElement.find('a').attr('href');

        if (cardNumber && cardUrl) {
          officialCards.push({
            cardNumber,
            officialUrl: `https://starwarsunlimited.com${cardUrl}`,
          });
        }
      });

      await page.close();

      logger.info(`Scrapeadas ${officialCards.length} cartas desde web oficial`);
      return officialCards;

    } catch (error) {
      logger.error('Error scraping official website:', error);
      throw new Error(`Error scrapeando web oficial: ${error}`);
    }
  }  /**
   * Auto-scroll para cargar contenido lazy-loaded
   */
  private async autoScroll(page: Page): Promise<void> {
    await page.evaluate(() => {
      return new Promise<void>(resolve => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          // @ts-ignore - Código ejecutado en el navegador
          const scrollHeight = document.body.scrollHeight;
          // @ts-ignore - Código ejecutado en el navegador
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
  }

  /**
   * Actualiza la base de datos con datos de SWUDB
   */
  async updateCardsFromSwudb(): Promise<number> {
    try {
      const swudbCards = await this.fetchCardsFromSwudb();
      let updatedCount = 0; for (const cardData of swudbCards) {
        const cardDoc: Partial<ICard> = {
          swudbId: cardData.id,
          name: cardData.name,
          cardNumber: cardData.cardNumber,
          setCode: cardData.set.code,
          setName: cardData.set.name,
          rarity: cardData.rarity as ICard['rarity'],
          type: cardData.type as ICard['type'],
          aspects: cardData.aspects,
          lastUpdated: new Date(),
          scrapingMetadata: {
            lastScraped: new Date(),
            source: 'swudb',
          },
        };

        // Agregamos campos opcionales solo si están presentes
        if (cardData.subtitle) {
          cardDoc.subtitle = cardData.subtitle;
        }
        if (cardData.cost !== undefined) {
          cardDoc.cost = cardData.cost;
        }
        if (cardData.power !== undefined) {
          cardDoc.power = cardData.power;
        }
        if (cardData.hp !== undefined) {
          cardDoc.hp = cardData.hp;
        } if (cardData.arena && (cardData.arena === 'Ground' || cardData.arena === 'Space')) {
          cardDoc.arena = cardData.arena;
        }
        if (cardData.text) {
          cardDoc.text = cardData.text;
        }
        if (cardData.imageUrl) {
          cardDoc.imageUrl = cardData.imageUrl;
        }
        if (cardData.imageUrlHd) {
          cardDoc.imageUrlHd = cardData.imageUrlHd;
        }
        if (cardData.traits) {
          cardDoc.traits = cardData.traits;
        }
        if (cardData.keywords) {
          cardDoc.keywords = cardData.keywords;
        }

        await Card.findOneAndUpdate(
          { swudbId: cardData.id },
          cardDoc,
          { upsert: true, new: true }
        );

        updatedCount++;
      }

      logger.info(`Actualizadas ${updatedCount} cartas desde SWUDB`);
      return updatedCount;

    } catch (error) {
      logger.error('Error updating cards from SWUDB:', error);
      throw error;
    }
  }

  /**
   * Enriquece datos con información de la web oficial
   */
  async enrichWithOfficialData(): Promise<number> {
    try {
      const officialCards = await this.scrapeOfficialWebsite();
      let enrichedCount = 0;

      for (const officialCard of officialCards) {
        const result = await Card.findOneAndUpdate(
          { cardNumber: officialCard.cardNumber },
          {
            $set: {
              'scrapingMetadata.officialUrl': officialCard.officialUrl,
              'scrapingMetadata.lastScraped': new Date(),
            },
          },
          { new: true }
        );

        if (result) {
          enrichedCount++;
        }
      }

      logger.info(`Enriquecidas ${enrichedCount} cartas con datos oficiales`);
      return enrichedCount;

    } catch (error) {
      logger.error('Error enriching with official data:', error);
      throw error;
    } finally {
      await this.closeBrowser();
    }
  }

  /**
   * Ejecuta el proceso completo de scraping
   */
  async runFullScrape(): Promise<{ swudbCount: number; officialCount: number }> {
    try {
      logger.info('Iniciando proceso completo de scraping');

      const swudbCount = await this.updateCardsFromSwudb();
      const officialCount = await this.enrichWithOfficialData();

      logger.info('Proceso de scraping completado', {
        swudbCards: swudbCount,
        officiallyEnriched: officialCount,
      });

      return { swudbCount, officialCount };

    } catch (error) {
      logger.error('Error en proceso completo de scraping:', error);
      throw error;
    }
  }
}
