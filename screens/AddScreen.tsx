import type { ListRenderItemInfo } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import React, { use, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Platform, Modal } from 'react-native';
import AddEntryMenu from '@components/entries/AddEntryMenu';
import type { ModalStackParamList } from '../types/navigation';

import { useQuery } from '@tanstack/react-query';

import colors from '@styles/colors';
import TouchRipple from '@components/feedback/TouchRipple';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SearchInput from '@components/search/SearchInput';
import { insertEntry, type FoodEntry, type Food } from '@utils/db';
import Menu from '@components/layout/Menu';
import type { EmptyFoodEntry } from '@utils/db';

import * as db from '@utils/db';
import { fetchSearchResults } from '@utils/api';

type Props = NativeStackScreenProps<ModalStackParamList, 'AddScreen'>;

function useRecents(query: string) {
    const [recents, setRecents] = React.useState<EmptyFoodEntry[]>([]);
    useEffect(() => {
        if (query.length > 3) {
            return;
        }
        const regex = new RegExp(query, 'gi');
        db.getRecents().then((rows) => {
            setRecents(rows.filter((row) => regex.test(row.name)));

        }).catch((e) => {
            console.error('Error fetching recents:', e);
        });
    }, [query]);
    return recents;
}


export default function AddScreen({ route, navigation }: Props) {

    const insets = useSafeAreaInsets();
    const [value, setValue] = React.useState('');
    const [debouncedValue, setDebouncedValue] = React.useState('');
    const [modalVisible, setModalVisible] = React.useState(false);
    const [selectedItem, setSelectedItem] = React.useState<EmptyFoodEntry | null>(null);

    const trimmedValue = debouncedValue.trim().toLowerCase();

    const recents = useRecents(trimmedValue);

    let results: EmptyFoodEntry[] = [];

    const { isPending, isError, data, error } = useQuery({
        queryKey: [trimmedValue],
        queryFn: () => fetchSearchResults(trimmedValue),
        enabled: trimmedValue.length > 3
    });

    if (isError) {
        console.error('Error fetching search results:', error);
    }
    if (data && data.length > 0) {
        results = data;
    } else if (trimmedValue.length <= 3) {
        results = recents;
    }

    function handleChangeText(text: string) {
        setValue(text);
    }
    function handleBackPress() {
        navigation.goBack();
    }

    async function addFoodEntry(item: EmptyFoodEntry) {
        if (route.params?.dateStr) {
            try {
                await insertEntry(route.params.dateStr, item as FoodEntry);
            } catch (e) {
                console.error('Error inserting entry:', e);
            }
        }

    }

    function onPressHandler({ item }: ListRenderItemInfo<Food>) {
        setSelectedItem(item);
        setModalVisible(true);
    }

    return (
        <>
            <View style={[styles.container, insets]}>
                <SearchInput
                    data={results}
                    value={value}
                    onChangeText={handleChangeText}
                    onDebounceChange={setDebouncedValue}
                    onBackPress={handleBackPress}
                    renderItem={(info) => (
                        <AutoCompleteSuggestion
                            item={info.item}
                            index={info.index}
                            onPress={() => onPressHandler(info)}
                        />
                    )}
                    placeholder='Search for a food..'
                    keyExtractor={(item) => `${item.food_id}-${item.id ?? ''}`}
                />
            </View>
            <Menu modalVisible={modalVisible} setModalVisible={setModalVisible}>
                <AddEntryMenu
                    selectedItem={selectedItem}
                    setModalVisible={setModalVisible}
                    addFoodEntry={addFoodEntry}
                />
            </Menu>
        </>
    );
}

function AutoCompleteSuggestion({ item, index, onPress }: { item: any; index: number; onPress: () => void }) {
    return (
        <View
            style={[styles.suggestionContainer, index === 0 ? { borderTopWidth: 1, borderTopColor: '#EEE' } : {}]}>
            <TouchRipple onPress={onPress} color={colors.ripple} style={styles.suggestionTextContainer}>
                <Text style={styles.name}>{item.name}</Text>
                {item.brand && <Text style={styles.brand}>{item.brand}</Text>}
                {item.calories && <Text style={styles.calories}>{(item.calories * item.serving_size_g).toFixed(0)} Cal</Text>}
            </TouchRipple >
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        width: '100%',
        alignItems: 'center',
        marginTop: Platform.OS === 'ios' ? 10 : 20,
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
    name: {
        fontSize: 18,
        color: colors.textPrimary,
    },
    brand: {
        fontSize: 14,
        color: colors.textSubtle,
    },
    calories: {
        fontSize: 14,
        color: colors.textSubtle,
        marginTop: 4,
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
    },
    confirmButton: {
    },
    cancelButton: {
        backgroundColor: colors.error,
    },

}); 