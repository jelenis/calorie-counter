import React, { use, useEffect } from 'react';
import { z } from 'zod';
import { View, Text, StyleSheet, Alert, Keyboard, Pressable, TextInput } from 'react-native';

import { RippleButton, ToggleButton } from '@components/ui';
import type { EmptyFoodEntry, FoodEntry } from '@utils/db';
import Input from '@components/ui/Input';
import { Dropdown } from 'react-native-element-dropdown';
import colors from '@styles/colors';
import { ToggleListButton } from '@components/ui/ToggleButton';
import { useNavigation } from '@react-navigation/native';
import { UNIT_TO_GRAMS, type Unit } from '@utils/types';
type AddEntryMenuProps = {
    selectedItem: EmptyFoodEntry | null;
    addFoodEntry: (item: EmptyFoodEntry) => Promise<void>;
    deleteFoodEntry?: (id: number) => Promise<void> | undefined;
    closeModal: () => void;
}

type MealTime = 'breakfast' | 'lunch' | 'dinner' | 'snack';
const servingSizeSchema = z.string().refine((val: string) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
}, {
    message: 'Serving size must be a positive number',
});


const MAX_INPUT_LEN_NUM = 6


export default function AddEntryMenu({ selectedItem, addFoodEntry, deleteFoodEntry, closeModal }: AddEntryMenuProps) {
    const [servingSizeText, setServingSizeText] = React.useState('');
    const [servingSize, setServingSize] = React.useState(1);
    const [selectedUnit, setSelectedUnit] = React.useState<Unit>('g');
    const [time, setTime] = React.useState<MealTime>('breakfast');
    const defaultServingSize = selectedItem?.serving_size_g || 1;

    // Validate servingSizeText before calculations
    // zod for validating serving size input
    const isServingSizeValid = servingSizeSchema.safeParse(servingSizeText).success;
    const parsedServingSize = isServingSizeValid ? parseFloat(servingSizeText) : 0;

    function calcNutrient(nutrient: number | undefined) {
        return isServingSizeValid && nutrient !== undefined
            ? nutrient * conversionMap[selectedUnit] * parsedServingSize
            : 0;
    }
    const conversionMap: Record<Unit, number> = {
        'serving': defaultServingSize,
        'g': UNIT_TO_GRAMS['g'],
        'oz': UNIT_TO_GRAMS['oz'],
        'lb': UNIT_TO_GRAMS['lb'],
    }
    // default calories state
    const [caloriesText, setCaloriesText] = React.useState('');
    const [calories, setCalories] = React.useState(() => {
        const cals = selectedItem?.calories || 0;
        return defaultServingSize * cals || 0;
    });

    useEffect(() => {
        // keeps the calories text in sync with validated calories state
        setCaloriesText(calories.toFixed(0));

        if (selectedItem?.calories === undefined || selectedItem.calories === 0) {
            return; // serving size is meaningless if no calories in selected item
        }

        // update the serving size based on calories and selected item
        const newServingSize = calories / selectedItem.calories;
        setServingSize(newServingSize);
        setServingSizeText(newServingSize.toFixed(1));

    }, [calories]);




    const isEditing = Boolean(deleteFoodEntry);

    const navigation = useNavigation();
    // set a default serving size when selectedItem changes, only on new enty
    useEffect(() => {
        if (selectedItem?.serving_text && selectedItem.serving_size_g) {
            if (isEditing && selectedItem.quantity) {
                setServingSizeText((selectedItem.quantity * conversionMap[selectedUnit]).toFixed(1));
            } else {

                setServingSizeText(selectedItem.serving_size_g.toFixed(1));
            }
        }
    }, [selectedItem?.serving_text, selectedItem?.serving_size_g])

    if (!selectedItem) {
        return <View><Text>Whoops! No item selected</Text></View>;
    }



    const totProtein = calcNutrient(selectedItem?.protein);
    const totCarbs = calcNutrient(selectedItem?.carbs);
    const totFat = calcNutrient(selectedItem?.fat);
    const brand = selectedItem?.brand || null;

    const defaultUnits = [
        { label: 'Grams (g)', value: 'g' },
        { label: 'Ounces (oz)', value: 'oz' },
        { label: 'Pounds (lb)', value: 'lb' },
    ]


    return (
        <Pressable onPress={Keyboard.dismiss} >
            <View style={{
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                paddingTop: 10,
                paddingHorizontal: 18,
                gap: 20
            }}>
                <View style={styles.menuContent}>
                    {brand && <Text style={styles.brand}>{brand}</Text>}
                    <Text style={[styles.selectedItemName, styles.borderBottom]}>{selectedItem?.name}</Text>
                    <View style={styles.nutrientsContainer}>
                        <View style={[styles.nutrientRow]}>
                            <Text style={[styles.nutrientLabel, styles.calories]}>Calories</Text>
                            <TextInput style={[styles.nutrientValue, styles.calories]}
                                value={caloriesText}
                                onChangeText={setCaloriesText}
                                keyboardType="number-pad"
                                maxLength={MAX_INPUT_LEN_NUM}
                                onBlur={() => {
                                    const parsed = parseFloat(caloriesText);
                                    if (isNaN(parsed) || parsed < 0) {
                                        setCaloriesText(calories.toFixed(0));
                                        return;
                                    }
                                    setCalories(prev => parseFloat(caloriesText));
                                }} />
                        </View>
                        <View style={[styles.nutrientRow, styles.oddRow]}>
                            <Text style={styles.nutrientLabel}>Protein</Text>
                            <Text style={styles.nutrientValue}>{totProtein.toFixed(0)} g</Text>
                        </View>
                        <View style={styles.nutrientRow}>
                            <Text style={styles.nutrientLabel}>Fat</Text>
                            <Text style={styles.nutrientValue}>{totFat.toFixed(0)} g</Text>
                        </View>
                        <View style={[styles.nutrientRow, styles.oddRow]}>
                            <Text style={styles.nutrientLabel}>Carbs</Text>
                            <Text style={styles.nutrientValue}>{totCarbs.toFixed(0)} g</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.mealContainer}>
                    <Text style={styles.label}>Select Meal</Text>
                    <ToggleListButton
                        data={["Breakfast", "Lunch", "Dinner", "Snack"]}
                        defaultValue="Snack"
                        onChange={(key, value) => {
                            setTime(key.toLowerCase() as MealTime);
                        }} />
                </View>

                <View style={styles.quantityContainer}>
                    <Text style={styles.label}>Quantity</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 30, }}>
                        <View>
                            <Input
                                keyboardType='number-pad'
                                maxLength={MAX_INPUT_LEN_NUM}
                                onSubmitEditing={Keyboard.dismiss}
                                style={styles.quantityInput}
                                containerStyle={styles.quantityContainer}
                                defaultValue={servingSizeText}
                                onChangeText={(text) => {
                                    const value = parseFloat(text);
                                    setServingSizeText(text);
                                    setServingSize(value);
                                }}
                            />
                        </View>
                        <View style={styles.servingSizePickerContainer}>
                            <Dropdown
                                data={defaultUnits}
                                labelField="label"
                                valueField="value"
                                placeholder="Select item"
                                selectedTextStyle={{ color: colors.textSubtle, }}

                                searchPlaceholder="Search..."
                                value={selectedUnit}
                                onChange={item => {
                                    const newUnit = item.value as Unit;
                                    const prevUnit = selectedUnit;


                                    // nomralize to grams and convert to new unit
                                    const newServingSize = (servingSize * conversionMap[prevUnit]) / conversionMap[newUnit];
                                    setServingSize(newServingSize);
                                    setServingSizeText(newServingSize.toFixed(1));
                                    setSelectedUnit(item.value);
                                }}
                                renderItem={(item) =>
                                    <Text style={{ padding: 10 }}>{item.label}</Text>
                                }
                            />
                        </View>
                    </View>
                </View >

                <View style={[styles.menuFooter, styles.borderTop, { justifyContent: deleteFoodEntry ? 'space-between' : 'flex-end' }]}>
                    {deleteFoodEntry && <RippleButton style={styles.cancelButton} text="Delete" onPress={() => {
                        deleteFoodEntry(selectedItem?.id || 0);
                        closeModal();
                    }} />}
                    <RippleButton style={styles.saveButton} text="Save" onPress={async () => {

                        if (servingSizeText.trim() === '' || !isServingSizeValid) {
                            Alert.alert('Oops!', 'Please enter a valid serving size.');
                            return;
                        }

                        if (selectedItem) {
                            await addFoodEntry({
                                ...selectedItem,
                                quantity: servingSize * conversionMap[selectedUnit],
                                time
                            });
                        }

                        closeModal();
                        if (navigation && !isEditing) {
                            navigation.goBack();
                        }
                    }} />
                </View>
            </View >
        </Pressable>
    );
}

