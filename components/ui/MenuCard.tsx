import React from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Pressable, Keyboard } from 'react-native';
import colors from '@styles/colors';
import { cardShadow } from '@styles/card';

type Props = { title: string; children: React.ReactNode };

export default function MenuCard({ title, children }: Props) {

    const insets = useSafeAreaInsets();
    return (
        <View
            style={[styles.safeArea, { paddingTop: insets.top }]}  >
            <Pressable style={styles.container} onPress={Keyboard.dismiss}>
                <View style={{ width: '100%', alignSelf: 'flex-start' }}>
                    <Text style={styles.titleText}>{title}</Text>
                </View>
                <View style={[styles.innerContainer, cardShadow]}>
                    {children}
                </View>
            </Pressable>
        </View >
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    container: {
        alignItems: 'center',
        backgroundColor: 'transparent',
        marginTop: 10,
        width: '100%',
        maxWidth: 650,
    },
    innerContainer: {
        alignItems: 'flex-start',
        width: '100%',
        padding: 15,
        paddingTop: 35,
        borderRadius: 30,
        borderBottomRightRadius: 30,
        borderBottomLeftRadius: 30,
        backgroundColor: 'white',
        paddingBottom: 25,
    },
    titleText: {
        color: colors.textSubtle,
        fontSize: 28,
        fontWeight: '800',
        padding: 15,
    },
});
