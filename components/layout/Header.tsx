import { Text, View, StyleSheet, Pressable } from 'react-native';
import colors from '@styles/colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function Header() {
    return (
        <View style={styles.container}>
            <Pressable style={styles.dateContainer}>
                <Text style={styles.title}>Today</Text>
                <MaterialIcons name="arrow-drop-down" size={24} color={colors.textSecondary} />
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: '10%',
    },
    dateContainer: {
        padding: 5,
        marginLeft: 20,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    title: {
        color: colors.textSecondary,
        fontSize: 20,
        fontWeight: 'bold',
    }
})
