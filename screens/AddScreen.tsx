import type { ListRenderItemInfo } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ModalStackParamList } from '../types/navigation';

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Platform, Modal } from 'react-native';
import Animated, { useSharedValue, LinearTransition, } from 'react-native-reanimated';
import colors from '../styles/colors';
import TouchRipple from '../components/TouchRipple';
import Entypo from '@expo/vector-icons/Entypo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SearchInput from '../components/SearchInput';
import { insertEntry, type FoodEntry } from '../utils/db';

type Props = NativeStackScreenProps<ModalStackParamList, 'AddScreen'>;


type SampleFoodEntry = Omit<FoodEntry, 'category'>;

const sampleFoodEntries: SampleFoodEntry[] = [
    { id: 1, name: "Oatmeal", calories: 300, protein: 10, carbs: 54, fat: 6 },
    { id: 2, name: "Banana", calories: 105, carbs: 27 },
    { id: 3, name: "Scrambled eggs (2)", calories: 180, protein: 12, fat: 14 },
    { id: 4, name: "Whole wheat toast", calories: 120, protein: 5, carbs: 22, fat: 2 },
    { id: 5, name: "Peanut butter (1 tbsp)", calories: 95, protein: 4, fat: 8, carbs: 3 },

    { id: 6, name: "Chicken breast", calories: 220, protein: 41, fat: 5 },
    { id: 7, name: "Brown rice (1 cup)", calories: 215, protein: 5, carbs: 45, fat: 2 },
    { id: 8, name: "Steamed broccoli", calories: 55, protein: 4, carbs: 11 },
    { id: 9, name: "Olive oil (1 tbsp)", calories: 120, fat: 14 },

    { id: 10, name: "Greek yogurt (plain)", calories: 130, protein: 23, carbs: 9, fat: 0 },
    { id: 11, name: "Blueberries", calories: 85, carbs: 21 },
    { id: 12, name: "Protein bar", calories: 220, protein: 20, carbs: 23, fat: 7 },

    { id: 13, name: "Turkey sandwich", calories: 420, protein: 32, carbs: 38, fat: 12 },
    { id: 14, name: "Apple", calories: 95, carbs: 25 },
    { id: 15, name: "Almonds (28g)", calories: 165, protein: 6, fat: 14, carbs: 6 },

    { id: 16, name: "Salmon fillet", calories: 360, protein: 34, fat: 22 },
    { id: 17, name: "Quinoa (1 cup)", calories: 222, protein: 8, carbs: 39, fat: 4 },
    { id: 18, name: "Roasted vegetables", calories: 140, carbs: 18, fat: 6 },

    { id: 19, name: "Cheeseburger", calories: 520, protein: 28, carbs: 42, fat: 28 },
    { id: 20, name: "French fries (medium)", calories: 340, carbs: 44, fat: 16 },

    { id: 21, name: "Cottage cheese", calories: 110, protein: 14, carbs: 5, fat: 4 },
    { id: 22, name: "Orange", calories: 80, carbs: 19 },

    { id: 23, name: "Pasta with tomato sauce", calories: 480, protein: 16, carbs: 82, fat: 10 },
    { id: 24, name: "Garlic bread", calories: 180, carbs: 24, fat: 7 },

    { id: 25, name: "Ice cream (1 scoop)", calories: 210, carbs: 24, fat: 11 },
    { id: 26, name: "Dark chocolate (2 squares)", calories: 120, fat: 9, carbs: 12 },

    { id: 27, name: "Protein shake", calories: 250, protein: 30, carbs: 12, fat: 5 },
    { id: 28, name: "Avocado (half)", calories: 160, fat: 15, carbs: 8 },
    { id: 29, name: "Tuna salad", calories: 310, protein: 26, fat: 18 },
    { id: 30, name: "Rice cakes (2)", calories: 70, carbs: 14 },
];

export default function AddScreen({ route, navigation }: Props) {
    const data: SampleFoodEntry[] = sampleFoodEntries;
    const colorProgress = useSharedValue(0);
    const insets = useSafeAreaInsets();
    const [value, setValue] = React.useState('');
    const [modalVisible, setModalVisible] = React.useState(false);

    function handleChangeText(text: string) {
        setValue(text);
        // Add any additional logic here
    }

    function handleBackPress() {
        navigation.goBack();
    }


    function onPressHandler({ item }: { item: SampleFoodEntry }) {
        if (route.params?.dateStr) {
            try {
                insertEntry(route.params.dateStr, item.name, item.calories, 'snack');
            } catch (e) {
                console.error('Error inserting entry:', e);
            }
        }
        setModalVisible(true);
        // navigation.goBack(); // TODO make a confirmation message (probably stay on screen)
    }

    return (
        <View style={[styles.container, insets]}>

            <SearchInput
                data={data}
                value={value}
                onChangeText={handleChangeText}
                onBackPress={handleBackPress}
                renderItem={({ item, index }) => (
                    <AutoCompleteSuggestion
                        item={item}
                        index={index}
                        onPress={() => onPressHandler({ item })}
                    />
                )}
                placeholder='Search for food items...'
            />
            <Modal
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
                transparent
                animationType="fade"
            >
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}>
                    <View style={{
                        width: '80%',
                        padding: 20,
                        backgroundColor: 'white',
                        borderRadius: 10,
                        alignItems: 'center',
                    }}>
                        <Text style={{ fontSize: 18, marginBottom: 20 }}>Food item added successfully!</Text>
                        <TouchRipple
                            onPress={() => setModalVisible(false)}
                            color={colors.ripple}
                            style={{
                                paddingVertical: 10,
                                paddingHorizontal: 20,
                                backgroundColor: colors.primary,
                                borderRadius: 5,
                            }}
                        >
                            <Text style={{ color: 'white', fontSize: 16 }}>OK</Text>
                        </TouchRipple>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

function AutoCompleteSuggestion({ item, index, onPress }: { item: any; index: number; onPress: () => void }) {
    return (
        <View
            style={[styles.suggestionContainer, index === 0 ? { borderTopWidth: 1, borderTopColor: '#EEE' } : {}]}>
            <TouchRipple onPress={onPress} color={colors.ripple} style={styles.suggestionTextContainer}>
                <Text style={styles.suggestionText}>{item.name}</Text>
            </TouchRipple >
        </View >
    );
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