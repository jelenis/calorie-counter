
import { View, Text, StyleSheet, Button, TextInput, FlatList } from 'react-native';
import EntryCard from '../components/EntryCard';
import Header from '../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../styles/colors';
import AddButton from '../components/AddButton';
import ProgressBar from '../components/ProgressBar';

const entries = [
    { id: '1', name: 'Breakfast', calories: 450, stats: 23 },
    { id: '2', name: 'Lunch', calories: 600, stats: 31 },
    { id: '3', name: 'Dinner', calories: 500, stats: 26 },
    { id: '4', name: 'Snack', calories: 150, stats: 8 },
    { id: '5', name: 'Coffee', calories: 50, stats: 3 },
    { id: '6', name: 'Protein Bar', calories: 200, stats: 10 },
    { id: '7', name: 'Salad', calories: 350, stats: 18 },
    { id: '8', name: 'Apple', calories: 95, stats: 5 },
    { id: '9', name: 'Pasta', calories: 550, stats: 28 },
    { id: '10', name: 'Yogurt', calories: 120, stats: 6 },
    { id: '11', name: 'Sandwich', calories: 400, stats: 21 },
];
function EntryList() {

    return (
        <FlatList
            showsVerticalScrollIndicator={false}
            style={{ flex: 1, marginTop: 20 }}

            data={entries}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <EntryCard key={item.id} data={item} />
            )}
        />

    );
}

import { useState } from 'react';
import TotalCalories from '../components/TotalCalories';
export default function HomeScreen({ navigation }: { navigation: any }) {
    const [calories, setCalories] = useState(1325);
    const dailyGoal = 2000;

    function onPressHandler() {
        setCalories(prev => Math.floor(prev + Math.random() * 400));
        navigation.navigate('AddModal', { data: entries });
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']} >
            <Header />
            <View style={{ marginBottom: '3%' }}>
                <TotalCalories calories={calories} />
            </View>
            <View style={styles.innerContainer}>
                <ProgressBar progress={(calories / dailyGoal) * 100} />
                <EntryList />
            </View>
            <AddButton onPress={onPressHandler} />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        width: '100%',
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
    }
})