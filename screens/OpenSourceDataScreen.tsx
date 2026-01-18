import colors from '@styles/colors';
import MenuCard from '@components/ui/MenuCard';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const DATA_SOURCE_NOTICE_TEXT = `OPEN FOOD FACTS
Food product data is provided by Open Food Facts contributors.

License: Open Database License (ODbL) v1.0.
Attribution: © Open Food Facts contributors.

Data is available at https://world.openfoodfacts.org.
In accordance with the ODbL, any derivative database created using this
data is also made available under the ODbL.`;

function openUrl(url: string) {
    if (!url) return;
    Linking.openURL(url).catch((e) => {
        console.error('Failed to open URL', e);
    });
}

export default function OpenSourceDataScreen() {
    const navigation = useNavigation<any>();
    const { height: windowHeight } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const scrollViewportHeight = Math.max(240, windowHeight - insets.top - insets.bottom - 220);

    return (
        <MenuCard title="Open Source Data">
            <ScrollView
                style={{ height: scrollViewportHeight, alignSelf: 'stretch' }}
                contentContainerStyle={{ paddingBottom: 10 }}
                showsVerticalScrollIndicator
            >
                <Pressable onPress={() => navigation.goBack()} style={styles.backRow}>
                    <Text style={styles.backText}>Back</Text>
                </Pressable>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Open Source Data</Text>
                    <View style={styles.noticeBox}>
                        <Text selectable style={styles.noticeText}>
                            {DATA_SOURCE_NOTICE_TEXT}
                        </Text>
                    </View>

                    <Pressable onPress={() => openUrl('https://world.openfoodfacts.org')} style={styles.linkRow}>
                        <Text selectable style={styles.linkText}>https://world.openfoodfacts.org</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </MenuCard>
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
    },
    section: {
        alignSelf: 'stretch',
        marginBottom: 16,
    },
    sectionTitle: {
        color: colors.textSecondary,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 10,
    },
    noticeBox: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.06)',
        backgroundColor: 'white',
        padding: 12,
    },
    noticeText: {
        color: colors.textSubtle,
        fontSize: 12,
        lineHeight: 18,
    },
    linkRow: {
        marginTop: 10,
    },
    linkText: {
        color: colors.textPrimary,
        fontSize: 12,
        lineHeight: 18,
        fontWeight: '700',
    },
});
