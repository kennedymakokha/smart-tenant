import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  useDerivedValue,
  runOnJS,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  percentage?: number;
  size?: number;
  strokeWidth?: number;
  duration?: number;
  color?: string;
}

export default function AnimatedPercentageLoader({
  percentage = 0,
  size = 120,
  strokeWidth = 10,
  duration = 1500,
  color = '#3b82f6',
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useSharedValue(0);
  const displayedValue = useSharedValue(0);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset =
      circumference - (progress.value / 100) * circumference;
    return {
      strokeDashoffset,
    };
  });

  const animatedPercentage = useDerivedValue(() =>
    Math.round(displayedValue.value)
  );

  useEffect(() => {
    progress.value = withTiming(percentage, { duration });
    displayedValue.value = withTiming(percentage, { duration });
  }, [percentage]);

  return (
    <View className="items-center mt-6">
      <Svg width={size} height={size}>
        <Circle
          stroke="#e5e7eb"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <AnimatedCircle
          stroke={color}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>

      {/* Use useDerivedValue to display % safely */}
      <Animated.Text
        className="absolute text-xl font-bold text-gray-800"
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {animatedPercentage.value}%
      </Animated.Text>
    </View>
  );
}
