
import { View, Text, StyleSheet, Button, TextInput, FlatList } from 'react-native';
import EntryCard from '../components/EntryCard';
import Header from '../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';

import colors from '../styles/colors';
import AddButton from '../components/AddButton';
import ProgressBar from '../components/ProgressBar';
import TotalCalories from '../components/TotalCalories';
import { getEntriesByDate, FoodEntry, getDayKey } from '../utils/db';
import { useFocusEffect } from '@react-navigation/native';
import { SectionList } from 'react-native';


type SectionProp = {
    category: string;
    data: FoodEntry[];
};

function EntryList({ sections, onPress }: { sections: SectionProp[], onPress: (id: number) => void }) {

    const renderItem = useCallback(({ item }:
        { item: FoodEntry }) => (
        <EntryCard data={item} onPress={() => {
            // call onPress with item id
            onPress(item.id);
        }} />
    ), [sections, onPress]);

    return (
        <SectionList
            showsVerticalScrollIndicator={false}
            style={{ flex: 1, marginTop: 20 }}
            sections={sections}

            keyExtractor={(item: any) => item.id}
            ListHeaderComponentStyle={{ backgroundColor: colors.background }}
            renderItem={renderItem}
            renderSectionHeader={({ section }:
                { section: SectionProp }) => (
                <Text style={styles.sectionHeader}>
                    {section.category}
                </Text>
            )}
        />

    );
}

function groupByMeal(rows: FoodEntry[]): { category: string; data: FoodEntry[] }[] {
    return [
        { category: 'Breakfast', data: rows.filter(e => e.category === 'breakfast'), },
        { category: 'Lunch', data: rows.filter(e => e.category === 'lunch'), },
        { category: 'Dinner', data: rows.filter(e => e.category === 'dinner'), },
        { category: 'Snacks', data: rows.filter(e => e.category === 'snack'), },
    ];
}



export default function HomeScreen({ navigation, params }: { navigation: any; params?: { foodEntry?: FoodEntry } }) {
    const [entries, setEntries] = useState<any[]>([]);
    const [currentDate, setCurrentDate] = useState(() => new Date());


    const fetchCaloriesForToday = useCallback(async () => {
        console.log('Fetching entries for date:', currentDate);
        try {
            const entries = await getEntriesByDate(currentDate);
            setEntries(entries);
        } catch (e) {
            console.error('Error fetching entries:', e);
        }
    }, [currentDate]);

    useFocusEffect(
        useCallback(() => {
            fetchCaloriesForToday();
            console.log("Screen focused, entries updated.");

        }, [fetchCaloriesForToday])
    );

    const dailyGoal = 2000;
    const calories = entries.reduce((total, entry) => total + entry.calories, 0);
    const groupedEntries = groupByMeal(entries);

    console.log(groupedEntries)

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']} >
            <Header />
            <View style={{ marginBottom: '3%' }}>
                <TotalCalories calories={calories} />
            </View>
            {/*  main container */}
            <View style={styles.innerContainer}>
                <ProgressBar progress={(calories / dailyGoal) * 100} />
                <EntryList sections={groupedEntries} onPress={(id: number) => navigation.navigate('EditScreen', { id })} />
            </View>

            {/* Floating add button  */}
            <AddButton onPress={() => navigation.navigate('AddScreen', {
                dateStr: getDayKey(currentDate)
            })} />
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
        fontSize: 18,
        backgroundColor: colors.background,
        paddingVertical: 5,
        paddingHorizontal: 10,

    }

})