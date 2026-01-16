import { View, TextInput, StyleSheet } from 'react-native';
import { cardShadow, inputCard } from '@styles/card';

export default function Input({ onChangeText = () => { }, style, containerStyle, ...rest }:
    { onChangeText?: (text: string) => void; containerStyle?: object } & TextInput['props']) {
    return (
        <View style={[styles.outerInputContainer, containerStyle]}>
            <TextInput style={[styles.input, style]}
                onChangeText={(text) => {
                    onChangeText(text);
                }}
                {...rest} />
        </View>
    );
}

const styles = StyleSheet.create({
    outerInputContainer: {

        justifyContent: 'center',
        alignItems: 'center',
        flexGrow: 1,
        ...inputCard,
        ...cardShadow
    },
    input: {
        width: '100%',
        paddingVertical: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        borderWidth: 0,
        borderColor: 'transparent',
    },
}); 
