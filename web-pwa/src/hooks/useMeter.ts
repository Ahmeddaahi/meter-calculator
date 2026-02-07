import { useState, useEffect, useRef } from 'react';

import { OFFICIAL_FARE_SETTINGS } from '../config/fareConfig';

export interface FareSettings {
    perKmRate: number;
    waitingRatePerTenMinutes: number;
}

const DEFAULT_SETTINGS: FareSettings = OFFICIAL_FARE_SETTINGS;

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

const MAX_ACCURACY = 100; // meters - ignore points worse than this
const MAX_SPEED_KMH = 150; // km/h - ignore physically impossible jumps

export function useMeter(settings: FareSettings = DEFAULT_SETTINGS) {
    const [isActive, setIsActive] = useState(false);
    const [distance, setDistance] = useState(0);
    const [waitingSeconds, setWaitingSeconds] = useState(0);
    const [isWaiting, setIsWaiting] = useState(false);
    const [fare, setFare] = useState(0);
    const [gpsError, setGpsError] = useState<string | null>(null);
    const [isWaitingForLock, setIsWaitingForLock] = useState(false);
    const [accuracy, setAccuracy] = useState<number | null>(null);

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
        setAccuracy(null);
        lastPosRef.current = null;
        lastTimestampRef.current = null;

        if ("geolocation" in navigator) {
            watchIdRef.current = navigator.geolocation.watchPosition(
                (position) => {
                    setIsWaitingForLock(false);
                    setGpsError(null);
                    setAccuracy(position.coords.accuracy);

                    // 1. Accuracy Filter: Loosened to 100m to allow tracking in weak signal
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
                        // 3. Distance Threshold: Lowered to 0.5 meters for high-responsive "real time" feel
                        if (speedKmh <= MAX_SPEED_KMH && d > 0.0005) {
                            setDistance(prev => prev + d);
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
                    let msg = "Cillad GPS aan la aqoon";
                    if (error.code === error.PERMISSION_DENIED) msg = "Oggolaanshaha GPS waa loo diiday. Fadlan fura goobta (location).";
                    if (error.code === error.POSITION_UNAVAILABLE) msg = "Signal-ka GPS waa lumay. Isku day inaad u guurto meel bannaan.";
                    if (error.code === error.TIMEOUT) msg = "Codsiga GPS wuu dhacay xilligii loogu tala galay.";
                    setGpsError(msg);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        } else {
            setGpsError("Goobta (Geolocation) lagama taageero browser-kan.");
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
        accuracy,
        startRide,
        stopRide,
        toggleWaiting
    };
}
