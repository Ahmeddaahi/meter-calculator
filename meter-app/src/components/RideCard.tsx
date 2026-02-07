import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ride } from '../types';
import { Calendar, Navigation, Clock, CreditCard, Trash2 } from 'lucide-react-native';

interface RideCardProps {
    ride: Ride;
    onPress: () => void;
    onDelete?: () => void;
}

const RideCard: React.FC<RideCardProps> = ({ ride, onPress, onDelete }) => {
    const dateStr = new Date(ride.startTime).toLocaleDateString();
    const timeStr = new Date(ride.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.header}>
                <View style={styles.iconText}>
                    <Calendar size={16} color="#6b7280" />
                    <Text style={styles.dateText}>{dateStr} at {timeStr}</Text>
                </View>
                {onDelete && (
                    <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
                        <Trash2 size={18} color="#ef4444" />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.statsRow}>
                <View style={styles.stat}>
                    <Navigation size={16} color="#3b82f6" />
                    <Text style={styles.statValue}>{ride.distance.toFixed(1)} km</Text>
                </View>
                <View style={styles.stat}>
                    <Clock size={16} color="#3b82f6" />
                    <Text style={styles.statValue}>{Math.floor(ride.duration / 60)} min</Text>
                </View>
                <View style={styles.stat}>
                    <CreditCard size={16} color="#10b981" />
                    <Text style={styles.fareValue}>{ride.fare.toFixed(0)} ETB</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconText: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dateText: {
        color: '#6b7280',
        fontSize: 14,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    fareValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#10b981',
    },
    deleteButton: {
        padding: 4,
    },
});

export default RideCard;
