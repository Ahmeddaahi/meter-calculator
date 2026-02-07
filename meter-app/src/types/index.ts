export interface Ride {
    id?: number;
    startTime: number;
    endTime?: number;
    distance: number; // in km
    duration: number; // in seconds
    waitingTime: number; // in seconds
    fare: number;
    startLocation?: LocationPoint;
    endLocation?: LocationPoint;
}

export interface LocationPoint {
    latitude: number;
    longitude: number;
    timestamp: number;
}

export interface FareSettings {
    baseFare: number;
    pricePerKm: number;
    pricePerMinuteWaiting: number;
    minimumFare: number;
    nightMultiplier: number;
}

export interface RideState {
    isActive: boolean;
    isPaused: boolean;
    isWaitingMode: boolean;
    startTime: number;
    distance: number;
    duration: number;
    waitingTime: number;
    currentFare: number;
    lastLocation?: LocationPoint;
    path: LocationPoint[];
}
