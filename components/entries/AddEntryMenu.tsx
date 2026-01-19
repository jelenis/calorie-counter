import React, { use, useEffect } from 'react';
import { z } from 'zod';
import { View, Text, StyleSheet, Alert, Keyboard, Pressable, TextInput, Linking } from 'react-native';

import { RippleButton } from '@components/ui';
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
const quantitySchema = z.string().refine((val: string) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
}, {
    message: 'Quantity must be a positive number',
});


const MAX_INPUT_LEN_NUM = 6


export default function AddEntryMenu({ selectedItem, addFoodEntry, deleteFoodEntry, closeModal }: AddEntryMenuProps) {
    const [quantityText, setQuantityText] = React.useState('');

    const [selectedUnit, setSelectedUnit] = React.useState<Unit>('g');
    const [time, setTime] = React.useState<MealTime>('breakfast');
    const defaultServingSize = selectedItem?.serving_size_g || 1;
    // Validate quantityText before calculations
    // zod for validating numeric quantity input
    const isQuantityValid = quantitySchema.safeParse(quantityText).success;
    const parsedQuantity = isQuantityValid ? parseFloat(quantityText) : 0;
    const [quantity, setQuantity] = React.useState(selectedItem?.quantity || defaultServingSize);


    function calcNutrient(nutrient: number | undefined) {
        return isQuantityValid && nutrient !== undefined
            ? nutrient * conversionMap[selectedUnit] * parsedQuantity
            : 0;
    }
    const conversionMap: Record<Unit, number> = {
        'serving': defaultServingSize,
        'g': UNIT_TO_GRAMS['g'],
        'oz': UNIT_TO_GRAMS['oz'],
        'lb': UNIT_TO_GRAMS['lb'],
    }
    // default calories state
    const [calories, setCalories] = React.useState(() => {
        const cals = selectedItem?.calories || 0;
        return cals * quantity || 0;
    });
    const [caloriesText, setCaloriesText] = React.useState(calories.toFixed(0));

    const isEditing = Boolean(deleteFoodEntry);
    const navigation = useNavigation();

    // set a default serving size when selectedItem changes, only on new entry
    useEffect(() => {
        if (selectedItem?.serving_text && selectedItem.serving_size_g) {
            if (isEditing && selectedItem.quantity) {
                setQuantityText((selectedItem.quantity * conversionMap[selectedUnit]).toFixed(1));
            } else {

                setQuantityText(selectedItem.serving_size_g.toFixed(1));
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

    const sourceURL = 'https://world.openfoodfacts.org'
    const sourceText = '(c) Open Food Facts contributors'

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
                                returnKeyType='done'
                                keyboardType="number-pad"
                                maxLength={MAX_INPUT_LEN_NUM}
                                onBlur={() => {
                                    const parsed = parseFloat(caloriesText);
                                    if (isNaN(parsed) || parsed < 0) {
                                        setCaloriesText(calories.toFixed(0));
                                        return;
                                    }
                                    setCalories(parsed);
                                    // determine the quantity that would give this many calories 
                                    if (!selectedItem?.calories || selectedItem.calories === 0) {
                                        return;
                                    }
                                    // grams = cals / (cals per gram)
                                    const newQuantity = parsed / selectedItem.calories;
                                    setQuantity(newQuantity);
                                    setQuantityText(newQuantity.toFixed(1));
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

                    {selectedItem.server_id && <Pressable style={styles.source} onPress={() => Linking.openURL(sourceURL)}>
                        <Text style={styles.sourceText}>{sourceText}</Text>
                    </Pressable>}
                </View>

                <View style={styles.mealContainer}>
                    <Text style={styles.label}>Select Meal</Text>
                    <ToggleListButton
                        data={["Breakfast", "Lunch", "Dinner", "Snack"]}
                        defaultValue={selectedItem.time || "snack"}
                        onChange={(key, value) => {
                            setTime(key.toLowerCase() as MealTime);
                        }} />
                </View>

                <View style={styles.quantityContainer}>
                    <Text style={styles.label}>Quantity</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 30, }}>
                        <View>
                            <Input
                                returnKeyType='done'
                                keyboardType='number-pad'
                                maxLength={MAX_INPUT_LEN_NUM}
                                onSubmitEditing={Keyboard.dismiss}
                                style={styles.quantityInput}
                                containerStyle={styles.quantityContainer}
                                defaultValue={quantityText}
                                onChangeText={(text) => {
                                    const value = parseFloat(text);
                                    setQuantityText(text);
                                    setQuantity(value);
                                }}
                                onBlur={() => {
                                    // determine the correct calories 
                                    // cals = (cals per gram) * grams
                                    const newQuantity = parseFloat(quantityText);
                                    const newCals = selectedItem.calories * newQuantity;
                                    setCaloriesText(newCals.toFixed(0));
                                    setCalories(newCals);
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
                                    const newQuantity = (quantity * conversionMap[prevUnit]) / conversionMap[newUnit];
                                    setQuantity(newQuantity);
                                    setQuantityText(newQuantity.toFixed(1));
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
                    {deleteFoodEntry && <RippleButton
                        style={styles.cancelButton}
                        text="Delete"
                        onPress={() => {
                            deleteFoodEntry(selectedItem?.id || 0);
                            closeModal();
                        }} />}
                    <RippleButton style={styles.saveButton} text="Save" onPress={async () => {

                        if (quantityText.trim() === '' || !isQuantityValid) {
                            Alert.alert('Oops!', 'Please enter a valid quantity.');
                            return;
                        }

                        if (selectedItem) {
                            // serving size is actually the same,
                            // just use it to determine the quantity
                            await addFoodEntry({
                                ...selectedItem,
                                quantity: quantity * conversionMap[selectedUnit],
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
    },
    source: {
        marginTop: 20,
        color: colors.link,
    },
    sourceText: {
        color: colors.link,
        fontSize: 14
    }
});
