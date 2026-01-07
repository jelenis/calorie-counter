import type { ListRenderItemInfo } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ModalStackParamList, Food } from '../types/navigation';

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Platform } from 'react-native';
import Animated, { useSharedValue, LinearTransition, } from 'react-native-reanimated';
import colors from '../styles/colors';
import TouchRipple from '../components/TouchRipple';
import Entypo from '@expo/vector-icons/Entypo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AutocompleteInput from '../components/AutocompleteInput';

type Props = NativeStackScreenProps<ModalStackParamList, 'AddModal'>;

export default function AddScreen({ route, navigation }: Props) {
    const data = route.params?.data ?? [];
    const colorProgress = useSharedValue(0);
    const insets = useSafeAreaInsets();
    const [value, setValue] = React.useState('');

    function handleChangeText(text: string) {
        setValue(text);
        // Add any additional logic here
    }

    function handleBackPress() {
        navigation.goBack();
    }

    return (
        <View style={[styles.container, insets]}>
            <AutocompleteInput
                data={data}
                value={value}
                onChangeText={handleChangeText}
                onBackPress={handleBackPress}
                renderItem={AutoCompleteSuggestion}
                placeholder='Search for food items...'
            />
        </View>
    );
}

function AutoCompleteSuggestion({ item, index }: { item: any; index: number; }) {
    return (
        <View
            style={[styles.suggestionContainer, index === 0 ? { borderTopWidth: 1, borderTopColor: '#EEE' } : {}]}>
            <TouchRipple color='#cececeff' style={styles.suggestionTextContainer}>
                <Text style={styles.suggestionText}>{item.name}</Text>
            </TouchRipple >
        </View >
    )
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        width: '100%',
        maxWidth: 600,
        alignItems: 'center',
        marginTop: Platform.OS === 'ios' ? 0 : 20,
    },
    suggestionContainer: {
        flex: 1,
        width: '100%',
        backgroundColor: 'white',
        minHeight: 30,
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    suggestionTextContainer: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        width: '100%',
        alignItems: 'flex-start',
    },
    suggestionText: {
        fontSize: 18,
        color: colors.textPrimary,

    },
    searchContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: '10%',

    },
    flatList: {
        marginTop: 10,
        width: '100%',
        flex: 1,
    }

}); 