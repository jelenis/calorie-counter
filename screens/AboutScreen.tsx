import colors from '@styles/colors';
import MenuCard from '@components/ui/MenuCard';
import { ScrollView, StyleSheet, Text, View, Pressable, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PRIVACY_POLICY_TEXT = `Privacy Policy

Last updated: January 18 2026

This application does not collect personal information such as names, email addresses, or account data.

Search queries submitted by users are sent to our backend solely to process and return requested results. These queries are not used for tracking, advertising, or analytics and are not linked to identifiable individuals.

All meal entries and food data are stored locally on the user’s device and are not transmitted to us.

We do not sell or share user data with third parties.`;

export default function AboutScreen({ navigation }: { navigation: any }) {
    const { height: windowHeight } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const scrollViewportHeight = Math.max(240, windowHeight - insets.top - insets.bottom - 220);

    return (
        <MenuCard title="About">
            <ScrollView
                style={{ height: scrollViewportHeight, alignSelf: 'stretch' }}
                contentContainerStyle={{ paddingBottom: 10 }}
                showsVerticalScrollIndicator
            >
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Privacy Policy</Text>
                    <View style={styles.noticeBox}>
                        <Text style={styles.noticeText}>{PRIVACY_POLICY_TEXT}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notices</Text>
                    <Pressable onPress={() => navigation.navigate('OpenSourceData')} style={styles.linkRow}>
                        <Text style={styles.linkText}>Open Source Data</Text>
                    </Pressable>
                    <Pressable onPress={() => navigation.navigate('ThirdPartyLicenses')} style={styles.linkRow}>
                        <Text style={styles.linkText}>Third Party Licenses</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </MenuCard>
    );
}

const styles = StyleSheet.create({
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
        paddingVertical: 10,
    },
    linkText: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: '700',
    },
});
