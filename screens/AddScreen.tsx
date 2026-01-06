import React from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, type ListRenderItem, ListRenderItemInfo, } from 'react-native';
import Animated, { FadeInUp, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { StackScreenProps } from '@react-navigation/stack';
import colors from '../styles/colors';
import Input from '../components/Input';
import TouchRipple from '../components/TouchRipple';

type Props = StackScreenProps<any>;

export default function AddScreen({ route }: Props) {
    const { data } = route.params;
    // console.log(data)

    return (
        <View style={styles.container}>
            <Text>Add Entry Screen</Text>
            <AutocompleteInput
                data={data}
                onChangeText={(text) => { }}
                renderItem={AutoCompleteSuggestion}
            />
        </View>
    );

}

function AutoCompleteSuggestion({ item, index }: { item: any; index: number; }) {
    return (
        <View
            style={[styles.suggestionContainer, index === 0 ? { borderTopWidth: 1, borderTopColor: '#EEE' } : {}]}>
            <TouchRipple color='#cececeff'>
                <View>
                    <Text style={styles.suggestionText}>{item.name}</Text>
                </View>
            </TouchRipple>
        </View >
    )
}


type AutocompleteInputProps = {
    onChangeText: (text: string) => void;
    renderItem: (info: ListRenderItemInfo<any>) => React.ReactElement | null;
    data: any[];
} & TextInput['props'];

function AutocompleteInput({ data, renderItem, onChangeText, ...rest }: AutocompleteInputProps) {
    const [value, setValue] = React.useState('');

    const filteredData = data.filter(entry =>
        value && entry.name.toLowerCase().includes(value.toLowerCase())
    );

    function AnimatedRow(itemData: ListRenderItemInfo<any>) {
        return (
            <Animated.View layout={LinearTransition}>
                {renderItem(itemData)}
            </Animated.View>
        );
    }

    function onChangeTextHandler(text: string) {
        setValue(text);
        onChangeText && onChangeText(text);
    }

    return (
        <>
            <Input onChangeText={onChangeTextHandler} value={value} {...rest} />
            <FlatList
                showsVerticalScrollIndicator={true}
                alwaysBounceVertical={false}
                style={styles.flatList}
                data={filteredData}
                renderItem={AnimatedRow}
                keyExtractor={(item) => item.id}

            />
        </>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        width: '100%',
        maxWidth: 600,
        alignItems: 'center',
        padding: '5%',
    },
    suggestionContainer: {
        flex: 1,
        width: '100%',
        backgroundColor: 'white',
        minHeight: 60,
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    suggestionText: {
        fontSize: 18,
        color: colors.textPrimary,

    },
    flatList: {
        marginTop: 10,
        width: '100%',
        flex: 1,
    }

}); 