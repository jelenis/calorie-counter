import colors from '@styles/colors';
import { View, Text, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';

import Slider from '@components/ui/Slider';
import { RippleButton } from '@components/feedback';
import { saveMacros, getMacros } from '@utils/db';
import MenuCard from '@components/ui/MenuCard';
import Toast from 'react-native-toast-message';
import { SaveToast } from '@components/ui/successToast';



export default function GoalScreen() {
    const [calories, setCalories] = useState(0);
    const [protein, setProtein] = useState(0);
    const [carbs, setCarbs] = useState(0);
    const [fat, setFat] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);

    async function loadMacrosForToday() {
        try {
            const macros = await getMacros();
            if (macros) {
                setCalories(macros.calories);
                setProtein(macros.protein);
                setCarbs(macros.carbs);
                setFat(macros.fat);
            }
        } catch (e) {
            console.error('Error loading macros:', e);
        }
    }

    useEffect(() => {
        loadMacrosForToday();
    }, []);

    const scrollEnabled = contentHeight > containerHeight;


    return (
        <GestureHandlerRootView
            style={{ flex: 1, backgroundColor: colors.background }}
            onLayout={(e) => {
                setContainerHeight(e.nativeEvent.layout.height);
            }}>

            <MenuCard title="Set Your Daily Goals">
                <View style={styles.section}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.labelText}>Calories</Text>
                        <Text style={styles.valueText}>{calories} Cal</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <Slider
                            showTicks
                            tickLabels={[1000, 2000, 3000, 4000]}
                            min={1000}
                            max={4000}
                            step={100}
                            value={calories}
                            onUpdate={cals => setCalories(cals)}
                            onChange={cals => setCalories(cals)}
                        />
                    </View>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.labelText}>Protein</Text>
                        <Text style={styles.valueText}>{protein} g</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <Slider
                            showTicks
                            tickLabels={[40, 100, 160, 220, 280]}
                            min={40}
                            max={280}
                            step={5}
                            value={protein}
                            onUpdate={v => setProtein(v)}
                            onChange={v => setProtein(v)}
                        />
                    </View>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.labelText}>Carbohydrates</Text>
                        <Text style={styles.valueText}>{carbs} g</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <Slider
                            showTicks
                            tickLabels={[20, 150, 280, 410, 540]}
                            min={20}
                            max={540}
                            step={10}
                            value={carbs}
                            onUpdate={v => setCarbs(v)}
                            onChange={v => setCarbs(v)}
                        />
                    </View>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.labelText}>Fats</Text>
                        <Text style={styles.valueText}>{fat} g</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <Slider
                            showTicks
                            tickLabels={[30, 70, 110, 150, 190]}
                            min={30}
                            max={190}
                            step={5}
                            value={fat}
                            onUpdate={v => setFat(v)}
                            onChange={v => setFat(v)}
                        />
                    </View>

                </View>
                <View style={{ alignSelf: 'stretch', marginVertical: 10, flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <RippleButton
                        onPress={async () => {
                            const result = await saveMacros(calories, protein, carbs, fat);
                            if (result != undefined) {
                                Toast.show({
                                    type: 'success'
                                })
                            }

                            loadMacrosForToday();
                        }}
                        style={styles.saveButton}
                        text='Save'></RippleButton>
                </View>
            </MenuCard>
            <SaveToast text={`Your goals have been updated!`} />
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    saveButton: {
        backgroundColor: colors.textPrimary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,

    },
    section: {
        gap: 12,
        alignSelf: 'stretch',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        color: colors.textSecondary,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardContent: {
        paddingHorizontal: 10,
        paddingBottom: 2,
        marginVertical: 24,

    },
    labelText: {
        fontSize: 18,
        color: colors.textSubtle,
        fontWeight: '700',
    },
    valueText: {
        fontSize: 18,
        color: colors.textPrimary,
        fontWeight: '600',
    }
});
