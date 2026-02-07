import * as SQLite from 'expo-sqlite';
import { Ride } from '../types';

const dbPromise = SQLite.openDatabaseAsync('rides.db');

export const initDatabase = async () => {
    const db = await dbPromise;
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS ride_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      startTime INTEGER NOT NULL,
      endTime INTEGER,
      distance REAL NOT NULL,
      duration INTEGER NOT NULL,
      waitingTime INTEGER NOT NULL,
      fare REAL NOT NULL,
      startLat REAL,
      startLng REAL,
      endLat REAL,
      endLng REAL
    );
  `);
};

export const saveRide = async (ride: Ride) => {
    const db = await dbPromise;
    const result = await db.runAsync(
        `INSERT INTO ride_history (startTime, endTime, distance, duration, waitingTime, fare, startLat, startLng, endLat, endLng) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            ride.startTime,
            ride.endTime || Date.now(),
            ride.distance,
            ride.duration,
            ride.waitingTime,
            ride.fare,
            ride.startLocation?.latitude || null,
            ride.startLocation?.longitude || null,
            ride.endLocation?.latitude || null,
            ride.endLocation?.longitude || null,
        ]
    );
    return result.lastInsertRowId;
};

export const getRideHistory = async (): Promise<Ride[]> => {
    const db = await dbPromise;
    const rows = await db.getAllAsync<any>('SELECT * FROM ride_history ORDER BY startTime DESC');
    return rows.map(row => ({
        id: row.id,
        startTime: row.startTime,
        endTime: row.endTime,
        distance: row.distance,
        duration: row.duration,
        waitingTime: row.waitingTime,
        fare: row.fare,
        startLocation: row.startLat ? { latitude: row.startLat, longitude: row.startLng, timestamp: row.startTime } : undefined,
        endLocation: row.endLat ? { latitude: row.endLat, longitude: row.endLng, timestamp: row.endTime } : undefined,
    }));
};

export const deleteRide = async (id: number) => {
    const db = await dbPromise;
    await db.runAsync('DELETE FROM ride_history WHERE id = ?', [id]);
};
