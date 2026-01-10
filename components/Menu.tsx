import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import TouchRipple from './TouchRipple';
import colors from '../styles/colors';
import RippleButton from './RippleButton';
import { use } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
export type MenuProps = {
    modalVisible: boolean;
    setModalVisible: (visible: boolean) => void;
    children: React.ReactNode;
};


export default function Menu({ modalVisible, setModalVisible, children, ...rest }: MenuProps) {
    const insets = useSafeAreaInsets();

    return (
        <Modal

            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
            transparent
            animationType="fade"
            {...rest}
        >
            <Pressable style={[styles.modalBackground, { paddingTop: insets.top, paddingBottom: insets.bottom }]} onPress={() => setModalVisible(false)}>
                <Pressable onPress={() => { }} style={styles.modalView}>
                    {children}
                </Pressable>
            </Pressable>
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