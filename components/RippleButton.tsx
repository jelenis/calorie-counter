import React from 'react';
import { Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import TouchRipple from './TouchRipple';
import { View } from 'react-native';
import colors from '../styles/colors';

interface RippleButtonProps {
    text: string;
    onPress?: () => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
    containerStyle?: ViewStyle;
    children?: React.ReactNode;
}

export default function RippleButton({ text, onPress, style = {}, textStyle, containerStyle = {}, children }: RippleButtonProps) {

    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    function onPressIn() {
        scale.value = withSpring(0.97, { dampingRatio: 0.5 });

    }
    function onPressOut() {
        scale.value = withSpring(1, { duration: 300, dampingRatio: 0.5, });
    }
    return (
        <Animated.View style={[styles.container, animatedStyle, containerStyle]}>
            <TouchRipple
                onPress={onPress}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                style={[styles.button, style]}
                color={colors.ripple}>
                <Text style={[styles.text, textStyle]}>{text}</Text>
                {children}
            </TouchRipple>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    button: {
        paddingVertical: 4,
        paddingHorizontal: 12,
        backgroundColor: colors.textPrimary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

