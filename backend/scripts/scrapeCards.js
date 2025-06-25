#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../src/utils");
const CardScrapingService_1 = require("../src/services/CardScrapingService");
async function main() {
    try {
        utils_1.logger.info('=== Iniciando script de scraping de cartas ===');
        await (0, utils_1.connectToDatabase)();
        const scrapingService = new CardScrapingService_1.CardScrapingService();
        const results = await scrapingService.runFullScrape();
        utils_1.logger.info('=== Scraping completado exitosamente ===', {
            cartasSwudb: results.swudbCount,
            cartasEnriquecidas: results.officialCount,
        });
    }
    catch (error) {
        utils_1.logger.error('Error ejecutando script de scraping:', error);
        process.exit(1);
    }
    finally {
        await (0, utils_1.disconnectFromDatabase)();
    }
}
if (require.main === module) {
    main().catch(error => {
        utils_1.logger.error('Error no manejado en script de scraping:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=scrapeCards.js.map