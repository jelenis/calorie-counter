import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { useEffect, useRef, ReactNode, Children } from 'react';

/**
 * AnimatedDoubleBuffer
 * 
 * A component that smoothly animates transitions between changing string values
 * using a double-buffering technique. When the value prop changes, the component
 * fades out the currently visible buffer while sliding it up, and simultaneously 
 * fades in the hidden buffer with the new value, below. The value that was slid up
 * is then reset below the view, ready for the next transition.
 * 
 * This gives the effect of digits "rolling" up to their new values.
 */


interface AnimatedDoubleBufferProps {
    value: string;
    textStyle?: TextStyle;
    slideDistance?: number;
    opacityDuration?: number;
    slideDuration?: number;
    containerStyle?: ViewStyle;
}

export function AnimatedDoubleBuffer({
    value,
    textStyle,
    slideDistance = 20,
    opacityDuration = 160,
    slideDuration = 220,
    containerStyle,
}: AnimatedDoubleBufferProps) {
    const activeBufferIndex = useSharedValue(0); // 0 or 1, tracks which buffer is currently visible

    // Buffer A animation values
    const bufferAOpacity = useSharedValue(1);
    const bufferATranslateY = useSharedValue(0);
    const bufferAValue = useRef(value);

    // Buffer B animation values
    const bufferBOpacity = useSharedValue(0);
    const bufferBTranslateY = useSharedValue(slideDistance);
    const bufferBValue = useRef(value);
    const opacityConfig = { duration: opacityDuration };
    const slideConfig = { duration: slideDuration };

    function bufferASlideOut() {
        bufferAOpacity.value = withTiming(0, opacityConfig);
        bufferATranslateY.value = withTiming(-slideDistance, slideConfig, () => {
            bufferATranslateY.value = slideDistance; // reset off-screen below
        });
    }

    function bufferASlideIn() {
        bufferAOpacity.value = withTiming(1, opacityConfig);
        bufferATranslateY.value = withTiming(0, slideConfig, (finished) => {
            if (finished) activeBufferIndex.value = 0;
        });
    }

    function bufferBSlideOut() {
        bufferBOpacity.value = withTiming(0, opacityConfig);
        bufferBTranslateY.value = withTiming(-slideDistance, slideConfig, () => {
            bufferBTranslateY.value = slideDistance; // reset off-screen below
        });
    }

    function bufferBSlideIn() {
        bufferBOpacity.value = withTiming(1, opacityConfig);
        bufferBTranslateY.value = withTiming(0, slideConfig, (finished) => {
            if (finished) activeBufferIndex.value = 1;
        });
    }

    useEffect(() => {
        // Determine which buffer is currently active and animate accordingly
        // if buffer A is active, it will slide out and buffer B will slide in, and vice versa
        if (activeBufferIndex.value === 0) {
            bufferBValue.current = value;
            bufferASlideOut();
            bufferBSlideIn();
        } else {
            bufferAValue.current = value;
            bufferBSlideOut();
            bufferASlideIn();
        }

    }, [value, slideDistance, opacityDuration, slideDuration]);

    const bufferAStyle = useAnimatedStyle(() => ({
        position: 'relative',
        opacity: bufferAOpacity.value,
        transform: [{ translateY: bufferATranslateY.value }],
    }));

    const bufferBStyle = useAnimatedStyle(() => ({
        position: 'absolute',
        opacity: bufferBOpacity.value,
        transform: [{ translateY: bufferBTranslateY.value }],
    }));

    // Calculate character dimensions based on fontSize and fontWeight
    // this keeps the container width consistent to prevent layout shifts during animation
    const fontSize = (textStyle as any)?.fontSize || 16;
    const fontWeight = (textStyle as any)?.fontWeight || '400';

    // Adjust width multiplier based on font weight 
    const weightMultiplier = ['bold', '700', '800', '900'].includes(String(fontWeight)) ? 0.7 : 0.6;
    const charWidth = fontSize * weightMultiplier;


    return (
        <View style={[styles.container, { width: charWidth, }, containerStyle]}>
            <Animated.View style={bufferAStyle}>
                <Text style={textStyle}>
                    {bufferAValue.current}
                </Text>
            </Animated.View>
            <Animated.View style={bufferBStyle}>
                <Text style={textStyle}>
                    {bufferBValue.current}
                </Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
});


export function AnimatedNumber({ calories = 0, textStyle, unit, unitStyle }: {
    calories: number;
    textStyle?: TextStyle,
    unit?: string
    unitStyle?: TextStyle
}) {

    function formatNumber(num: number) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    const prevCalories = useRef(calories);
    const caloriesStr = calories.toString();
    const prevStr = prevCalories.current.toString();

    const elements = caloriesStr.split('').map((char, index) => {
        // Only animate if this digit changed
        const prevChar = prevStr[index] || '';
        return (
            <AnimatedDoubleBuffer
                key={index}
                value={char}
                textStyle={textStyle}
            />
        );
    });

    useEffect(() => {
        prevCalories.current = calories;
    }, [calories]);

    ;



    return (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            {elements}

            {unit !== undefined && <Text style={unitStyle}>{unit}</Text>}
        </View>

    );
}

