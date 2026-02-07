import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import ActionButton from '../components/ActionButton';
import { saveRide } from '../services/Database';
import { Navigation, Clock, Hourglass, CreditCard, ChevronRight } from 'lucide-react-native';

const SummaryScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { ride } = route.params;

    const handleSave = async () => {
        await saveRide(ride);
        navigation.navigate('Home');
    };

    const stats = [
        { label: 'Total Distance', value: `${ride.distance.toFixed(2)} km`, icon: Navigation, color: '#3b82f6' },
        { label: 'Total Duration', value: formatTime(ride.duration), icon: Clock, color: '#6b7280' },
        { label: 'Total Waiting', value: formatTime(ride.waitingTime), icon: Hourglass, color: '#fbbf24' },
        { label: 'Base Fare', value: '50 ETB', icon: ChevronRight, color: '#9ca3af' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.fareCard}>
                    <Text style={styles.fareLabel}>TOTAL FARE</Text>
                    <Text style={styles.fareAmount}>{ride.currentFare.toFixed(0)} <Text style={styles.currency}>ETB</Text></Text>
                </View>

                <View style={styles.statsContainer}>
                    {stats.map((stat, i) => (
                        <View key={i} style={styles.statRow}>
                            <View style={styles.statInfo}>
                                <View style={[styles.iconBox, { backgroundColor: stat.color + '10' }]}>
                                    <stat.icon size={20} color={stat.color} />
                                </View>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </View>
                            <Text style={styles.statValue}>{stat.value}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.actions}>
                    <ActionButton
                        title="SAVE TO HISTORY"
                        variant="primary"
                        onPress={handleSave}
                        style={styles.btn}
                    />
                    <ActionButton
                        title="DISCARD RIDE"
                        variant="secondary"
                        onPress={() => navigation.navigate('Home')}
                        style={styles.btn}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    scroll: {
        padding: 24,
    },
    fareCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        marginBottom: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    fareLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#6b7280',
        letterSpacing: 2,
        marginBottom: 8,
    },
    fareAmount: {
        fontSize: 56,
        fontWeight: '800',
        color: '#111827',
    },
    currency: {
        fontSize: 24,
        color: '#9ca3af',
    },
    statsContainer: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 8,
        marginBottom: 32,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    statInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBox: {
        padding: 8,
        borderRadius: 10,
    },
    statLabel: {
        fontSize: 16,
        color: '#4b5563',
        fontWeight: '500',
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    actions: {
        gap: 12,
    },
    btn: {
        height: 56,
    },
});

export default SummaryScreen;
