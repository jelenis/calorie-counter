
import { View, Text, StyleSheet, Button, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { SectionList } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut, FadeOutDown, LinearTransition } from 'react-native-reanimated';

import colors from '@styles/colors';
import AddButton from '@components/ui/AddButton';
import ProgressBar from '@components/ui/ProgressBar';
import TotalCalories from '@components/animations/TotalCalories';
import AddEntryMenu from '@components/entries/AddEntryMenu';
import EntryCard from '@components/entries/EntryCard';
import Header from '@components/layout/Header';
import * as db from '@utils/db';
import type { FoodEntry } from '../utils/db';
import Menu from '@components/layout/Menu';


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

            keyExtractor={(item: any) => item.id}
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

export default function HomeScreen({ navigation, params }: { navigation: any; params?: { foodEntry?: FoodEntry } }) {
    const [entries, setEntries] = useState<any[]>([]);
    const [currentDate, setCurrentDate] = useState(() => new Date());
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<FoodEntry | null>(null);
    const [testCount, setTestCount] = useState(0);
    const fetchCaloriesForToday = useCallback(async () => {
        console.log('Fetching entries for date:', currentDate);
        try {
            const entries = await db.getEntriesByDate(currentDate);
            setEntries(entries);
        } catch (e) {
            console.error('Error fetching entries:', e);
        }
    }, [currentDate]);

    useFocusEffect(
        useCallback(() => {
            fetchCaloriesForToday();

        }, [fetchCaloriesForToday])
    );

    async function updateFoodEntry(item: Partial<FoodEntry>) {
        console.log('Adding/Updating entry:', item);
        try {
            await db.insertEntry(currentDate, item as FoodEntry);
            fetchCaloriesForToday();

        } catch (e) {
            console.error('Error inserting entry:', e);
        }
    }
    async function deleteFoodEntry(entryId: number) {
        console.log('Deleting entry with ID:', entryId);
        try {
            await db.deleteEntry(entryId);
            fetchCaloriesForToday();
        } catch (e) {
            console.error('Error deleting entry:', e);
        }
    }

    const dailyGoal = 2000;
    const calories = entries.reduce((total, entry) => total + entry.calories * entry.quantity, 0);
    const groupedEntries = groupByMeal(entries).filter(section => section.data.length > 0);

    function addDays(date: Date, days: number) {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + days);
        return newDate;
    }
    console.log('currentDate:', currentDate);
    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']} >
            <Header
                onBackPress={() => {
                    setCurrentDate(addDays(currentDate, -1));
                }}
                onForwardPress={() => {
                    setCurrentDate(addDays(currentDate, 1));
                }}
                forwardDisabled={currentDate < new Date()}
                date={currentDate} />
            <View style={{ marginBottom: '3%' }}>
                <TotalCalories calories={Math.min(Math.round(calories), 99999)} />
            </View>
            {/*  main container */}
            <View style={styles.innerContainer}>
                <ProgressBar progress={(calories / dailyGoal) * 100} />
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
            </View>

            {/* Floating add button  */}
            <AddButton onPress={() => navigation.navigate('AddScreen', {
                dateStr: db.getDayKey(currentDate)
            })} />

            {/* test button */}
            <Button title="Test" onPress={() => setTestCount(prev => prev + 1)} />

            {/* Add Entry Menu Modal */}
            <Menu modalVisible={modalVisible} setModalVisible={setModalVisible}>
                <AddEntryMenu
                    selectedItem={selectedItem}
                    setModalVisible={setModalVisible}
                    addFoodEntry={(item) => updateFoodEntry(item)}
                    deleteFoodEntry={(id) => { deleteFoodEntry(id); }}
                />
            </Menu>
        </SafeAreaView>
    )
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
