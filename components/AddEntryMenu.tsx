import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import RippleButton from './RippleButton';
import type { FoodEntry } from '../utils/db';
import Input from './Input';
import { Dropdown } from 'react-native-element-dropdown';
import colors from '../styles/colors';
import type { Food } from '../utils/db';

type AddEntryMenuProps = {
    selectedItem: Partial<Food> | null;
    setModalVisible: (visible: boolean) => void;
    addFoodEntry: (item: Partial<FoodEntry>) => void;
    deleteFoodEntry?: (id: number) => void | undefined;
}
type Unit = 'serving' | 'g' | 'oz' | 'lb';



export default function AddEntryMenu({ selectedItem, setModalVisible, addFoodEntry, deleteFoodEntry }: AddEntryMenuProps) {
    const [servingSize, setServingSize] = React.useState(1);
    const [selectedUnit, setSelectedUnit] = React.useState<Unit>('g');
    const defaultServingSize = selectedItem?.serving_size_g || 1;
    const [units, setUnits] = React.useState<Unit[]>(['g', 'oz', 'lb']);

    const conversionMap: Record<Unit, number> = {
        'serving': defaultServingSize,
        'g': 1,
        'oz': 28.3495,
        'lb': 453.592,
    }


    useEffect(() => {
        if (selectedItem?.serving_text && selectedItem.serving_size_g) {
            setServingSize(selectedItem.serving_size_g);
        }

    }, [selectedItem?.serving_text, selectedItem?.serving_size_g])

    if (!selectedItem) {
        return <View><Text>Whoops! No item selected</Text></View>;
    }

    const totCals = selectedItem ? (selectedItem.calories ?? 0) * conversionMap[selectedUnit] * servingSize : 0;
    const totProtein = selectedItem?.protein !== undefined ? selectedItem.protein * conversionMap[selectedUnit] * servingSize : 0;
    const totCarbs = selectedItem?.carbs !== undefined ? selectedItem.carbs * conversionMap[selectedUnit] * servingSize : 0;
    const totFat = selectedItem?.fat !== undefined ? selectedItem.fat * conversionMap[selectedUnit] * servingSize : 0;
    const brand = selectedItem?.brand || null;


    const defaultUnits = [
        { label: 'Grams (g)', value: 'g' },
        { label: 'Ounces (oz)', value: 'oz' },
        { label: 'Pounds (lb)', value: 'lb' },
    ]
    console.log(selectedItem?.calories, totCals);

    return (
        <View>

            <View style={styles.menuContent}>
                {brand && <Text style={styles.brand}>{brand}</Text>}
                <Text style={[styles.selectedItemName, styles.borderBottom]}>{selectedItem?.name}</Text>
                <View style={styles.nutrientsContainer}>
                    <View style={[styles.nutrientRow]}>
                        <Text style={[styles.nutrientLabel, styles.calories]}>Calories</Text>
                        <Text style={[styles.nutrientValue, styles.calories]}>{totCals.toFixed(0)}</Text>
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
                <Text>Select Meal Time (TODO)</Text>
            </View>

            <View style={styles.quantityContainer}>
                <Text>Quantity</Text>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 30, marginBottom: 20 }}>
                    <View>
                        <Input
                            keyboardType='number-pad'
                            style={styles.quantityInput}
                            containerStyle={styles.quantityContainer}
                            defaultValue={servingSize.toString()} onChangeText={(text) => {
                                const value = parseInt(text, 10);
                                if (!isNaN(value)) {
                                    setServingSize(value);
                                }
                            }} />
                    </View>
                    <View style={styles.servingSizePickerContainer}>
                        <Dropdown
                            data={defaultUnits}

                            maxHeight={300}
                            labelField="label"
                            valueField="value"

                            placeholder="Select item"
                            selectedTextStyle={{ color: colors.textSubtle }}
                            searchPlaceholder="Search..."
                            value={selectedUnit}

                            onChange={item => {
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
                    setModalVisible(false);
                }} />}
                <RippleButton style={styles.saveButton} text="Save" onPress={() => {

                    if (selectedItem) {
                        addFoodEntry({
                            ...selectedItem,
                            quantity: servingSize * conversionMap[selectedUnit],
                            time: 'breakfast'
                        });
                    }
                    setModalVisible(false);
                }} />
            </View>
        </View>

    );
}
const styles = StyleSheet.create({
    menuContent: {
        width: '100%',
        padding: 20,
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
        paddingVertical: 5,
    },
    quantityContainer: {
        paddingHorizontal: 20,
        marginTop: 3,
        width: '100%',
        shadowOpacity: 0,

    },
    quantityInput: {
        paddingHorizontal: 1,
        width: 100,

    },
    menuFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 10,
        paddingBottom: 10,
        paddingTop: 20,
        gap: 20,
    },

    cancelButton: {
        backgroundColor: '#e66260ff',
        height: 40,
        width: 80,
    },
    saveButton: {
        width: 80,
        height: 40,
    },

    mealContainer: {
        minHeight: 120,
        paddingHorizontal: 20,
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
        marginBottom: 20,
    },
    nutrientRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 2,
        paddingVertical: 6,
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
        backgroundColor: '#f9f9f9',
    }

});
