import colors from '@styles/colors';
import { View, Text, StyleSheet, TextInput, Pressable, Keyboard } from 'react-native';
import { useState, useEffect } from "react";
import { Alert } from 'react-native';
import * as db from '@utils/db';
import { cardShadow } from '@styles/card';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { RippleButton } from '@components/feedback';
import type { userFood } from '@utils/db';
import * as z from 'zod';

const userFooodSchema = z.object({
    name: z.string().min(1, 'A name is required'),
    calories: z.number('The amount of calories are required').min(0, 'Calories must be non-negative'),
    protein: z.coerce.number('Protein must be a number').min(0, 'Protein must be non-negative')
        .transform(val => parseFloat(val.toFixed(2))).nullable(),
    fat: z.coerce.number().min(0, 'Fat must be non-negative').nullable(),
    carbs: z.coerce.number().min(0, 'Carbs must be non-negative').nullable(),
});


export default function CreateFoodScreen() {
    const [calorieText, setCalorieText] = useState('');
    const [proteinText, setProteinText] = useState('');
    const [carbsText, setCarbsText] = useState('');
    const [fatText, setFatText] = useState('');
    const [mealName, setMealName] = useState('');
    const [brandName, setBrandName] = useState('');
    const navigation = useNavigation();




    async function saveFood() {
        const food = {
            name: mealName.trim(),
            brand: brandName.trim() || null,
            calories: parseInt(calorieText),
            protein: proteinText || null,
            fat: fatText || null,
            carbs: carbsText || null,
        };

        // Validate input
        const parseResult = userFooodSchema.safeParse(food);
        if (!parseResult.success) {
            const errorMessage = parseResult.error.issues.map(e => e.message).join('\n');

            Alert.alert('Invalid Meal', errorMessage);
            return false;
        }



    }
    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <Pressable style={styles.container} onPress={Keyboard.dismiss}>
                <View style={[{ backgroundColor: colors.textPrimary, borderRadius: 10 }]}>
                    <View>
                        <Text style={{ color: 'white', fontSize: 25, fontWeight: '600', padding: 15 }}>
                            Create a Meal
                        </Text>
                    </View>
                    <View style={[styles.innerContainer, cardShadow]}>
                        <Text style={[styles.title,]}>Name</Text>
                        <TextInput
                            value={mealName}
                            onChangeText={setMealName}
                            style={styles.mealName}
                            placeholder="Fuji Apple" />
                        <Text style={[styles.title, { marginTop: 15 }]}>Brand Name <Text style={{ opacity: 0.4 }}>(Optional)</Text></Text>
                        <TextInput
                            value={brandName}
                            onChangeText={setBrandName}
                            style={styles.brandName}
                            placeholder="Healthy Choice Inc" />
                        <Text style={[styles.title, { marginTop: 15 }]}>Fill in the nutrition facts</Text>
                        <View style={{
                            alignContent: 'center',
                            width: '100%',
                            flexDirection: 'row',
                            justifyContent: 'center'
                        }}>

                            <View style={styles.nutrientsContainer}>
                                <View style={[styles.nutrientRow, { marginBottom: 10, }]}>
                                    <Text style={[styles.nutrientLabel, styles.calories]}>Calories</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <TextInput
                                            style={styles.nutrientValue}
                                            value={calorieText}
                                            onChangeText={setCalorieText}
                                            keyboardType="numeric"
                                            placeholder='90'
                                        />
                                        <Text style={styles.nutrientUnit}> Cal</Text>
                                    </View>
                                </View>
                                <View style={[styles.nutrientRow, styles.oddRow]}>
                                    <Text style={styles.nutrientLabel}>Protein</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <TextInput
                                            style={styles.nutrientValue}
                                            value={proteinText}
                                            onChangeText={setProteinText}
                                            keyboardType="numeric"
                                            placeholder='0'
                                        />
                                        <Text style={styles.nutrientUnit}> g</Text>
                                    </View>
                                </View>
                                <View style={styles.nutrientRow}>
                                    <Text style={styles.nutrientLabel}>Fat</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <TextInput
                                            style={styles.nutrientValue}
                                            value={fatText}
                                            onChangeText={setFatText}
                                            keyboardType="numeric"
                                            placeholder='0'
                                        />
                                        <Text style={styles.nutrientUnit}> g</Text>
                                    </View>
                                </View>
                                <View style={[styles.nutrientRow, styles.oddRow]}>
                                    <Text style={styles.nutrientLabel}>Carbs</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <TextInput
                                            style={styles.nutrientValue}
                                            value={carbsText}
                                            onChangeText={setCarbsText}
                                            keyboardType="numeric"
                                            placeholder='0'
                                        />
                                        <Text style={styles.nutrientUnit}> g</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={styles.buttonContainer}>
                    <RippleButton text="Save Meal" onPress={async () => {
                        const ok = await saveFood();
                        if (ok) navigation.goBack();
                    }} />
                    {/* <RippleButton text="Add & Save" onPress={async () => {
                        const ok = await saveFood();
                        if (ok) {
                            // clear form for next entry
                            setMealName('');
                            setBrandName('');
                            setCalorieText('');
                            setProteinText('');
                            setFatText('');
                            setCarbsText('');
                        }
                    }} /> */}
                </View>

            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        marginTop: 20,
        width: '100%',
        alignItems: 'center',
        height: 40,
        paddingHorizontal: 10,
        maxWidth: 650
    },
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: colors.background,
        marginTop: 30,
        paddingHorizontal: 15,

    },
    title: {
        fontSize: 18,
        marginBottom: 10,
        color: colors.textPrimary,
    },
    calories: {
        fontSize: 24,
    },
    innerContainer: {
        alignItems: 'flex-start',
        padding: 15,
        borderRadius: 4,
        backgroundColor: 'white',
        paddingBottom: 25,
        maxWidth: 650
    },
    mealName: {
        fontSize: 22,
        fontWeight: '600',
        height: 40,
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
        color: colors.textSubtle,
        marginBottom: 10,

    },
    brandName: {
        fontSize: 22,
        height: 40,
        color: colors.textSubtle,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
        marginBottom: 10,
        width: '100%',
    },
    nutrientsContainer: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
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
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 6,
        color: colors.textSecondary,
    },
    nutrientValue: {
        fontSize: 20,
        color: colors.textSubtle,
        fontWeight: '400',
        minWidth: 60,
        textAlign: 'right',
    },
    nutrientUnit: {
        fontSize: 20,
        color: colors.textSubtle,
        fontWeight: '400',
    },
    oddRow: {
        borderTopColor: 'rgba(0,0,0,0.05)',
        borderTopWidth: 1,
        backgroundColor: '#f8f8f8',
    }
});


