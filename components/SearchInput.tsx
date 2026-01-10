
import React, { useEffect } from 'react';
import { View, TextInput, FlatList, ListRenderItemInfo, StyleSheet } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import Entypo from '@expo/vector-icons/Entypo';
import Input from './Input';
import useDebounce from '../hooks/useDebounce';

export type SearchInputProps = {
    value: string;
    onChangeText: (text: string) => void;
    onBackPress: () => void;
    renderItem: (info: ListRenderItemInfo<any>) => React.ReactElement | null;
    data: any[];
    keyExtractor?: (item: any, index: number) => string;
    placeholder?: string;
} & TextInput['props'];

const DEBOUNCE_TIME = 200;

export default function SearchInput({ data, keyExtractor = (item) => item.id, renderItem, onChangeText, value, onBackPress, placeholder = 'Search...', ...rest }: SearchInputProps) {

    const debouncedValue = useDebounce(value, DEBOUNCE_TIME);
    useEffect(() => onChangeText(debouncedValue), [debouncedValue]);

    function AnimatedRow(itemData: ListRenderItemInfo<any>) {
        return (
            <Animated.View layout={LinearTransition}>
                {renderItem({ ...itemData })}
            </Animated.View>
        );
    }

    function onChangeTextInternal(text: string) {
        onChangeText(text);
    }
    const filteredData = data.filter(entry =>
        debouncedValue && entry.name.toLowerCase().includes(debouncedValue.toLowerCase())
    );

    return (
        <>
            <View style={styles.searchBar}>
                <Entypo onPress={onBackPress} name="chevron-small-left" size={24} color="black" />
                <Input
                    placeholder={placeholder}
                    onChangeText={onChangeTextInternal}
                    value={value}
                    {...rest} />
            </View>
            <FlatList
                showsVerticalScrollIndicator={true}
                alwaysBounceVertical={false}
                style={styles.resultsList}
                data={filteredData}
                renderItem={AnimatedRow}
                keyExtractor={keyExtractor}
            />
        </>
    );
}

const styles = StyleSheet.create({
    searchBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: '10%',
    },
    resultsList: {
        marginTop: 10,
        width: '100%',
        flex: 1,
    },
});
