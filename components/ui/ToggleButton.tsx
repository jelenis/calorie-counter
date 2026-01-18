import { TouchRipple } from "@components/feedback";
import React, { useEffect } from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import colors from "@styles/colors";

type ToggleButtonProps = {
    toggled: boolean;
    onPress: () => void;
    children: React.ReactNode;
    containerStyle?: ViewStyle;
};

export default function ToggleButton({ toggled, onPress, children, containerStyle }: ToggleButtonProps) {


    const viewStyles = toggled ? [styles.container, styles.toggledContainer, containerStyle]
        : [styles.container, containerStyle];

    return (
        <View style={[styles.outerContainer]}>
            <TouchRipple
                onPress={() => onPress()}
                color={colors.ripple}
                style={viewStyles}>

                {children}
            </TouchRipple>
        </View>
    )
}

type ToggleListButtonProps = {
    data: string[]
    defaultValue: string;
    onChange: (key: string, value: boolean) => void;
};
export function ToggleListButton({ data, defaultValue, onChange }: ToggleListButtonProps) {
    const scale = useSharedValue(1);
    const [toggledButtons, setToggledButtons] = React.useState(data.map((key, index) => {
        // find the matching value and make it true
        return key.toLowerCase().trim() === defaultValue.toLowerCase().trim();
    }));


    useEffect(() => {
        const activeIndex = toggledButtons.findIndex(Boolean);
        if (activeIndex !== -1) {
            onChange(data[activeIndex], true);
        }
    }, [toggledButtons, data, onChange]);


    function getBorderStyle(index: number) {
        if (toggledButtons.length > 2 && index > 0 && index < toggledButtons.length - 1) {
            return styles.middleContainer;
        } else if (index === 0) {
            return { borderTopRightRadius: 0, borderBottomRightRadius: 0 };
        } else if (index === toggledButtons.length - 1) {
            return { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 };
        }
        return {};
    }

    return (
        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', }}>
            {toggledButtons.map((toggled, index) => (
                <ToggleButton
                    key={`${index}-${data[index]}`}
                    toggled={toggled}

                    onPress={() => {
                        setToggledButtons(prev => {
                            const newToggles = [...prev].fill(false);
                            newToggles[index] = !newToggles[index];
                            return newToggles;
                        });
                    }}
                    containerStyle={getBorderStyle(index)}
                >
                    <Text style={[styles.text, toggled ? styles.toggledText : {}]}>{data[index]}</Text>
                </ToggleButton>
            ))}
        </View>)
}

const styles = StyleSheet.create({
    outerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: 100,
        height: 40,
        flex: 1,
    },
    container: {
        borderRadius: 10,
        backgroundColor: colors.textPrimary,
    },
    middleContainer: {
        borderRadius: 0,
    },
    toggledContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        borderColor: colors.textPrimary,
        borderWidth: 2,
    },
    text: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',

    },
    toggledText: {
        color: colors.textPrimary,
    },
});