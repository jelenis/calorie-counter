import colors from '@styles/colors';
import { View, Text, StyleSheet, TextInput, Pressable, Keyboard } from 'react-native';
import { useState, useEffect } from "react";
import { Alert } from 'react-native';
import { cardShadow } from '@styles/card';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RippleButton } from '@components/feedback';
import type { EmptyFoodEntry } from '@utils/db';
import * as db from '@utils/db';
import { RootTabParamList, UNIT_TO_GRAMS } from '@utils/types';
import * as z from 'zod';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
const reg = /^(\d+(\.\d+)?)\s*(g|oz|lb)?$/i;


const servingSizeSchema = z.string().regex(
    reg,
    "Invalid Serving Size (e.g., 400 g or 2.5 oz)"
).transform(str => {
    const match = str.match(reg); // Extract the numeric part
    return { unit: match?.[3] || null, value: parseFloat(match?.[1] || '0') };
})

const userFooodSchema = z.object({
    name: z.string().min(1, 'A name is required'),
    brand: z.string().nullable(),
    calories: z.number('Calories are required').min(0, 'Calories must be non-negative'),
    protein: z.coerce.number('Protein must be a number').min(0, 'Protein must be non-negative')
        .transform(val => parseFloat(val.toFixed(2))).default(0),
    fat: z.coerce.number().min(0, 'Fat must be non-negative').default(0),
    carbs: z.coerce.number().min(0, 'Carbs must be non-negative').default(0),
    servingSize: servingSizeSchema
});



type Props = BottomTabScreenProps<RootTabParamList, 'CreateFoodScreen'>;
export default function CreateFoodScreen({ navigation }: Props) {
    const [calorieText, setCalorieText] = useState('');
    const [proteinText, setProteinText] = useState('');
    const [carbsText, setCarbsText] = useState('');
    const [fatText, setFatText] = useState('');
    const [mealName, setMealName] = useState('');
    const [brandName, setBrandName] = useState('');
    const [servingSize, setServingSize] = useState('1 g');

    async function saveFood() {
        const food = {
            name: mealName.trim(),
            brand: brandName.trim() || null,
            calories: parseInt(calorieText),
            protein: proteinText || null,
            fat: fatText || null,
            carbs: carbsText || null,
            servingSize: servingSize.trim() || null,
        };

        // Validate input
        const parseResult = userFooodSchema.safeParse(food);
        if (!parseResult.success) {
            const errorMessage = parseResult.error.issues.map(e => e.message).join('\n');

            Alert.alert('Oops! Missing fields', errorMessage);
            return false;
        }

        const validFood = parseResult.data;
        const servingSizeFactor
            = validFood.servingSize.value * UNIT_TO_GRAMS[validFood.servingSize.unit ?? 'g'];

        const normalizedFood: EmptyFoodEntry = {
            server_id: null, // does not exit on the server
            name: validFood.name,
            brand: validFood.brand,
            calories: validFood.calories * servingSizeFactor,
            protein: validFood.protein * servingSizeFactor,
            fat: validFood.fat * servingSizeFactor,
            carbs: validFood.carbs * servingSizeFactor,
            serving_size_g: servingSizeFactor,
            serving_text: servingSize,
            category: null, // User foods have no category
        };
        const res = await db.insertEntry(new Date(), normalizedFood as db.FoodEntry);
        return res;
    }
    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <Pressable style={styles.container} onPress={Keyboard.dismiss}>
                <View style={{ width: '100%', alignSelf: 'flex-start' }}>
                    <Text style={{ color: colors.textSubtle, fontSize: 28, fontWeight: '800', padding: 15 }}>
                        Create a Meal
                    </Text>
                </View>
                <View style={[styles.innerContainer, cardShadow]}>
                    <Text style={[styles.title,]}>Name</Text>
                    <View style={{ width: '80%', flexDirection: 'row', alignItems: 'center' }}>
                        <TextInput
                            value={mealName}
                            onChangeText={setMealName}
                            style={styles.mealName}
                            placeholder="Fuji Apple" />
                    </View>
                    <Text style={[styles.title, { marginTop: 15 }]}>Brand Name <Text style={{ opacity: 0.4 }}>(Optional)</Text></Text>
                    <View style={{ width: '80%', flexDirection: 'row', alignItems: 'center' }}>
                        <TextInput
                            value={brandName}
                            onChangeText={setBrandName}
                            style={styles.brandName}
                            placeholder="Healthy Choice Inc" />
                    </View>
                    <Text style={[styles.title, { marginTop: 15 }]}>Serving Size</Text>
                    <View style={{ width: 100, flexDirection: 'row', alignItems: 'center' }}>
                        <TextInput
                            value={servingSize}
                            onChangeText={setServingSize}
                            style={styles.servingSize}
                            onBlur={() => {
                                const parsed = servingSizeSchema.safeParse(servingSize);
                                if (parsed.success) {
                                    const { unit, value } = parsed.data;
                                    setServingSize(`${value} ${unit || 'g'}`);
                                } else {
                                    const val = parseFloat(servingSize);
                                    setServingSize(isNaN(val) ? '1 g' : val + ' g');
                                }
                            }} />
                    </View>

                    <Text style={[styles.title, { marginTop: 15 }]}>Macros</Text>
                    <View style={{
                        alignContent: 'center',
                        width: '100%',
                        flexDirection: 'row',
                        justifyContent: 'center'
                    }}>

                        <View style={styles.nutrientsContainer}>
                            <View style={[styles.nutrientRow, { marginBottom: 10, }]}>
                                <Text style={[styles.nutrientLabel]}>Calories</Text>
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
                    <View style={styles.buttonContainer}>
                        <RippleButton text="Save" style={styles.saveButton} onPress={async () => {
                            const ok = await saveFood();
                            if (ok) navigation.navigate({ name: 'Home', params: undefined });
                        }} />
                    </View>

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
        paddingHorizontal: 20,

    },
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    container: {
        alignItems: 'center',
        backgroundColor: 'transparent',
        marginTop: 10,
        maxWidth: 650,
    },
    title: {
        fontSize: 16,
        marginBottom: 10,
        color: colors.textPrimary,
    },

    innerContainer: {
        alignItems: 'flex-start',
        padding: 15,
        paddingTop: 35,
        borderRadius: 30,
        borderBottomRightRadius: 30,
        borderBottomLeftRadius: 30,
        backgroundColor: 'white',
        paddingBottom: 25,

    },
    mealName: {
        fontSize: 18,
        fontWeight: '600',
        height: 40,
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
        color: colors.textSubtle,
        marginBottom: 7,

    },
    brandName: {
        fontSize: 18,
        height: 40,
        color: colors.textSubtle,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
        width: '100%',
        marginBottom: 7,
    },
    servingSize: {
        fontSize: 18,
        height: 40,
        color: colors.textSubtle,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
        marginBottom: 7,
        paddingLeft: 5,
        width: 100,
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
    },
    saveButton: {
        backgroundColor: colors.textPrimary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
});


