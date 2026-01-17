
import { View, Text, StyleSheet, Button, TextInput, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { SectionList } from 'react-native';
import Animated, { FadeIn, FadeInUp, FadeOut, FadeOutDown, } from 'react-native-reanimated';

import colors from '@styles/colors';
import AddButton from '@components/ui/AddButton';

import AddEntryMenu from '@components/entries/AddEntryMenu';
import EntryCard from '@components/entries/EntryCard';
import Header from '@components/layout/Header';
import * as db from '@utils/db';
import type { FoodEntry } from '../utils/db';
import Menu from '@components/layout/Menu';
import { type Macro } from '@utils/db';
import MacroPanel from '@components/ui/MacroPanel'

import EvilIcons from '@expo/vector-icons/EvilIcons';
import { cardShadow, inputCard } from '@styles/card';


type SectionProp = {
    time: string;
    data: FoodEntry[];
};
type EntryListProps = { sections: SectionProp[], onPress: (id: number) => void, onDelete: (id: number) => void }

function EntryList({ sections, onPress, onDelete }: EntryListProps) {

    function renderItem({ item }: { item: FoodEntry }) {
        return (
            <Animated.View exiting={FadeOutDown} entering={FadeInUp}>
                <EntryCard data={item} onPress={() => {
                    // call onPress with item id
                    onPress(item.id);
                }}
                    onDelete={() => onDelete(item.id)} />
            </Animated.View>
        );
    }
    return (
        <SectionList
            showsVerticalScrollIndicator={false}
            style={{ flex: 1, marginTop: 20, width: '100%' }}
            sections={sections}

            keyExtractor={(item: any) => String(item.id)}
            ListHeaderComponentStyle={{ backgroundColor: colors.background }}
            renderItem={renderItem}

            renderSectionHeader={({ section }:
                { section: SectionProp }) => (
                <Text style={styles.sectionHeader}>
                    {section.time}
                </Text>
            )}
        />

    );
}

function groupByMeal(rows: FoodEntry[]): { time: string; data: FoodEntry[] }[] {
    return [
        { time: 'Breakfast', data: rows.filter(e => e.time === 'breakfast'), },
        { time: 'Lunch', data: rows.filter(e => e.time === 'lunch'), },
        { time: 'Dinner', data: rows.filter(e => e.time === 'dinner'), },
        { time: 'Snacks', data: rows.filter(e => e.time === 'snack'), },
    ];
}
function sumNutrientTotals(entries: FoodEntry[], nutrient: keyof FoodEntry) {
    return entries.reduce((total: number, entry: FoodEntry) => total + (Number(entry[nutrient]) * entry.quantity), 0);
}

export default function HomeScreen({ navigation, params }: { navigation: any; params?: { foodEntry?: FoodEntry } }) {
    const [entries, setEntries] = useState<any[]>([]);
    const [currentDate, setCurrentDate] = useState(() => new Date());
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<FoodEntry | null>(null);
    const [macros, setMacros] = useState<Macro | null>(null);

    const fetchMacrosForToday = useCallback(async () => {
        try {
            const macros = await db.getMacros();
            setMacros(macros);
        } catch (e) {
            console.error('Error fetching macros:', e);
        }
    }, []);

    const fetchCaloriesForToday = useCallback(async () => {
        try {
            const entries = await db.getEntriesByDate(currentDate) as FoodEntry[];
            setEntries(entries);
        } catch (e) {
            console.error('Error fetching entries:', e);
        }
    }, [currentDate]);

    useFocusEffect(
        useCallback(() => {
            fetchCaloriesForToday();
            fetchMacrosForToday();
        }, [fetchCaloriesForToday, fetchMacrosForToday])
    );

    useEffect(() => {
        fetchMacrosForToday();
    }, [fetchMacrosForToday]);


    async function updateFoodEntry(item: Partial<FoodEntry>) {
        try {
            await db.insertEntry(currentDate, item as FoodEntry);
            fetchCaloriesForToday();

        } catch (e) {
            console.error('Error inserting entry:', e);
        }
    }
    async function deleteFoodEntry(entryId: number) {
        try {
            await db.deleteEntry(entryId);
            fetchCaloriesForToday();
        } catch (e) {
            console.error('Error deleting entry:', e);
        }
    }


    const calories = sumNutrientTotals(entries, 'calories');
    const protein = sumNutrientTotals(entries, 'protein');
    const carbs = sumNutrientTotals(entries, 'carbs');
    const fat = sumNutrientTotals(entries, 'fat');

    const groupedEntries = groupByMeal(entries).filter(section => section.data.length > 0);

    function addDays(date: Date, days: number) {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + days);
        return newDate;
    }
    const hasEntries = entries.length > 0;
    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']} >
            <Header
                onBackPress={() => {
                    setCurrentDate(addDays(currentDate, -1));
                }}
                onForwardPress={() => {
                    setCurrentDate(addDays(currentDate, 1));
                }}
                // Disable forward button if currentDate is today or later
                forwardDisabled={currentDate < new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())}
                date={currentDate} />



            {hasEntries ? (
                <>
                    <MacroPanel
                        macros={macros}
                        calories={calories}
                        protein={protein}
                        fat={fat}
                        carbs={carbs} />

                    {/*  main container */}
                    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.innerContainer}>
                        <EntryList
                            sections={groupedEntries}
                            onPress={(id: number) => {
                                const entry = entries.find(e => e.id === id) || null;
                                setSelectedItem(entry);
                                setModalVisible(true);
                            }}
                            onDelete={(id: number) => {
                                // open confirmation modal before deleting
                                // todo make a gesture swipe to delete
                            }}
                        />
                    </Animated.View>
                    {/* Floating add button  */}
                    <AddButton onPress={() => navigation.navigate('AddScreen', {
                        dateStr: db.getDayKey(currentDate)
                    })} />
                </>
            ) : (
                <FakeSearchBar navigation={navigation} currentDate={currentDate} />
            )}


            {/* Add Entry Menu Modal */}
            <Menu visible={modalVisible} setVisible={setModalVisible}>

                <AddEntryMenu
                    selectedItem={selectedItem}
                    closeModal={() => setModalVisible(false)}
                    addFoodEntry={async (item) => await updateFoodEntry(item)}
                    deleteFoodEntry={async (id) => { await deleteFoodEntry(id); }}
                />
            </Menu>
        </SafeAreaView>
    )
}


