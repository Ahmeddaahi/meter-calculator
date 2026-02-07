import AsyncStorage from '@react-native-async-storage/async-storage';
import { RideState, FareSettings } from '../types';

const ACTIVE_RIDE_KEY = '@taxi_meter_active_ride';
const SETTINGS_KEY = '@taxi_meter_settings';

export const saveActiveRideState = async (state: RideState) => {
    try {
        await AsyncStorage.setItem(ACTIVE_RIDE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error('Failed to save active ride state', e);
    }
};

export const getActiveRideState = async (): Promise<RideState | null> => {
    try {
        const jsonValue = await AsyncStorage.getItem(ACTIVE_RIDE_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        console.error('Failed to get active ride state', e);
        return null;
    }
};

export const clearActiveRideState = async () => {
    try {
        await AsyncStorage.removeItem(ACTIVE_RIDE_KEY);
    } catch (e) {
        console.error('Failed to clear active ride state', e);
    }
};

export const saveSettings = async (settings: FareSettings) => {
    try {
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
        console.error('Failed to save settings', e);
    }
};

export const getSettings = async (): Promise<FareSettings | null> => {
    try {
        const jsonValue = await AsyncStorage.getItem(SETTINGS_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        console.error('Failed to get settings', e);
        return null;
    }
};
