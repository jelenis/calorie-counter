import { View, Text, StyleSheet, Pressable } from 'react-native';
import colors from '@styles/colors';
import { cardShadow } from '@styles/card';
import { FoodEntry } from '@utils/db';
import AntDesign from '@expo/vector-icons/AntDesign';

type EntryCardProps = {
    data: FoodEntry
    onDelete: () => void
    onPress: () => void
}

export default function EntryCard({ data, onPress, onDelete }: EntryCardProps) {
    const { name, calories, protein, fat, carbs, brand, quantity } = data;
    return (
        <Pressable onPress={onPress} style={styles.container}>
            <Text style={styles.calories}>{Math.round(calories * quantity)} Cal</Text>
            <Text style={styles.name}>{name.slice(0, 40)}</Text>
            <View style={styles.row}>
                <Text style={styles.brand}>{brand}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.brand}>{Math.round(quantity)} g</Text>
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
        paddingHorizontal: '4%',
        paddingVertical: '2%',
        backgroundColor: 'white',
        borderRadius: 8,
        minWidth: 300,
        minHeight: 50,
        elevation: 2,
        ...cardShadow,
    },

    name: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5
    },
    stats: {
        marginLeft: 10,
        color: colors.textSubtle,
        flexDirection: 'row',
        gap: 15,
    },
    brand: {
        color: colors.textSubtle,
    },
    calories: {
        position: 'absolute',
        top: '40%',
        right: 15,
        fontSize: 18,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    nutrient: {
        fontWeight: '400',
        color: colors.textPrimary,
    }
})
