
import { View, StyleSheet, Text } from 'react-native';
import colors from '@styles/colors';
import Animated, { Extrapolation, useAnimatedStyle, useSharedValue, interpolate, runOnJS, useAnimatedReaction, LinearTransition, withSpring, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { scheduleOnRN } from 'react-native-worklets';
import { useMemo, useEffect, useState } from 'react';

function clamp(value: number, min: number, max: number) {
    'worklet';
    return Math.min(Math.max(value, min), max);
}
type SliderProps = {
    max?: number;
    min?: number;
    value?: number;
    step?: number;
    tickLabels?: number[];
    showTicks?: boolean;
    onChange?: (value: number) => void;
    onUpdate?: (value: number) => void;
};

function getMinorTicks(ticks: number[]) {
    const minor = [];
    for (let i = 1; i < ticks.length; i++) {
        const prev = ticks[i - 1];
        const curr = ticks[i];
        minor.push(Math.floor((prev + curr) / 2));
    }
    return minor;
}
export default function Slider({
    max = 1000,
    min = 0,
    value = 0,
    step = 100,
    tickLabels = [],
    showTicks = false, onChange = (value: number) => { },
    onUpdate = (value: number) => { } }: SliderProps) {
    const trackW = useSharedValue(0);
    const trackH = useSharedValue(0);
    const [trackWidth, setTrackWidth] = useState(0);
    const knobX = useSharedValue(0);
    const startX = useSharedValue(0);
    const steppedValue = useSharedValue(value);
    const isPanning = useSharedValue(false);
    const KnobSize = 24;

    const minorTicks = useMemo(() => getMinorTicks(tickLabels), [tickLabels]);
    const ticks = Array.from({ length: Math.round((max - min) / step) + 1 }, (_, i) => i);

    const pan = Gesture.Pan()
        .onBegin(() => {
            startX.value = knobX.value;
            isPanning.value = true;
        })
        .onUpdate((e) => {

            const inputMin = Math.round(-KnobSize / 2);
            const inputMax = trackW.value;
            const nx = clamp(startX.value + e.translationX, inputMin, inputMax);
            const raw = interpolate(nx, [inputMin, inputMax], [min, max], Extrapolation.CLAMP);

            // quantize to step
            steppedValue.value = Math.round(raw / step) * step;
            // re-interpolate to position
            knobX.value = interpolate(steppedValue.value, [min, max], [0, inputMax], Extrapolation.CLAMP)

        }).onEnd(() => {
            isPanning.value = false;
            scheduleOnRN(onChange, steppedValue.value);
        });
    const knobStyle = useAnimatedStyle(() => ({ transform: [{ translateX: knobX.value }], }));

    const fillStyle = useAnimatedStyle(() => ({
        position: "absolute",
        height: '100%',
        borderRadius: 4,
        width: knobX.value + KnobSize / 2,
        backgroundColor: colors.textPrimary,
    }));


    useAnimatedReaction(
        () => ({ v: steppedValue.value, dragging: isPanning.value }),
        (curr, prev) => {
            if (!prev) return;
            if (curr.v !== prev.v && curr.dragging) {
                scheduleOnRN(onUpdate, curr.v);
            }
        },
        []
    );

    function renderTicks(i: number) {

        const tick = <View style={{
            backgroundColor: "rgba(0,0,0,0.25)",
            width: 2,
            height: 4,
        }} />;
        const currentValue = i * step + min;

        if (tickLabels.includes(currentValue)) {
            return (
                <View key={i} style={{ alignItems: 'center', width: 0 }}>
                    {tick}
                    <Text style={{
                        position: 'absolute',
                        top: 8,
                        minWidth: 50,
                        fontSize: 10,
                        color: "rgba(0,0,0,0.5)",
                        textAlign: 'center',
                    }}>
                        {currentValue}
                    </Text>
                </View>
            );
        } else if (minorTicks.includes(currentValue) || i == 0 || i == ticks.length - 1) {
            return (
                <View key={i} style={{ alignItems: 'center', width: 0 }}>
                    {tick}
                </View>
            );
        }
        return <View key={i} style={{ width: 0 }} />;
    }

    // Sync knob position to external value changes when not dragging and track width is known
    useEffect(() => {
        if (trackWidth <= 0) return;
        if (isPanning.value) return;
        const snapped = Math.round(value / step) * step;
        steppedValue.value = snapped;
        knobX.value = interpolate(snapped, [min, max], [0, trackWidth], Extrapolation.CLAMP);
    }, [value, min, max, step, trackWidth]);

    return (
        <View style={styles.sliderOuterContainer}>

            <View
                style={styles.sliderContainer}
                onLayout={(e) => {
                    const w = e.nativeEvent.layout.width;
                    trackW.value = w;
                    trackH.value = e.nativeEvent.layout.height;
                    setTrackWidth(w);
                }}
            >
                <Animated.View style={fillStyle} />
                <GestureDetector gesture={pan}>
                    <Animated.View
                        style={[
                            {
                                position: "relative",
                                width: KnobSize,
                                height: KnobSize,
                                borderRadius: 12,
                                backgroundColor: "white",
                                borderWidth: 1,
                                borderColor: "rgba(0,0,0,0.2)",
                                shadowColor: "#000",
                                shadowOffset: {
                                    width: 0,
                                    height: 2,
                                },
                                shadowOpacity: 0.25,
                                shadowRadius: 1,
                                elevation: 5,

                                top: (10 - KnobSize) / 2,
                                left: Math.round(-KnobSize / 2),
                            },
                            knobStyle,
                        ]}
                    />
                </GestureDetector>
            </View>

            {showTicks && <View pointerEvents="none" style={styles.ticksRow}>
                {ticks.map((i) => renderTicks(i))}
            </View>}

        </View>
    );
}


const styles = StyleSheet.create({
    ticksRow: {
        position: "relative",
        top: 0,
        left: 0,
        right: 0,
        marginTop: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    sliderOuterContainer: {
        width: '100%', // or any fixed value you want
        alignItems: 'stretch',
        justifyContent: 'center',
        alignSelf: 'center', // optional, to center in parent
    },
    sliderContainer: {
        flexDirection: 'row',
        backgroundColor: colors.sliderTrack,
        borderRadius: 4,
        height: 10,
        width: '100%',
    },
});
