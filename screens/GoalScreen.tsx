import colors from '@styles/colors';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { cardShadow } from '@styles/card';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect, useState } from 'react';

import Slider from '@components/ui/Slider';
import { RippleButton } from '@components/feedback';
import { saveMacros, getMacros } from '@utils/db';




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
        <SafeAreaView style={[styles.container]} edges={['top', 'left', 'right']}>
            <GestureHandlerRootView style={{ flex: 1, height: '100%' }} onLayout={(e) => {
                setContainerHeight(e.nativeEvent.layout.height);
            }}>

                <View style={styles.section}>
                    <View style={styles.card}>
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
                    </View>
                    <View style={styles.card}>
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
                    </View>
                    <View style={styles.card}>
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
                    </View>
                    <View style={styles.card}>
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
                </View>
                <View style={{ marginVertical: 10, flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <RippleButton
                        onPress={async () => {
                            await saveMacros(calories, protein, carbs, fat);
                            loadMacrosForToday();
                        }}
                        style={styles.saveButton}
                        text='Save'></RippleButton>
                </View>


            </GestureHandlerRootView>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    saveButton: {
        backgroundColor: colors.textPrimary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    ticksRow: {
        position: "relative",
        top: 0,
        left: 0,
        right: 0,
        marginTop: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    container: {
        flex: 1,
        paddingTop: 25,
        paddingHorizontal: 20,
    },
    section: {
        gap: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        color: colors.textSecondary,
    },
    macroRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    sliderRow: {
        marginTop: 10,
        marginBottom: 20,
        paddingHorizontal: 30,
        flexDirection: 'row',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingVertical: 20,
        paddingHorizontal: 24,
        ...cardShadow,
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
