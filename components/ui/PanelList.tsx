import { ReactNode, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '@styles/colors';

import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Directions } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';





export default function PanelList({ panels = [], activeColors = [colors.textPrimary, colors.orange, colors.success] }
    : { panels: ReactNode[], activeColors?: string[] }
) {
    const [activePanel, setActivePanel] = useState(0);
    const [panelWidth, setPanelWidth] = useState(0);

    const offset = useSharedValue(0)



    function updateIndex(dir: number) {
        setActivePanel(prev => Math.min(panels.length - 1, Math.max(prev + dir, 0)))

    }

    useEffect(() => {
        // keep activePanel valid if panels change
        setActivePanel(prev => Math.min(prev, Math.max(panels.length - 1, 0)));
    }, [panels.length]);

    useEffect(() => {
        if (panelWidth <= 0) return;
        // move the row by full-panel widths, panelWidth
        const dist = -activePanel * panelWidth;
        offset.value = withTiming(dist, { duration: 350 });
    }, [activePanel, panelWidth]);



    const leftSwipe = Gesture.Fling()
        .direction(Directions.LEFT)
        .onStart(() => {

        })
        .onEnd(() => {
            scheduleOnRN(updateIndex, 1)
        });

    const rightSwipe = Gesture.Fling()
        .direction(Directions.RIGHT)
        .onEnd(() => {
            scheduleOnRN(updateIndex, -1)
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: offset.value }]
    }))
    const combined = Gesture.Exclusive(leftSwipe, rightSwipe);
    return (
        // stretch to full width of parent container
        <View style={{ margin: 0, width: '100%', }} onLayout={(e) => {
            const w = e.nativeEvent.layout.width;
            setPanelWidth(w);
        }}>
            <GestureDetector gesture={combined}>
                <Animated.View
                    style={[
                        {
                            flexDirection: 'row',
                            // Measure the available width from parent
                            width: panelWidth * panels.length
                        },
                        animatedStyle,
                    ]}
                >
                    {panels.map((panel, index) => (
                        <Animated.View
                            key={index}
                            style={{
                                position: 'relative',
                                justifyContent: 'center',
                                transitionProperty: 'opacity',
                                transitionDuration: 500,
                                width: panelWidth,
                                opacity: index === activePanel ? 1 : 0,
                            }}
                            pointerEvents={index === activePanel ? 'auto' : 'none'}
                        >
                            {panel}
                        </Animated.View>
                    ))}
                </Animated.View>
            </GestureDetector>

            <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
            }}>
                {panels.map((p, index) => <Animated.View key={index} style={[styles.circle, {
                    backgroundColor: (index === activePanel)
                        ? (activeColors[activePanel] || colors.textPrimary) : colors.placeholder,
                    transitionProperty: 'backgroundColor',
                    transitionDuration: 400
                }]}></Animated.View>)}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    circle: {
        margin: 10,
        marginTop: 20,
        borderRadius: 5,
        width: 10,
        height: 10,
        backgroundColor: colors.textSubtle,

    }
})