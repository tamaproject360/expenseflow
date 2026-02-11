import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated, Easing } from 'react-native';
import Svg, { Path, G, Circle } from 'react-native-svg';
import { Colors, Typography } from '@/constants/theme';

interface DonutChartProps {
  data: {
    key: string;
    value: number;
    color: string;
  }[];
  size?: number;
  strokeWidth?: number;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

export const DonutChart = ({ data, size = 200, strokeWidth = 20 }: DonutChartProps) => {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const total = data.reduce((acc, item) => acc + item.value, 0);
  
  let startAngle = -Math.PI / 2; // Start from top

  if (total === 0) {
     return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size}>
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={Colors.border}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
            </Svg>
            <View style={StyleSheet.absoluteFillObject} pointerEvents="none" style={{alignItems:'center', justifyContent:'center'}}>
                <Text style={{...Typography.caption, color: Colors.textSecondary}}>No Data</Text>
            </View>
        </View>
     )
  }

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        {data.map((item, index) => {
          const angle = (item.value / total) * 2 * Math.PI;
          const strokeDashoffset = circumference - (item.value / total) * circumference;
          
          const currentStartAngle = startAngle;
          startAngle += angle;

          return (
            <DonutSegment 
                key={item.key}
                radius={radius}
                strokeWidth={strokeWidth}
                color={item.color}
                circumference={circumference}
                strokeDashoffset={strokeDashoffset}
                rotation={(currentStartAngle * 180) / Math.PI + 90} 
                center={center}
                index={index}
            />
          );
        })}
      </Svg>
      {/* Center Text */}
      <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>
            {new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            notation: 'compact',
            maximumFractionDigits: 1
            }).format(total)}
        </Text>
      </View>
    </View>
  );
};

const DonutSegment = ({ radius, strokeWidth, color, circumference, strokeDashoffset, rotation, center, index }: any) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 800,
            delay: index * 200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true, // Use native driver for transform/opacity, but not strokeDashoffset (requires JS driver usually for props)
            // Wait, native driver doesn't support strokeDashoffset on Android sometimes.
            // But react-native-svg can animate via setNativeProps if using reanimated.
            // With standard Animated, we might need useNativeDriver: false for non-transform props.
            useNativeDriver: false 
        }).start();
    }, []);

    // Interpolate for strokeDashoffset
    // strokeDashoffset goes from 'circumference' (empty) to 'strokeDashoffset' (filled)
    const animatedStrokeDashoffset = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [circumference, strokeDashoffset]
    });

    return (
        <AnimatedPath
            d={`M${center},${center - radius} A${radius},${radius} 0 0,1 ${center},${center - radius - 0.01}`} 
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeLinecap="round"
            originX={center}
            originY={center}
            rotation={rotation}
            strokeDashoffset={animatedStrokeDashoffset}
        />
    );
}

const styles = StyleSheet.create({
  totalLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 12,
  },
  totalValue: {
    ...Typography.h2,
    fontSize: 20,
    color: Colors.textPrimary,
  },
});
