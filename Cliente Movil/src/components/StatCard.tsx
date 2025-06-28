import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  backgroundColor?: string;
  textColor?: string;
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  onPress,
  backgroundColor = '#FFFFFF',
  textColor = '#333333',
  size = 'medium',
  style,
}) => {
  const Container = onPress ? TouchableOpacity : View;

  const containerProps = onPress ? {
    onPress,
    activeOpacity: 0.7,
  } : {};

  const sizeStyles = {
    small: styles.smallContainer,
    medium: styles.mediumContainer,
    large: styles.largeContainer,
  };

  const textSizes = {
    small: { title: 12, value: 18, subtitle: 10 },
    medium: { title: 14, value: 24, subtitle: 12 },
    large: { title: 16, value: 32, subtitle: 14 },
  };

  return (
    <Container
      style={[
        styles.container,
        sizeStyles[size],
        { backgroundColor },
        onPress && styles.pressable,
        style,
      ]}
      {...containerProps}
    >
      {icon && (
        <View style={styles.iconContainer}>
          {icon}
        </View>
      )}

      <View style={styles.contentContainer}>
        <Text
          style={[
            styles.title,
            { color: textColor, fontSize: textSizes[size].title },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.value,
            { color: textColor, fontSize: textSizes[size].value },
          ]}
          numberOfLines={1}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Text>

        {subtitle && (
          <Text
            style={[
              styles.subtitle,
              { color: `${textColor}80`, fontSize: textSizes[size].subtitle },
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallContainer: {
    padding: 12,
    minHeight: 70,
  },
  mediumContainer: {
    padding: 16,
    minHeight: 90,
  },
  largeContainer: {
    padding: 20,
    minHeight: 110,
  },
  pressable: {
    transform: [{ scale: 1 }],
  },
  iconContainer: {
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '500',
    marginBottom: 4,
  },
  value: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subtitle: {
    fontWeight: '400',
  },
});
