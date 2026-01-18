import type { ListRenderItemInfo } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import LottieView from 'lottie-react-native';
import React, { use, useCallback, useDeferredValue, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Platform, TextInput } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import AddEntryMenu from '@components/entries/AddEntryMenu';
import type { ModalStackParamList } from '@utils/types';

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
import { useFocusEffect } from '@react-navigation/native';

const MINIMUM_SEARCH_LEN = 3;

type Props = NativeStackScreenProps<ModalStackParamList, 'AddScreen'>;

function useRecents(query: string) {
    const [recents, setRecents] = React.useState<EmptyFoodEntry[]>([]);
    const [filteredRecents, setFilteredRecents] = React.useState<EmptyFoodEntry[]>([]);
    useEffect(() => {
        const regex = new RegExp(query, 'gi');
        db.getRecents().then((rows) => {
            setRecents(rows);
        }).catch((e) => {
            console.error('Error fetching recents:', e);
        });
    }, []);
    useEffect(() => {
        const regex = new RegExp(query, 'gi');
        if (query.length === 0) {
            setFilteredRecents([...recents]);
        } else {
            setFilteredRecents(recents.filter((row) => regex.test(row.name)));
        }
    }, [query, recents]);

    return filteredRecents;
}


export default function AddScreen({ route, navigation }: Props) {
    const insets = useSafeAreaInsets();
    const [value, setValue] = React.useState('');
    const [debouncedValue, setDebouncedValue] = React.useState('');
    const [modalVisible, setModalVisible] = React.useState(false);
    const [selectedItem, setSelectedItem] = React.useState<EmptyFoodEntry | null>(null);
    const searchInputRef = useRef<TextInput>(null);
    const animation = React.useRef<LottieView>(null);

    // Derived input values
    const trimmedValue = debouncedValue.trim().toLowerCase();
    const recents = useRecents(trimmedValue);

    useFocusEffect(
        useCallback(() => {
            const rafId = requestAnimationFrame(() => {
                searchInputRef.current?.focus();
            });

            return () => {
                cancelAnimationFrame(rafId);
                searchInputRef.current?.blur();
            };
        }, []),
    );

    // Search query
    const { isError, isFetching, data, error } = useQuery({
        queryKey: [trimmedValue],
        queryFn: () => fetchSearchResults(trimmedValue),
        enabled: trimmedValue.length > MINIMUM_SEARCH_LEN && recents.length < 15,
        placeholderData: (prev) => {
            return prev;
        },

    });

    // Log errors once
    useEffect(() => {
        if (isError) {
            console.error('Error fetching search results:', error);
        }
    }, [isError, error]);

    // Prefer server results, fall back to recents for short queries
    const results: EmptyFoodEntry[] = useMemo(() => {
        if (data && data.length > 0) return data;
        if (trimmedValue.length <= 3) {
            // on first render with short query, show recents
            return recents;
        }
        return [];
    }, [data, recents, trimmedValue]);


    const handleChangeText = (text: string) => setValue(text);
    const handleBackPress = () => navigation.goBack();
    const onPressHandler = ({ item }: ListRenderItemInfo<Food>) => {
        setSelectedItem(item);
        setModalVisible(true);
    };
    const addFoodEntry = async (item: EmptyFoodEntry) => {

        if (route.params?.dateStr) {
            try {
                await insertEntry(route.params.dateStr, item as FoodEntry);
            } catch (e: any) {
                console.error(e.message);
            }
        }
    };

    let showLoadingState = false;
    if (results.length === 0 && isFetching) {
        showLoadingState = true;
    }
    // showLoadingState = true; // testtest

    return (
        <>
            <View style={[styles.container, insets]}>
                <SearchInput
                    inputRef={searchInputRef}
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
                            isFetching={isFetching}
                        />
                    )}
                    isLoading={showLoadingState}
                    loadingItem={
                        <Animated.View
                            entering={FadeIn}
                            exiting={FadeOut}
                            style={{
                                position: 'relative',
                                top: -200,
                                left: 0,
                                right: 0,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                            {/* <Text style={{ color: colors.textSubtle }}>Loading...</Text> */}
                            <LottieView
                                autoPlay
                                ref={animation}
                                style={{

                                    width: 400,
                                    height: 400,
                                }}
                                source={require('@assets/loading.json')}
                            />

                        </Animated.View>
                    }

                    placeholder='Search for a food..'
                    keyExtractor={(item) => `${item.food_id}-${item.id ?? ''}`}
                />
            </View>
            <Menu visible={modalVisible} setVisible={setModalVisible}>
                <AddEntryMenu
                    selectedItem={selectedItem}
                    addFoodEntry={addFoodEntry}
                    closeModal={() => setModalVisible(false)}
                />
            </Menu>
        </>
    );
}

function AutoCompleteSuggestion({ item, index, onPress, isFetching }:
    { item: any; index: number; onPress: () => void; isFetching: boolean }) {
    return (
        <View
            style={[styles.suggestionContainer, index === 0 ? { borderTopWidth: 1, borderTopColor: '#EEE' } : {}]}>
            <TouchRipple onPress={onPress} color={colors.ripple} style={styles.suggestionTextContainer}>
                <Text style={[styles.name, isFetching ? styles.suggestionPending : {}]}>{item.name}</Text>
                {Boolean(item.brand) && <Text style={styles.brand}>{item.brand}</Text>}
                {Boolean(item.calories) && <Text style={styles.calories}>{(item.calories * item.serving_size_g).toFixed(0)} Cal</Text>}
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
    suggestionPending: {
        opacity: 0.5,
        color: colors.textSubtle,
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