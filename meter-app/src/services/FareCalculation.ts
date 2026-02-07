import { FareSettings, LocationPoint } from '../types';

export const calculateDistance = (pos1: LocationPoint, pos2: LocationPoint): number => {
    const R = 6371; // Earth radius in km
    const dLat = (pos2.latitude - pos1.latitude) * (Math.PI / 180);
    const dLon = (pos2.longitude - pos1.longitude) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(pos1.latitude * (Math.PI / 180)) *
        Math.cos(pos2.latitude * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const calculateFare = (
    distanceKm: number,
    waitingTimeSeconds: number,
    settings: FareSettings
): number => {
    const distanceFare = distanceKm * settings.pricePerKm;
    const waitingFare = (waitingTimeSeconds / 60) * settings.pricePerMinuteWaiting;
    const total = settings.baseFare + distanceFare + waitingFare;

    const finalFare = Math.max(total, settings.minimumFare);
    return finalFare * settings.nightMultiplier;
};

export const DEFAULT_FARE_SETTINGS: FareSettings = {
    baseFare: 50,
    pricePerKm: 20,
    pricePerMinuteWaiting: 5,
    minimumFare: 100,
    nightMultiplier: 1.0,
};