const styles = StyleSheet.create({
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 6,
        color: colors.textSubtle
    },
    menuContent: {
        width: '100%',
        paddingVertical: 20,
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    borderBottom: {
        borderBottomColor: '#ddd',
        borderBottomWidth: 1,
        paddingBottom: 10,
    },
    borderTop: {
        borderTopColor: '#ddd',
        borderTopWidth: 1,
    },
    selectedItemName: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 10,
        color: colors.textPrimary,
        width: '100%',
    },
    brand: {
        fontSize: 14,
        fontWeight: '800',
        color: colors.textSubtle,
        opacity: 0.7,
        marginBottom: 1,
    },
    servingSizePicker: {
        width: '100%',
        fontSize: 1,
        minHeight: 40,
    },
    servingSizePickerContainer: {
        borderColor: '#EEE',
        width: 150,
        justifyContent: 'center',
        alignContent: 'center',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    quantityContainer: {
        width: '100%',
        shadowOpacity: 0,

    },
    quantityInput: {
        width: 100,
    },
    menuFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingBottom: 10,
        paddingTop: 20,
        gap: 20,
    },
    cancelButton: {
        backgroundColor: colors.error,
        height: 40,
        width: 80,
    },
    saveButton: {
        width: 80,
        height: 40,
    },
    mealContainer: {
        width: '100%',
        marginBottom: 20,
    },
    calories: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 6,
        color: colors.textSecondary,
    },
    protein: {
        fontSize: 14,
        color: colors.textSubtle,
    },
    fat: {
        fontSize: 14,
        color: colors.textSubtle,
    },
    carbs: {
        fontSize: 14,
        color: colors.textSubtle,
    },
    nutrientsContainer: {
        width: '100%',
        marginTop: 3,
    },
    nutrientRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 2,
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    nutrientLabel: {
        fontSize: 15,
        color: colors.textSubtle,
        fontWeight: '400',
    },
    nutrientValue: {
        fontSize: 15,
        color: colors.textSubtle,
        fontWeight: '400',
        minWidth: 60,
        textAlign: 'right',
    },
    oddRow: {
        backgroundColor: '#f8f8f8',
    }
});
