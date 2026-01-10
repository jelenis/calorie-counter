import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle, SharedValue, withDelay, SlideInDown, SlideOutUp } from 'react-native-reanimated';
import { useEffect, useLayoutEffect, useRef, ReactNode, Children, useMemo, useState } from 'react';

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
    prevValue?: string;
    textStyle?: TextStyle;
    slideDistance?: number;
    opacityDuration?: number;
    slideDuration?: number;
    delay?: number;
    containerStyle?: ViewStyle;
}

export function AnimatedDoubleBuffer({
    value,
    prevValue,
    textStyle,
    slideDistance = 40,
    opacityDuration = 250,
    slideDuration = 350,
    delay = 0,
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
    const [, force] = useState(0);
    const forceRender = () => force(v => v + 1);

    function bufferASlideOut() {
        bufferAOpacity.value = withDelay(delay, withTiming(0, opacityConfig));
        bufferATranslateY.value = withDelay(delay, withTiming(-slideDistance, slideConfig, () => {
            bufferATranslateY.value = slideDistance; // reset off-screen below
        }));
    }

    function bufferASlideIn() {
        bufferAOpacity.value = withDelay(delay, withTiming(1, opacityConfig));
        bufferATranslateY.value = withDelay(delay, withTiming(0, slideConfig, (finished) => {
            if (finished) activeBufferIndex.value = 0;
        }));
    }

    function bufferBSlideOut() {
        bufferBOpacity.value = withDelay(delay, withTiming(0, opacityConfig));
        bufferBTranslateY.value = withDelay(delay, withTiming(-slideDistance, slideConfig, () => {
            bufferBTranslateY.value = slideDistance; // reset off-screen below
        }));
    }

    function bufferBSlideIn() {
        bufferBOpacity.value = withDelay(delay, withTiming(1, opacityConfig));
        bufferBTranslateY.value = withDelay(delay,
            withTiming(0, slideConfig, (finished) => {
                if (finished) activeBufferIndex.value = 1;
            }));
    }

    useLayoutEffect(() => {
        const next = value;
        const prev = prevValue ?? bufferAValue.current;

        if (activeBufferIndex.value === 0) {
            // Visible A should show previous, hidden B should show the new
            bufferAValue.current = prev;
            if (bufferAValue.current === next) return;
            bufferBValue.current = next;
            forceRender();
            bufferASlideOut();
            bufferBSlideIn();
        } else {
            // Visible B should show previous, hidden A should show the new
            bufferBValue.current = prev;
            if (bufferBValue.current === next) return;
            bufferAValue.current = next;
            forceRender();
            bufferBSlideOut();
            bufferASlideIn();
        }
    }, [value, prevValue, slideDistance, opacityDuration, slideDuration]);

    useEffect(() => { console.log("rendered", value, bufferAValue.current, bufferBValue.current) }, [value]);

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

    // Calculate character dimensions based on fontSize and fontWeight (approximate)
    // this helps prevent layout shifts during animation and enables clipping
    const fontSize = (textStyle as any)?.fontSize || 16;
    const fontWeight = (textStyle as any)?.fontWeight || '400';
    const lineHeight = (textStyle as any)?.lineHeight || Math.round(fontSize * 1.2);

    // Adjust width multiplier based on font weight 
    const weightMultiplier = ['bold', '700', '800', '900'].includes(String(fontWeight)) ? 0.7 : 0.6;
    const charWidth = fontSize * weightMultiplier;

    return (
        <View style={[styles.container, { width: charWidth, height: lineHeight, overflow: 'hidden' }, containerStyle]}>
            <Animated.View style={bufferAStyle}>
                <Text style={[textStyle, bufferAValue.current === ' ' && { opacity: 0 }]}>
                    {bufferAValue.current}
                </Text>
            </Animated.View>
            <Animated.View style={bufferBStyle}>
                <Text style={[textStyle, bufferBValue.current === ' ' && { opacity: 0 }]}>
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

/**
 * 
 * 
 * 
 */
function AnimatedDigit({ char, prevChar, textStyle, delay = 0, duration = 350 }: { char: string; prevChar?: string; textStyle?: TextStyle; delay?: number; duration?: number }) {
    const fontSize = (textStyle as any)?.fontSize || 16;
    const fontWeight = (textStyle as any)?.fontWeight || '400';
    const weightMultiplier = ['bold', '700', '800', '900'].includes(String(fontWeight)) ? 0.7 : 0.6;
    const charWidth = fontSize * weightMultiplier;
    const lineHeight = (textStyle as any)?.lineHeight || Math.round(fontSize * 1.2);

    const prevOpacity = useSharedValue(1);
    const prevTranslateY = useSharedValue(0);
    const nextOpacity = useSharedValue(0);
    const nextTranslateY = useSharedValue(lineHeight);

    // everytime this changes, run the animation, parent is in charge of providing prevChar
    // we just animate prevChar up and out, and char in from below
    useEffect(() => {
        const same = (prevChar ?? char) === char;
        if (same) {
            // Show only current char
            prevOpacity.value = 0;
            prevTranslateY.value = -lineHeight;
            nextOpacity.value = 1;
            nextTranslateY.value = 0;
            return;
        }

        // Start simultaneous animations: prev slides up/out
        // next slides in from below
        // show prev initially and push next below
        prevOpacity.value = 1;
        prevTranslateY.value = 0;

        // make sure next starts below and invisible
        nextOpacity.value = 0;
        nextTranslateY.value = lineHeight; // push below

        const slideDur = duration;
        const fadeOutDur = Math.max(80, Math.floor(duration * 0.5));
        const fadeInDur = Math.max(80, Math.floor(duration * 0.6));

        prevOpacity.value = withDelay(delay, withTiming(0, { duration: fadeOutDur }));
        prevTranslateY.value = withDelay(delay, withTiming(-lineHeight, { duration: slideDur }));
        nextOpacity.value = withDelay(delay, withTiming(1, { duration: fadeInDur }));
        nextTranslateY.value = withDelay(delay, withTiming(0, { duration: slideDur }));

    }, [char, prevChar, delay, duration, lineHeight]);

    const prevStyle = useAnimatedStyle(() => ({
        position: 'relative',
        opacity: prevOpacity.value,
        transform: [{ translateY: prevTranslateY.value }],
    }));

    const nextStyle = useAnimatedStyle(() => ({
        position: 'absolute',
        opacity: nextOpacity.value,
        transform: [{ translateY: nextTranslateY.value }],
    }));

    return (
        <View style={{ overflow: 'hidden', height: lineHeight, width: charWidth, alignItems: 'center' }}>
            <Animated.View style={prevStyle}>
                <Text style={[textStyle, (prevChar === ' ' || prevChar === undefined) && { opacity: 0 }]}>
                    {prevChar ?? char}
                </Text>
            </Animated.View>
            <Animated.View style={nextStyle}>
                <Text style={[textStyle, char === ' ' && { opacity: 0 }]}>
                    {char}
                </Text>
            </Animated.View>
        </View>
    );
}


export function AnimatedNumber({ calories = 0, textStyle, unit, unitStyle, updateDelay = 100 }: {
    calories: number;
    textStyle?: TextStyle,
    unit?: string
    unitStyle?: TextStyle,
    updateDelay?: number
}) {

    const [displayedCalories, setDisplayedCalories] = useState(calories);
    const prevCalories = useRef<number | null>(null);

    // Delay updating the displayed number so users can perceive the change
    useEffect(() => {
        const t = setTimeout(() => setDisplayedCalories(calories), updateDelay);
        return () => clearTimeout(t);
    }, [calories, updateDelay]);

    console.log(displayedCalories)
    const elements = useMemo(() => {
        const currentStr = displayedCalories.toString();
        const prevBase = (prevCalories.current ?? displayedCalories).toString();
        const maxLen = Math.max(currentStr.length, prevBase.length);

        // add padding so new digits appear on the right
        // in the correct position
        const currStrPadded = currentStr.padStart(maxLen, ' ');
        const prevStrPadded = prevBase.padStart(maxLen, ' ');

        // Right-align digits and animate per position
        return currStrPadded.split('').map((char, index) => (
            <AnimatedDigit
                key={index}
                char={char}
                prevChar={prevStrPadded[index] ?? ' '}
                textStyle={textStyle} delay={index * 10} />
        ));

    }, [displayedCalories, textStyle]);

    useEffect(() => {
        prevCalories.current = displayedCalories;
    }, [displayedCalories]);

    return (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            {elements}
            {unit !== undefined && <Text style={unitStyle}>{unit}</Text>}
        </View>
    );
}

