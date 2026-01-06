import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';


// react navigation
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Icons
import Ionicons from '@expo/vector-icons/Ionicons';
import { Icon } from 'react-native-screens';


// Screens
import HomeScreen from './screens/HomeScreen'
import AddScreen from './screens/AddScreen';

const ModalStack = createStackNavigator();
const RootStack = createStackNavigator();
const Tab = createBottomTabNavigator();


type IconName = keyof typeof Ionicons.glyphMap;
function TabBar() {
  function renderIcon({ focused, color, size }: { focused: boolean; color: string; size: number }) {

    let iconName: IconName = 'home';
    return <Ionicons name={iconName} size={size} color={color} />;
  }

  return (

    <Tab.Navigator screenOptions={{
      headerShown: false,
      tabBarIcon: renderIcon,
      tabBarStyle: { alignContent: 'center', paddingTop: '2%', height: '9%' }
    }}>
      <Tab.Screen name="Home" options={{


      }} component={HomeStack} />
      {/* <Tab.Screen name="Profile" component={ProfileScreen} /> */}
    </Tab.Navigator>
  );
}
function HomeStack() {
  return (
    <ModalStack.Navigator screenOptions={{ headerShown: false }}>
      <ModalStack.Screen name="HomeMain" component={HomeScreen} />
    </ModalStack.Navigator>
  )
}




export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="auto" />
        <NavigationContainer>

          <RootStack.Navigator screenOptions={{ headerShown: false, presentation: 'modal' }}>
            <RootStack.Screen name="Main" component={TabBar} />
            <RootStack.Screen
              options={{ headerShown: true }}
              name="AddModal"
              component={AddScreen} />
          </RootStack.Navigator>
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});
