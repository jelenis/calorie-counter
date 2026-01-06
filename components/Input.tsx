import { View, TextInput, StyleSheet } from 'react-native';
import { cardShadow } from '../styles/card';
export default function Input({ onChangeText = () => { }, ...rest }: { onChangeText?: (text: string) => void; } & TextInput['props']) {
    // Placeholder for autocomplete input component
    return (
        <View style={styles.outerInputContainer}>
            <TextInput style={styles.input}
                onChangeText={(text) => {
                    onChangeText(text);
                }}
                {...rest} />
        </View>
    );
}

const styles = StyleSheet.create({
    outerInputContainer: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DDD',
        ...cardShadow
    },
    input: {
        width: '100%',
        paddingVertical: 10,
        paddingHorizontal: 15,
        fontSize: 20,
        borderWidth: 0,
        borderColor: 'transparent',
    },
}); 