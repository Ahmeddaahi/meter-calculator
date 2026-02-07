import { createStackNavigator } from '@react-navigation/stack';
import { Ride } from '../types';

export type RootStackParamList = {
    Home: undefined;
    ActiveRide: { resume?: boolean };
    Summary: { ride: Ride };
    History: undefined;
    Settings: undefined;
};

export const Stack = createStackNavigator<RootStackParamList>();
