import type { ListRenderItemInfo } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Platform, Modal } from 'react-native';
import AddEntryMenu from '@components/entries/AddEntryMenu';


import colors from '@styles/colors';
import TouchRipple from '@components/feedback/TouchRipple';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SearchInput from '@components/search/SearchInput';
import { insertEntry, type FoodEntry, type Food } from '@utils/db';
import Menu from '@components/layout/Menu';
import type { ModalStackParamList } from '../types/navigation';


type Props = NativeStackScreenProps<ModalStackParamList, 'AddScreen'>;


const sampleFoodEntries: Food[] = [
    {
        "id": 1,
        "upc": "1633636543505",
        "name": "Granola, Cinnamon Raisin",
        "brand": "Michele's",
        "category": "Cereal",
        "serving_size_g": 28,
        "serving_text": "1/4 cup (28 g)",
        "calories": 5.0,
        "protein": 0.1071,
        "fat": 0.25,
        "carbs": 0.5714
    },
    {
        "id": 2,
        "upc": "070470004387",
        "name": "Greek Yogurt, Plain, Non-Fat",
        "brand": "Chobani",
        "category": "Dairy",
        "serving_size_g": 170,
        "serving_text": "3/4 cup (170 g)",

        "calories": 0.5294,
        "protein": 0.0941,
        "fat": 0.0,
        "carbs": 0.0353
    },
    {
        "id": 3,
        "upc": "051500255352",
        "name": "Peanut Butter, Creamy",
        "brand": "Jif",
        "category": "Nut Butter",
        "serving_size_g": 32,
        "serving_text": "2 tbsp (32 g)",


        "calories": 0.59375,
        "protein": 0.2188,
        "fat": 0.5,
        "carbs": 0.25
    },
    {
        "id": 4,
        "upc": "0000000004017",
        "name": "Apple, Raw, With Skin",
        "brand": "Heinz",
        "category": "Fruit",
        "serving_size_g": 182,
        "serving_text": "1 medium (182 g)",


        "calories": 0.522,
        "protein": 0.0027,
        "fat": 0.0016,
        "carbs": 0.1374
    },
    {
        "id": 5,
        "upc": "023700162049",
        "name": "Chicken Breast, Boneless, Skinless",
        "brand": "Maple Leaf",
        "category": "Meat",
        "serving_size_g": 120,
        "serving_text": "1 breast (120 g)",


        "calories": 1.65,
        "protein": 0.3083,
        "fat": 0.0333,
        "carbs": 0.0
    }
]

type EmptyFoodEntry = Partial<FoodEntry>;

export default function AddScreen({ route, navigation }: Props) {

    const insets = useSafeAreaInsets();
    const [value, setValue] = React.useState('');
    const [modalVisible, setModalVisible] = React.useState(false);
    const [selectedItem, setSelectedItem] = React.useState<Partial<FoodEntry> | null>(null);
    function handleChangeText(text: string) {
        setValue(text);
        // Add any additional logic here
    }

    const data: EmptyFoodEntry[] = sampleFoodEntries.map(({ id, ...rest }) => (
        { ...rest, food_id: id }
    ));

    function handleBackPress() {
        navigation.goBack();
    }

    async function addFoodEntry(item: Partial<FoodEntry>) {
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
                    data={data}
                    value={value}
                    onChangeText={handleChangeText}
                    onBackPress={handleBackPress}
                    renderItem={(info) => (
                        <AutoCompleteSuggestion
                            item={info.item}
                            index={info.index}
                            onPress={() => onPressHandler(info)}
                        />
                    )}
                    placeholder='Search for food items...'
                    keyExtractor={(item) => item.food_id?.toString()}
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