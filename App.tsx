import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { Query, QueryClient, QueryClientProvider } from '@tanstack/react-query';

// react navigation
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { ModalStackParamList, RootTabParamList } from './types/navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Icons
import Ionicons from '@expo/vector-icons/Ionicons';

// Screen
import HomeScreen from '@screens/HomeScreen'
import AddScreen from '@screens/AddScreen';
import GoalScreen from '@screens/GoalScreen';
import colors from '@styles/colors';


// Create a client
const queryClient = new QueryClient()

const ModalStack = createNativeStackNavigator<ModalStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

function TabBar() {
  return (
    <Tab.Navigator screenOptions={{
      tabBarActiveTintColor: colors.textPrimary,
      headerShown: false,
      animation: 'fade',
      tabBarStyle: { alignContent: 'center', paddingTop: '2%', height: '9%' }
    }}>
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          popToTopOnBlur: true,
          tabBarIcon: ({ focused, color, size }) => {
            return <Ionicons name={'home'} size={size} color={color} />;
          }
        }}
      />
      <Tab.Screen
        name="GoalScreen"
        options={{

          tabBarLabel: 'Goals',
          tabBarIcon: ({ focused, color, size }) => {

            return <Ionicons name={'trophy'} size={size} color={color} />;
          }
        }}
        component={GoalScreen}
      />
    </Tab.Navigator>
  );
}
function HomeStack() {
  return (

    <ModalStack.Navigator screenOptions={{ headerShown: false }}>
      <ModalStack.Screen name="HomeScreen" component={HomeScreen} />
      <ModalStack.Screen
        name="AddScreen"
        options={{
          presentation: 'containedModal',
          animation: 'fade_from_bottom',
          animationDuration: 300,
        }}
        component={AddScreen}
      />
    </ModalStack.Navigator>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <View style={styles.container}>
          <NavigationContainer>
            <TabBar />
          </NavigationContainer>
        </View>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
