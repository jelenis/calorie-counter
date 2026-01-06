import { View, Text, StyleSheet, Pressable } from 'react-native';
import colors from '../styles/colors';
import { cardShadow } from '../styles/card';
type EntryCardProps = {
    data: {
        id: string;
        name: string;
        calories: number;
        stats?: number;
    }
}

export default function EntryCard({ data }: EntryCardProps) {
    const { name, calories, stats } = data;
    return (
        <Pressable style={styles.container}>
            <Text style={styles.name}>{name.slice(0, 20)}</Text>
            <View style={styles.bottomRow}>
                <Text style={styles.calories}>{calories} cal</Text>
                <Text style={styles.stats}>{stats}%</Text>
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
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 4,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    stats: {
        marginLeft: 10,
        color: colors.textSubtle,
    },
    calories: {
        fontWeight: '400',
        color: colors.textSubtle,
    }
})