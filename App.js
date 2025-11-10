/**
 * App root – sets up NavigationContainer with bottom tab navigator.
 *
 * Structure:
 *  - Tabs: Dashboard (stack), Inventory (stack), AI Chat (stack).
 *  - Each tab hides header for immersive layouts; custom tab bar styling for elevated floating effect.
 *
 * Notes:
 *  - DashboardStack includes routes for expiring/expired items & suggestions.
 *  - Consider lazy loading stacks if startup performance needs optimization.
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from './src/screens/DashboardScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import AIChatScreen from './src/screens/AIChatScreen';
import ExpiringItemsScreen from './src/screens/ExpiringItemsScreen';
import ExpiredItemsScreen from './src/screens/ExpiredItemsScreen';
import SuggestionsScreen from './src/screens/SuggestionsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardMain" component={DashboardScreen} />
      <Stack.Screen name="ExpiringItems" component={ExpiringItemsScreen} />
      <Stack.Screen name="ExpiredItems" component={ExpiredItemsScreen} />
      <Stack.Screen name="Suggestions" component={SuggestionsScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Dashboard') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Inventory') {
              iconName = focused ? 'list' : 'list-outline';
            } else if (route.name === 'AI Chat') {
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          
          tabBarActiveTintColor: '#6366F1',
          tabBarInactiveTintColor: '#9CA3AF',
          headerShown: false,
          
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 0,
            paddingBottom: 20,
            paddingTop: 12,
            height: 90,
            position: 'absolute',
            left: 20,
            right: 20,
            bottom: 20,
            borderRadius: 28,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 12,
            borderWidth: 1,
            borderColor: '#F3F4F6',
          },
          
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 4,
          },
          
          tabBarItemStyle: {
            paddingVertical: 4,
          },
        })}
      >
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardStack}
          options={{
            tabBarLabel: 'Dashboard',
          }}
        />
        <Tab.Screen 
          name="Inventory" 
          component={InventoryScreen}
          options={{
            tabBarLabel: 'Inventory',
          }}
        />
        <Tab.Screen 
          name="AI Chat" 
          component={AIChatScreen}
          options={{
            tabBarLabel: 'AI Chat',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
