import { useState, useEffect, useRef } from 'react';

export interface FareSettings {
    baseFare: number;
    perKmRate: number;
    waitingRatePerMinute: number;
}

const DEFAULT_SETTINGS: FareSettings = {
    baseFare: 100,
    perKmRate: 50,
    waitingRatePerMinute: 2,
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
    const [waitingMinutes, setWaitingMinutes] = useState(0);
    const [fare, setFare] = useState(settings.baseFare);

    const lastPosRef = useRef<GeolocationCoordinates | null>(null);
    const watchIdRef = useRef<number | null>(null);
    const timerRef = useRef<number | null>(null);

    const startRide = () => {
        setIsActive(true);
        setDistance(0);
        setWaitingMinutes(0);
        setFare(settings.baseFare);
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
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
        }
    };

    useEffect(() => {
        if (isActive) {
            timerRef.current = window.setInterval(() => {
                // Increment waiting time if speed is very low (mocking logic)
                // In a real app we'd check position change vs time
            }, 60000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isActive]);

    useEffect(() => {
        const calculatedFare = settings.baseFare + (distance * settings.perKmRate) + (waitingMinutes * settings.waitingRatePerMinute);
        setFare(calculatedFare);
    }, [distance, waitingMinutes, settings]);

    return {
        isActive,
        distance,
        waitingMinutes,
        fare,
        startRide,
        stopRide
    };
}
