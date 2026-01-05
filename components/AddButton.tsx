import { Pressable, StyleSheet, Text, View } from "react-native";
import colors from "../styles/colors";
export default function AddButton({ onPress }: { onPress: () => void }) {
    return (
        <Pressable style={styles.container} onPress={onPress}>
            <Text style={styles.plus}>+</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.textPrimary,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 30,
        right: 30,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
    },
    plus: {
        color: 'white',
        fontSize: 40,
        lineHeight: 40,
        fontWeight: '600',
    }
})