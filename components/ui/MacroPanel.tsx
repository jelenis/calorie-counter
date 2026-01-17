import { View, Text, StyleSheet } from 'react-native'
import PanelList from '@components/ui/PanelList'
import Animated, { FadeIn, FadeOut, useSharedValue, withSpring } from 'react-native-reanimated'
import ProgressBar from '@components/ui/ProgressBar';
import { TotalCalories } from '@components/ui/MacroProgressBars';
import { Macro } from '@utils/db';
import colors from '@styles/colors';
import { useEffect } from 'react';

type MacroPanelProps = {
    macros: Macro,
    calories: number,
    carbs: number,
    protein: number,
    fat: number
}

export default function MacroPanel({ macros, calories, carbs, protein, fat }: MacroPanelProps) {
    function formatNumber(num: number) {
        return num < 1 ? num.toFixed(2) : Math.round(num);
    }
    return (<PanelList
        panels={[
            <Animated.View entering={FadeIn} exiting={FadeOut} style={{ justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ marginBottom: '3%' }}>
                    <TotalCalories calories={Math.min(Math.round(calories), 99999)} />
                </View>
                <ProgressBar progress={(calories / (macros ? macros.calories : 1)) * 100} />
            </Animated.View>,

            <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
                <View>
                    <Text style={styles.macroLabel}>Carbs</Text>
                    <ProgressCircle color={colors.warn} progress={macros ? (carbs / macros.carbs) : 0} >
                        <Text style={styles.macroText}>{formatNumber(carbs)}<Text style={{ position: "relative" }}>g</Text></Text>
                    </ProgressCircle>
                </View>
                <View>
                    <Text style={styles.macroLabel}>Protein</Text>
                    <ProgressCircle color={colors.textPrimary} progress={macros ? (protein / macros.protein) : 0}>
                        <Text style={styles.macroText}>{formatNumber(protein)}<Text style={{ position: "relative" }}>g</Text></Text>
                    </ProgressCircle>
                </View>
                <View>
                    <Text style={styles.macroLabel}>Fat</Text>
                    <ProgressCircle color={colors.orange} progress={macros ? (fat / macros.fat) : 0} >
                        <Text style={styles.macroText}>{formatNumber(fat)}<Text style={{ position: "relative" }}>g</Text></Text>
                    </ProgressCircle>
                </View>
            </View>

            // TODO: have some sort of breakdown? 

        ]} />)
}


const styles = StyleSheet.create({
    macroText: {
        color: colors.textSubtle,
        textAlign: 'center',
        fontWeight: 600

    },
    macroLabel: {
        marginBottom: 15,
        fontSize: 18,
        fontWeight: 600,
        textAlign: 'center',
        color: colors.textSubtle
    }
})
import Svg, { Circle, Text as TextSVG } from 'react-native-svg';
import { useAnimatedProps } from 'react-native-reanimated';
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
function ProgressCircle({ progress, color, children }: { progress: number, color: string, children: React.ReactNode }) {
    const p = useSharedValue(progress)
    const stroke = 12
    const r = 35;


    // calculate the size based on the radius and stroke
    const w = r * 2 + stroke;
    const rot = 10
    const C = 2 * Math.PI * r; // circumference

    useEffect(() => {
        const clamped = Math.max(0, Math.min(1, progress))
        p.value = withSpring(Math.max(0, clamped))
    }, [progress])

    const animatedProps = useAnimatedProps(() => {
        return {
            // push the progress back what ever fraction is left
            // eg at 0% its the full circumference
            strokeDashoffset: C * (1 - p.value)
        };
    });


    return (
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Svg width={w} height={w}>
                <Circle
                    cx={w / 2}
                    cy={w / 2}
                    r={r}
                    stroke={color}
                    opacity={0.2}
                    strokeWidth={stroke}
                    fill="none"
                />
                <AnimatedCircle
                    cx={w / 2}
                    cy={w / 2}
                    r={r}
                    stroke={color}
                    strokeWidth={stroke}
                    fill="none"
                    animatedProps={animatedProps}
                    strokeDasharray={C}
                    transform={`rotate(${rot} ${w / 2} ${w / 2})`}
                />
            </Svg>
            <View style={{ position: 'absolute', top: '0%', justifyContent: 'center', height: '100%' }}>
                {children}
            </View>

        </View >

    );
}