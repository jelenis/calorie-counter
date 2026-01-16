import { StatusBar } from 'expo-status-bar';
import React from 'react';
// Simple ErrorBoundary for debugging
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ color: 'red', fontWeight: 'bold', fontSize: 18 }}>Something went wrong.</Text>
          <Text selectable style={{ color: 'red', marginTop: 12 }}>{String(this.state.error)}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}
import { StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Query, QueryClient, QueryClientProvider } from '@tanstack/react-query';

// react navigation
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { ModalStackParamList, RootTabParamList } from '@utils/types';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Icons
import Ionicons from '@expo/vector-icons/Ionicons';

// Screen
import HomeScreen from '@screens/HomeScreen'
import AddScreen from '@screens/AddScreen';
import GoalScreen from '@screens/GoalScreen';
import CreateFoodScreen from '@screens/CreateFoodScreen';
import colors from '@styles/colors';


// Create a client
const queryClient = new QueryClient()

const ModalStack = createNativeStackNavigator<ModalStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

function TabBar() {
  return (
    <Tab.Navigator
      initialRouteName="Home"

      screenOptions={{
        tabBarActiveTintColor: colors.textPrimary,
        headerShown: false,
        popToTopOnBlur: true,
        tabBarStyle: { alignContent: 'center', paddingTop: '2%', height: 80 },
      }}
    >
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
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ focused, color, size }) => {
            return <Ionicons name={'home'} size={size} color={color} />;
          }
        }}
      />
      <Tab.Screen
        name="CreateFoodScreen"
        options={{
          tabBarLabel: 'Create',
          tabBarIcon: ({ focused, color, size }) => {
            return <MaterialCommunityIcons name="silverware-fork-knife" size={size} color={color} />
          }
        }}
        component={CreateFoodScreen}
      />

    </Tab.Navigator>
  );
}
function HomeStack() {
  return (
    <ModalStack.Navigator screenOptions={{ headerShown: false }}>
      <ModalStack.Screen name="HomeScreen"
        options={{
          presentation: 'card',
          gestureEnabled: true,
          animationDuration: 300,
        }}

        component={HomeScreen} />
      <ModalStack.Screen
        name="AddScreen"
        options={{
          presentation: 'card',
          gestureEnabled: true,
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
        <ErrorBoundary>
          <View style={styles.container}>
            <NavigationContainer>
              <TabBar />
            </NavigationContainer>
          </View>
        </ErrorBoundary>
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
