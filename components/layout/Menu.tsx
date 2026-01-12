import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import Animated, { FadeOut, LinearTransition, FadeIn, withTiming, useSharedValue, useAnimatedStyle, } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
export type MenuProps = {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    children: React.ReactNode;
};

export default function Menu({ visible, setVisible, children, }: MenuProps) {
    const insets = useSafeAreaInsets();
    const opacity = useSharedValue(0);
    // keep internal state for modal visibility to allow animation
    const [modalVisible, setModalVisible] = useState(visible);

    useEffect(() => {
        if (visible) {
            setModalVisible(true);
            opacity.value = withTiming(1, { duration: 300 });
        } else {
            console.log('Starting fade out animation');
            opacity.value = withTiming(0, { duration: 300 }, (finished) => {
                if (finished) {
                    scheduleOnRN(setModalVisible, false);
                }
            });
        }
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        }
    });
    return (

        <Modal
            visible={modalVisible}
            onRequestClose={() => setVisible(false)}
            transparent
            animationType="none"
        >
            <Animated.View style={[{ flex: 1 }, animatedStyle]}  >
                <Pressable style={[styles.modalBackground, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
                    onPress={() => {
                        console.log('Background pressed, closing menu');
                        setVisible(false)
                    }}>
                    <Pressable onPress={() => { }} style={styles.modalView}>
                        {children}
                    </Pressable>
                </Pressable>
            </Animated.View>
        </Modal >
    );
}

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    modalView: {
        width: '96%',
        borderRadius: 10,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 1,
        elevation: 5,
    },
});
