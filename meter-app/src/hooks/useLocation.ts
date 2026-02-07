import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { useState, useEffect, useRef } from 'react';
import { LocationPoint, RideState } from '../types';
import { calculateDistance } from '../services/FareCalculation';
import { saveActiveRideState } from '../services/ActiveRideStorage';

export const LOCATION_TASK_NAME = 'background-location-task';

// Store reference to update callback for background tasks
let backgroundUpdateCallback: ((location: LocationPoint) => void) | null = null;

export const setBackgroundUpdateCallback = (callback: (location: LocationPoint) => void) => {
    backgroundUpdateCallback = callback;
};

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
    if (error) {
        console.error('Background location task error:', error);
        return;
    }
    if (data) {
        const { locations } = data as any;
        const location = locations[0];
        if (location && backgroundUpdateCallback) {
            backgroundUpdateCallback({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                timestamp: location.timestamp,
            });
        }
    }
});

export const useLocation = () => {
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [currentLocation, setCurrentLocation] = useState<LocationPoint | null>(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            await Location.requestBackgroundPermissionsAsync();

            const loc = await Location.getCurrentPositionAsync({});
            setCurrentLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                timestamp: loc.timestamp,
            });
        })();
    }, []);

    const startBackgroundUpdate = async () => {
        const { status } = await Location.requestBackgroundPermissionsAsync();
        if (status !== 'granted') {
            setErrorMsg('Background location permission denied');
            return;
        }

        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 2000,
            distanceInterval: 1,
            foregroundService: {
                notificationTitle: 'Taxi Meter Active',
                notificationBody: 'Tracking ride distance...',
                notificationColor: '#facc15',
            },
        });
    };

    const stopBackgroundUpdate = async () => {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
        if (isRegistered) {
            await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        }
    };

    return { currentLocation, errorMsg, startBackgroundUpdate, stopBackgroundUpdate };
};
