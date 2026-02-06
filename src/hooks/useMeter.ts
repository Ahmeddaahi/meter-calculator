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

const MAX_ACCURACY = 35; // meters - ignore points worse than this
const MAX_SPEED_KMH = 150; // km/h - ignore physically impossible jumps

export function useMeter(settings: FareSettings = DEFAULT_SETTINGS) {
    const [isActive, setIsActive] = useState(false);
    const [distance, setDistance] = useState(0);
    const [waitingSeconds, setWaitingSeconds] = useState(0);
    const [isWaiting, setIsWaiting] = useState(false);
    const [fare, setFare] = useState(0);
    const [gpsError, setGpsError] = useState<string | null>(null);
    const [isWaitingForLock, setIsWaitingForLock] = useState(false);

    const lastPosRef = useRef<GeolocationCoordinates | null>(null);
    const lastTimestampRef = useRef<number | null>(null);
    const watchIdRef = useRef<number | null>(null);
    const timerRef = useRef<number | null>(null);

    const startRide = () => {
        setIsActive(true);
        setDistance(0);
        setWaitingSeconds(0);
        setIsWaiting(false);
        setFare(0);
        setGpsError(null);
        setIsWaitingForLock(true);
        lastPosRef.current = null;
        lastTimestampRef.current = null;

        if ("geolocation" in navigator) {
            watchIdRef.current = navigator.geolocation.watchPosition(
                (position) => {
                    setIsWaitingForLock(false);
                    setGpsError(null);

                    // 1. Accuracy Filter: Ignore high error margins
                    if (position.coords.accuracy > MAX_ACCURACY) {
                        console.log(`Ignoring poor signal: accuracy ${position.coords.accuracy}m`);
                        return;
                    }

                    if (lastPosRef.current && lastTimestampRef.current) {
                        const d = calculateDistance(
                            lastPosRef.current.latitude,
                            lastPosRef.current.longitude,
                            position.coords.latitude,
                            position.coords.longitude
                        );

                        const timeDiffSeconds = (position.timestamp - lastTimestampRef.current) / 1000;
                        const speedKmh = d / (timeDiffSeconds / 3600);

                        // 2. Speed Check: Ignore jumps that are physically impossible
                        // 3. Distance Threshold: Minimum 5m to count as movement
                        if (speedKmh <= MAX_SPEED_KMH && d > 0.005) {
                            setDistance(prev => {
                                const newDist = prev + d;
                                return newDist;
                            });
                        } else if (speedKmh > MAX_SPEED_KMH) {
                            console.log(`Ignoring jump: speed ${speedKmh.toFixed(1)} km/h`);
                            return; // Don't update lastPos if it's a crazy jump
                        }
                    }

                    lastPosRef.current = position.coords;
                    lastTimestampRef.current = position.timestamp;
                },
                (error) => {
                    console.error("GPS Error:", error);
                    setIsWaitingForLock(false);
                    let msg = "Unknown GPS Error";
                    if (error.code === error.PERMISSION_DENIED) msg = "GPS Permission Denied. Please enable location.";
                    if (error.code === error.POSITION_UNAVAILABLE) msg = "GPS Signal Lost. Try moving to an open area.";
                    if (error.code === error.TIMEOUT) msg = "GPS Request Timed Out.";
                    setGpsError(msg);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        } else {
            setGpsError("Geolocation is not supported by this browser.");
        }
    };

    const stopRide = () => {
        setIsActive(false);
        setIsWaiting(false);
        setIsWaitingForLock(false);
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
        gpsError,
        isWaitingForLock,
        startRide,
        stopRide,
        toggleWaiting
    };
}
