import { StyleSheet, Text, View } from "react-native";
import React from "react";

import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import colors from "@styles/colors";
import TouchRipple from "@components/feedback/TouchRipple";

import type { GestureResponderEvent } from "react-native";

export default function AddButton({ onPress }: { onPress: () => void }) {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    function onPressIn(e: GestureResponderEvent) {
        scale.value = withSpring(0.95, { dampingRatio: 0.5 });
    }
    function onPressOut(e: GestureResponderEvent) {
        scale.value = withSpring(1, { duration: 600, dampingRatio: 0.5, });
    }

    return (
        <View style={styles.outerContainer}>
            <Animated.View style={[animatedStyle, styles.container]}>
                <TouchRipple onPress={onPress}
                    onPressIn={onPressIn}
                    onPressOut={onPressOut}>
                    <Text style={styles.plus}>+</Text>
                </TouchRipple >
            </Animated.View >
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.textPrimary,
        overflow: 'hidden'
    },
    outerContainer: {
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 30,
        right: 30,
    },
    plus: {
        color: 'white',
        fontSize: 40,
        lineHeight: 40,
        fontWeight: '600',
    },
})
