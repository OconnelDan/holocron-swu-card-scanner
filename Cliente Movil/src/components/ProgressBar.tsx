import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Progress from 'react-native-progress';

interface ProgressBarProps {
  progress: number; // 0 to 100
  height?: number;
  showPercentage?: boolean;
  color?: string;
  backgroundColor?: string;
  label?: string;
  style?: any;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  showPercentage = true,
  color = '#4CAF50',
  backgroundColor = '#E0E0E0',
  label,
  style,
}) => {
  const progressValue = Math.min(Math.max(progress, 0), 100) / 100;

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {showPercentage && (
            <Text style={styles.percentage}>{progress.toFixed(1)}%</Text>
          )}
        </View>
      )}
      <Progress.Bar
        progress={progressValue}
        width={null}
        height={height}
        color={color}
        unfilledColor={backgroundColor}
        borderWidth={0}
        style={styles.progressBar}
      />
      {!label && showPercentage && (
        <Text style={styles.standalonePercentage}>{progress.toFixed(1)}%</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  percentage: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  progressBar: {
    borderRadius: 4,
  },
  standalonePercentage: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
});
