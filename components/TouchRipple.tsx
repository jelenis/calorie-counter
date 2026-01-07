import { Pressable, View } from "react-native";
import React from "react";

import Animated, {
    useSharedValue, useAnimatedStyle, withTiming, cancelAnimation, type WithTimingConfig
} from "react-native-reanimated";

import type { GestureResponderEvent, PressableProps, ViewStyle } from "react-native";

interface TouchRippleProps {
    animationProps?: WithTimingConfig;
    children: React.ReactNode;
    onPressIn?: (e: GestureResponderEvent) => void;
    onPressOut?: (e: GestureResponderEvent) => void;
    style: ViewStyle
    color?: string;
}

export default function TouchRipple({
    animationProps = {},
    children,
    onPressIn,
    onPressOut,
    color = 'white',
    style = {},
    ...rest
}: TouchRippleProps & PressableProps) {
    const [size, setSize] = React.useState({ width: 0, height: 0 });
    const opacity = useSharedValue(0);
    const centerX = useSharedValue(3);
    const centerY = useSharedValue(3);
    const rippleScale = useSharedValue(0);

    const onLayout = (e: any) => {
        setSize({
            width: e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height,
        });
    };

    const animatedRipple = useAnimatedStyle(() => ({
        transform: [
            { translateX: centerX.value },
            { translateY: centerY.value },
            { scale: rippleScale.value },
        ],
        opacity: opacity.value,
    }));

    function onPressHandler(e: GestureResponderEvent) {
        cancelAnimation(opacity);
        cancelAnimation(rippleScale);
        const x = e.nativeEvent.locationX;
        const y = e.nativeEvent.locationY;
        centerX.value = x;
        centerY.value = y;

        rippleScale.value = 0;
        rippleScale.value = withTiming(3, animationProps);
        opacity.value = withTiming(0.3, animationProps);
        if (onPressIn) onPressIn(e);
    }

    function onPressOutHandler(e: GestureResponderEvent) {
        cancelAnimation(opacity);
        opacity.value = withTiming(0, { duration: 600, });
        if (onPressOut) onPressOut(e);
    }

    return (

        <Pressable
            onLayout={onLayout}
            onPressIn={onPressHandler}
            onPressOut={onPressOutHandler}
            style={[{ flex: 1, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', width: '100%' }, style]}
            {...rest}
        >
            <Animated.View
                style={[{
                    backgroundColor: color,
                    width: size.width,
                    height: size.height,
                    borderRadius: Math.max(size.width, size.height) / 2,
                    position: 'absolute',
                    top: -size.height / 2,
                    left: -size.width / 2,
                }, animatedRipple]}
            />
            {children}
        </Pressable>

    );
}
