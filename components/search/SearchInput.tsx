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
    keyExtractor: (item: any, index: number) => string;
    placeholder?: string;
    isLoading?: boolean;
    loadingItem?: React.ReactElement | null;
    inputRef?: React.Ref<TextInput>;
} & TextInput['props'];

const DEBOUNCE_TIME = 450;

export default function SearchInput(
    { data,
        keyExtractor,
        renderItem,
        onDebounceChange, onChangeText, value,
        onBackPress,
        loadingItem = null,
        placeholder = 'Search...',
        isLoading = false,
        inputRef,
        ...rest }: SearchInputProps) {

    const debouncedValue = useDebounce(value, DEBOUNCE_TIME);
    const lastEmitted = React.useRef<string>(value);
    useEffect(() => {
        // dont call onChangeText if value is the same
        // this is so the enter key wont re-trigger onChangeText again
        // if were already searching
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
        <View style={styles.container}>
            <View style={styles.searchBar}>
                <Entypo onPress={onBackPress} name="chevron-small-left" size={24} color="black" />
                <Input
                    ref={inputRef}
                    placeholder={placeholder}
                    onChangeText={onChangeTextInternal}
                    value={value}
                    onSubmitEditing={handleSubmit}
                    {...rest} />
            </View>

            {/* show loading animation if list is empty 
            (This should only happend when theres no recents) */}
            {isLoading ? loadingItem : (
                <FlatList
                    showsVerticalScrollIndicator={true}
                    style={{ marginBottom: 20 }}
                    alwaysBounceVertical={false}
                    data={data}
                    renderItem={AnimatedRow}
                    keyExtractor={keyExtractor}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignSelf: 'stretch',
    },
    searchBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 10,
        width: '100%',
    },
    resultsList: {
        marginTop: 10,
        width: '100%',
        flex: 1,
    },
});
