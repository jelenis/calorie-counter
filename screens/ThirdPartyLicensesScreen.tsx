import colors from '@styles/colors';
import { StyleSheet, Text, Pressable, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { FlatList } from 'react-native-gesture-handler';

import { THIRD_PARTY_LICENSES } from '../thirdPartyLicenses';

export default function ThirdPartyLicensesScreen() {
    const navigation = useNavigation<any>();
    const { height: windowHeight } = useWindowDimensions();
    const paragraphs = THIRD_PARTY_LICENSES.split('\n\n')

    return (

        <SafeAreaView style={{ flex: 1, padding: 3 }}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backRow}>
                <Text style={styles.backText}>Back</Text>
            </Pressable>
            <FlatList
                style={{ flex: 1, alignSelf: 'stretch' }}
                contentContainerStyle={{ paddingBottom: 10 }}
                showsVerticalScrollIndicator
                data={paragraphs}
                keyExtractor={(_, index) => index.toString()}

                renderItem={({ item }) => (
                    <View>
                        <Text selectable style={styles.noticeText}>{item + '\n'}</Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    backRow: {
        marginBottom: 10,
    },
    backText: {
        color: colors.textSubtle,
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 10
    },
    noticeText: {
        color: colors.textSubtle,
        fontSize: 12,
        lineHeight: 18,
        marginBottom: 10,
    },
});
