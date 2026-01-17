import { StyleSheet, Text, Platform } from 'react-native';
import colors from '@styles/colors';
import { AnimatedNumber } from '@components/animations/AnimatedCounters';

function formatNumber(num: number) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
export function TotalCalories({ calories = 0 }) {
    return (
        <AnimatedNumber
            calories={calories}
            textStyle={styles.calorieText}
            unit="Cal"
            unitStyle={styles.unitStyle}
        />
    );
}



const styles = StyleSheet.create({
    calorieText: {
        fontSize: 50,
        fontWeight: Platform.OS === 'ios' ? '800' : '900',
        color: colors.textPrimary,
        letterSpacing: 2,
    },
    unitStyle: {
        fontSize: 30,
        marginLeft: 10,
        marginBottom: Platform.OS === 'ios' ? 5 : 0,
        fontWeight: Platform.OS === 'ios' ? '800' : '900',
        color: colors.textSubtle,
    }
})
