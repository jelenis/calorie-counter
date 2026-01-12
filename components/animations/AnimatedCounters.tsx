import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle, withDelay, LinearTransition, FadeInDown, FadeInUp, FadeOutDown, Easing } from 'react-native-reanimated';
import { useEffect, useLayoutEffect, useRef, useMemo, useState } from 'react';

export function AnimatedNumber({ calories = 0, textStyle, unit, unitStyle, updateDelay = 100 }: {
    calories: number;
    textStyle?: TextStyle,
    unit?: string
    unitStyle?: TextStyle,
    updateDelay?: number
}) {

    const [displayedCalories, setDisplayedCalories] = useState(calories);


    useEffect(() => {
        const t = setTimeout(() => setDisplayedCalories(calories), updateDelay);
        return () => clearTimeout(t);
    }, [calories, updateDelay]);

    const elements = displayedCalories;


    return (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <Animated.Text layout={FadeInDown.duration(updateDelay * 2)} style={[{ flexDirection: 'row' }, textStyle]} >{elements}</Animated.Text>
            {unit !== undefined &&
                <Animated.Text layout={LinearTransition.springify()
                    .damping(100)
                    .mass(0.4)

                } style={[unitStyle,]}>{unit}</Animated.Text>
            }
        </View >
    );
}
