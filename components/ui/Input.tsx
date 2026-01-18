import React from 'react';
import { View, TextInput, StyleSheet, type TextInputProps } from 'react-native';
import { cardShadow, inputCard } from '@styles/card';

type InputProps = {
    onChangeText?: (text: string) => void;
    containerStyle?: object;
} & TextInputProps;

const Input = React.forwardRef<TextInput, InputProps>(
    ({ onChangeText = () => { }, style, containerStyle, ...rest }, ref) => {
        return (
            <View style={[styles.outerInputContainer, containerStyle]}>
                <TextInput
                    ref={ref}
                    style={[styles.input, style]}
                    onChangeText={(text) => {
                        onChangeText(text);
                    }}
                    {...rest}
                />
            </View>
        );
    },
);

Input.displayName = 'Input';

export default Input;

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