function FakeSearchBar({ navigation, currentDate }: { navigation: any, currentDate: Date }) {

    return (
        <Animated.View
            style={[{
                marginTop: 60,
                flex: 1,
                width: '80%',
                maxWidth: 600,
            },]}
            entering={FadeInUp}
            exiting={FadeOutDown}
        >
            <Text style={{
                textAlign: 'center',
                color: colors.textPrimary,
                marginBottom: 32,
                fontSize: 20,
                fontWeight: '600'
            }}>
                Add a meal to start tracking.
            </Text>
            <Pressable style={[{
                height: 40,
                justifyContent: 'center',
                paddingHorizontal: 10,
            }, cardShadow, inputCard]}

                onPress={() => {
                    const date = db.getDayKey(currentDate);
                    navigation.navigate('AddScreen', {
                        dateStr: date
                    });

                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                    <EvilIcons name="search" size={24} color="black" /><Text style={{ color: colors.placeholder }}>Search for a food...</Text>
                </View>
            </Pressable>

        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        width: '100%',
        backgroundColor: colors.background,
    },
    innerContainer: {
        flex: 1,
        width: '90%',
        alignItems: 'center',
    },
    calorieText: {
        fontSize: 50,
        fontWeight: '800',
        color: colors.textPrimary,
        marginBottom: '3%',
    },
    calorieTextUnit: {
        fontSize: 40
    },
    sectionHeader: {
        fontWeight: 'bold',
        flex: 1,
        fontSize: 20,
        backgroundColor: colors.background,
        paddingVertical: 5,
        paddingHorizontal: 10,
        color: colors.textSecondary,


    }

})
