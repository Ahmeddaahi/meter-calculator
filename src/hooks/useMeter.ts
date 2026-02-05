import { useState, useEffect, useRef } from 'react';

export interface FareSettings {
    perKmRate: number;
    waitingRatePerTenMinutes: number;
}

const DEFAULT_SETTINGS: FareSettings = {
    perKmRate: 50,
    waitingRatePerTenMinutes: 20,
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export function useMeter(settings: FareSettings = DEFAULT_SETTINGS) {
    const [isActive, setIsActive] = useState(false);
    const [distance, setDistance] = useState(0);
    const [waitingSeconds, setWaitingSeconds] = useState(0);
    const [isWaiting, setIsWaiting] = useState(false);
    const [fare, setFare] = useState(0);

    const lastPosRef = useRef<GeolocationCoordinates | null>(null);
    const watchIdRef = useRef<number | null>(null);
    const timerRef = useRef<number | null>(null);

    const startRide = () => {
        setIsActive(true);
        setDistance(0);
        setWaitingSeconds(0);
        setIsWaiting(false);
        setFare(0);
        lastPosRef.current = null;

        if ("geolocation" in navigator) {
            watchIdRef.current = navigator.geolocation.watchPosition(
                (position) => {
                    if (lastPosRef.current) {
                        const d = calculateDistance(
                            lastPosRef.current.latitude,
                            lastPosRef.current.longitude,
                            position.coords.latitude,
                            position.coords.longitude
                        );
                        // Ignore small jitter (< 10 meters)
                        if (d > 0.01) {
                            setDistance(prev => prev + d);
                        }
                    }
                    lastPosRef.current = position.coords;
                },
                (error) => console.error("GPS Error:", error),
                { enableHighAccuracy: true }
            );
        }
    };

    const stopRide = () => {
        setIsActive(false);
        setIsWaiting(false);
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
        }
    };

    const toggleWaiting = () => {
        if (isActive) {
            setIsWaiting(prev => !prev);
        }
    };

    useEffect(() => {
        if (isActive && isWaiting) {
            timerRef.current = window.setInterval(() => {
                setWaitingSeconds(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isActive, isWaiting]);

    useEffect(() => {
        const waitingTenMinUnits = waitingSeconds / 600;
        const calculatedFare = (distance * settings.perKmRate) + (waitingTenMinUnits * settings.waitingRatePerTenMinutes);
        setFare(calculatedFare);
    }, [distance, waitingSeconds, settings]);

    return {
        isActive,
        isWaiting,
        distance,
        waitingSeconds,
        fare,
        startRide,
        stopRide,
        toggleWaiting
    };
}
