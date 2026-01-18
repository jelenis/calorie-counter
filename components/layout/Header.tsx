import { Text, View, StyleSheet, Pressable } from 'react-native';
import colors from '@styles/colors';
import Entypo from '@expo/vector-icons/Entypo';

type HeaderProps = {
    date: Date;
    onBackPress?: () => void;
    onForwardPress?: () => void;
    forwardDisabled?: boolean;
    onAboutPress?: () => void;
};

export default function Header({ onBackPress, onForwardPress, date, forwardDisabled, onAboutPress }: HeaderProps) {
    const dateString = `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}`;
    return (
        <View style={styles.container}>
            <Pressable style={styles.dateContainer}>
                <Entypo onPress={onBackPress} name="chevron-small-left" size={24} color="black" />
                <Text style={styles.title}>{dateString}</Text>
                <View style={styles.spacer} />
                {!forwardDisabled ? null : <Entypo onPress={onForwardPress} name="chevron-small-right" size={24} color="black" />}
                {!onAboutPress ? null : (
                    <Entypo onPress={onAboutPress} name="info-with-circle" size={20} color={colors.placeholder} style={{ marginRight: 12 }} />
                )}
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
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 10,
    },
    title: {
        color: colors.textSecondary,
        fontSize: 20,
        fontWeight: 'bold',
    },
    spacer: {
        flex: 1,
    },
})
