import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Stack } from './types';
import HomeScreen from '../screens/HomeScreen';
import ActiveRideScreen from '../screens/ActiveRideScreen';
import SummaryScreen from '../screens/SummaryScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                    headerShown: true,
                    headerStyle: { backgroundColor: '#fff' },
                    headerShadowVisible: false,
                    headerTitleStyle: { fontWeight: '700' },
                }}
            >
                <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Meter App' }} />
                <Stack.Screen name="ActiveRide" component={ActiveRideScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Summary" component={SummaryScreen} options={{ title: 'Ride Summary' }} />
                <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Ride History' }} />
                <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Fare Settings' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
