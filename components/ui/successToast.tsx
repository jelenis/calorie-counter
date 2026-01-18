import { View, Text } from "react-native";
import Toast from "react-native-toast-message";
import colors from "@styles/colors";
import Ionicons from '@expo/vector-icons/Ionicons';
import { cardShadow } from "@styles/card";

export const toastConfig = {
    success: ({ text1 }: { text1?: string }) => (
        <View style={cardShadow}>
            <View
                style={{
                    height: 60,
                    width: '90%',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    borderRadius: 15,
                    overflow: 'hidden',
                    flexDirection: 'row',
                    backgroundColor: 'white',
                }}
            >
                <View style={{
                    paddingHorizontal: 10,
                    marginLeft: 20,
                    flex: 1,
                    justifyContent: 'center',
                    backgroundColor: 'white',
                    height: '100%',
                }}>
                    {!!text1 && (
                        <Text style={{ color: colors.textPrimary, fontWeight: '600', fontSize: 16 }}>
                            {text1}
                        </Text>
                    )}
                </View>

                <View style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                    paddingHorizontal: 15,
                    backgroundColor: colors.success,
                    height: '100%'
                }}>
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons
                            name="checkmark-circle-outline"
                            size={26}
                            color='white' />
                    </View>
                </View>
            </View>
        </View>
    ),
};

export function ToastHost() {
    return (
        <Toast
            config={toastConfig as any}
            position='top'
            visibilityTime={1200}
            topOffset={50}
        />
    );
}