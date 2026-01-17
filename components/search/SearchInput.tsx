import React, { useEffect, useRef } from 'react';
import { View, TextInput, FlatList, ListRenderItemInfo, StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeOutDown, LinearTransition } from 'react-native-reanimated';
import Entypo from '@expo/vector-icons/Entypo';
import Input from '@components/ui/Input';
import useDebounce from '@hooks/useDebounce';

export type SearchInputProps = {
    value: string;
    onChangeText: (text: string) => void;
    onDebounceChange: (text: string) => void;
    onBackPress: () => void;
    renderItem: (info: ListRenderItemInfo<any>) => React.ReactElement | null;
    data: any[];
    keyExtractor?: (item: any, index: number) => string;
    placeholder?: string;
    isLoading?: boolean;
    loadingItem?: React.ReactElement | null;
} & TextInput['props'];

const DEBOUNCE_TIME = 450;

export default function SearchInput(
    { data,
        keyExtractor = (item) => item.id,
        renderItem,
        onDebounceChange, onChangeText, value,
        onBackPress,
        loadingItem = null,
        placeholder = 'Search...',
        isLoading = false,
        ...rest }: SearchInputProps) {

    const debouncedValue = useDebounce(value, DEBOUNCE_TIME);
    const lastEmitted = React.useRef<string>(value);
    useEffect(() => {
        // dont call onChangeText if value is the same
        // this is the enter key can be handled without triggering onChangeText again
        if (debouncedValue === lastEmitted.current) return;
        lastEmitted.current = debouncedValue;
        onDebounceChange(debouncedValue);
    }, [debouncedValue]);

    function AnimatedRow(itemData: ListRenderItemInfo<any>) {
        return (
            <Animated.View exiting={FadeOutDown} entering={FadeInUp} layout={LinearTransition}>
                {renderItem({ ...itemData })}
            </Animated.View>
        );
    }

    function onChangeTextInternal(text: string) {
        onChangeText(text);
    }
    function handleSubmit() {
        lastEmitted.current = value;
        onDebounceChange(value);
    }


    return (
        <>
            <View style={styles.searchBar}>
                <Entypo onPress={onBackPress} name="chevron-small-left" size={24} color="black" />
                <Input
                    placeholder={placeholder}
                    onChangeText={onChangeTextInternal}
                    value={value}
                    onSubmitEditing={handleSubmit}
                    {...rest} />
            </View>
            {isLoading ? loadingItem : <FlatList

                showsVerticalScrollIndicator={true}
                alwaysBounceVertical={false}
                style={styles.resultsList}
                data={data}
                renderItem={AnimatedRow}
                keyExtractor={keyExtractor}
            />}
        </>
    );
}

const styles = StyleSheet.create({
    searchBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 10,

    },
    resultsList: {
        marginTop: 10,
        width: '100%',
        flex: 1,
    },
});
