import { View, StyleSheet } from 'react-native';
import Animated, { withSpring, useAnimatedStyle } from 'react-native-reanimated';
import { useSharedValue } from 'react-native-reanimated';
import { useEffect } from 'react';
import colors from '@styles/colors';

export default function ProgressBar({ progress = 0 }) {
    const width = useSharedValue(0);

    useEffect(() => {
        const clamped = Math.min(100, Math.max(0, progress));
        width.value = withSpring(clamped);
    }, [progress]);

    const animatedWidth = useAnimatedStyle(() => ({
        width: `${width.value}%`
    }));

    return (
        <View style={styles.container}>
            <Animated.View
                style={[StyleSheet.absoluteFill,
                { backgroundColor: colors.textPrimary }, animatedWidth]} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: 17,
        width: '80%',
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
        overflow: 'hidden',
    }
});
