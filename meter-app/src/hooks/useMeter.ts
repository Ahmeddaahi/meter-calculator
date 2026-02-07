import { useState, useEffect, useRef } from 'react';
import { useLocation, setBackgroundUpdateCallback } from './useLocation';
import { RideState, LocationPoint, FareSettings } from '../types';
import { calculateDistance, calculateFare, DEFAULT_FARE_SETTINGS } from '../services/FareCalculation';
import { saveActiveRideState, getActiveRideState, clearActiveRideState, getSettings } from '../services/ActiveRideStorage';

export const useMeter = () => {
    const { startBackgroundUpdate, stopBackgroundUpdate } = useLocation();
    const [state, setState] = useState<RideState>({
        isActive: false,
        isPaused: false,
        isWaitingMode: false,
        startTime: Date.now(),
        distance: 0,
        duration: 0,
        waitingTime: 0,
        currentFare: 0,
        path: [],
    });

    const [settings, setSettings] = useState<FareSettings>(DEFAULT_FARE_SETTINGS);
    const stateRef = useRef(state);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Keep ref up to date for background callback
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    // Load state and settings on mount
    useEffect(() => {
        (async () => {
            const savedSettings = await getSettings();
            if (savedSettings) setSettings(savedSettings);

            const savedState = await getActiveRideState();
            if (savedState && savedState.isActive) {
                setState(savedState);
                resumeRide();
            }
        })();
    }, []);

    // Persistence effect: save state every 2 seconds if active
    useEffect(() => {
        if (state.isActive) {
            const pInterval = setInterval(() => {
                saveActiveRideState(stateRef.current);
            }, 2000);
            return () => clearInterval(pInterval);
        }
    }, [state.isActive]);

    const handleLocationUpdate = (newLoc: LocationPoint) => {
        const currentState = stateRef.current;
        if (!currentState.isActive || currentState.isPaused) return;

        const lastLoc = currentState.lastLocation;
        if (!lastLoc) {
            setState(s => ({ ...s, lastLocation: newLoc, path: [newLoc] }));
            return;
        }

        const dist = calculateDistance(lastLoc, newLoc); // in km
        const distMeters = dist * 1000;

        // GPS JUMP FILTER: ignore if jump > 50 meters in 2 seconds
        if (distMeters > 50) return;

        // NOISE FILTER: if distance < 1 meter, ignore
        if (distMeters < 0.001) return;

        // SPEED FILTER: if speed < 5 km/h, don't add distance (noise protection)
        // speed = km / h
        const timeDiffHours = (newLoc.timestamp - lastLoc.timestamp) / 3600000;
        const speed = dist / timeDiffHours;

        let addedDistance = 0;
        if (speed >= 5 || currentState.isWaitingMode) {
            addedDistance = dist;
        }

        setState(s => {
            const newDistance = s.distance + addedDistance;
            const newFare = calculateFare(newDistance, s.waitingTime, settings);
            return {
                ...s,
                distance: newDistance,
                lastLocation: newLoc,
                currentFare: newFare,
                path: [...s.path, newLoc],
            };
        });
    };

    useEffect(() => {
        setBackgroundUpdateCallback(handleLocationUpdate);
    }, [settings]);

    const startRide = async () => {
        const newState = {
            isActive: true,
            isPaused: false,
            isWaitingMode: false,
            startTime: Date.now(),
            distance: 0,
            duration: 0,
            waitingTime: 0,
            currentFare: settings.baseFare,
            path: [],
        };
        setState(newState);
        await startBackgroundUpdate();
        startTimers();
    };

    const resumeRide = async () => {
        await startBackgroundUpdate();
        startTimers();
    };

    const pauseRide = () => {
        setState(s => ({ ...s, isPaused: !s.isPaused }));
    };

    const stopRide = async () => {
        stopTimers();
        await stopBackgroundUpdate();
        setState(s => ({ ...s, isActive: false }));
        await clearActiveRideState();
    };

    const toggleWaitingMode = () => {
        setState(s => ({ ...s, isWaitingMode: !s.isWaitingMode }));
    };

    const startTimers = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setState(s => {
                if (!s.isActive || s.isPaused) return s;
                const addedWaiting = s.isWaitingMode ? 1 : 0;
                const newWaitingTime = s.waitingTime + addedWaiting;
                const newFare = calculateFare(s.distance, newWaitingTime, settings);
                return {
                    ...s,
                    duration: s.duration + 1,
                    waitingTime: newWaitingTime,
                    currentFare: newFare,
                };
            });
        }, 1000);
    };

    const stopTimers = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    return { state, settings, startRide, stopRide, pauseRide, toggleWaitingMode };
};
