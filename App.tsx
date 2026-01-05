import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './screens/HomeScreen'
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Icon } from 'react-native-screens';

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


      }} component={HomeScreen} />
      {/* <Tab.Screen name="Profile" component={ProfileScreen} /> */}
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="auto" />
        <NavigationContainer>
          <TabBar />
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
