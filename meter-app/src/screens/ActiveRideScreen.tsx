import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useMeter } from '../hooks/useMeter';
import RollingNumber from '../components/RollingNumber';
import ActionButton from '../components/ActionButton';
import { Clock, Navigation, Pause, Play, StopCircle, Hourglass } from 'lucide-react-native';

const ActiveRideScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { state, startRide, stopRide, pauseRide, toggleWaitingMode } = useMeter();

    useEffect(() => {
        if (route.params?.resume) {
            // Logic handled in useMeter useEffect already
        } else {
            startRide();
        }
    }, []);

    const handleStop = async () => {
        const finalState = { ...state };
        await stopRide();
        navigation.replace('Summary', { ride: finalState });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>ACTIVE RIDE</Text>
                <View style={[styles.badge, state.isPaused && styles.pausedBadge]}>
                    <Text style={styles.badgeText}>{state.isPaused ? 'PAUSED' : 'TRACKING'}</Text>
                </View>
            </View>

            <View style={styles.meterContainer}>
                <View style={styles.fareRow}>
                    <Text style={styles.currency}>ETB</Text>
                    <RollingNumber value={state.currentFare} precision={0} style={styles.fareText} />
                </View>

                <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                        <Navigation size={20} color="#6b7280" />
                        <Text style={styles.statLabel}>DISTANCE</Text>
                        <Text style={styles.statValue}>{state.distance.toFixed(2)} km</Text>
                    </View>

                    <View style={styles.statItem}>
                        <Clock size={20} color="#6b7280" />
                        <Text style={styles.statLabel}>DURATION</Text>
                        <Text style={styles.statValue}>{formatTime(state.duration)}</Text>
                    </View>
                </View>

                {state.isWaitingMode && (
                    <View style={styles.waitingIndicator}>
                        <Hourglass size={16} color="#fbbf24" />
                        <Text style={styles.waitingText}>Waiting Mode Active ({formatTime(state.waitingTime)})</Text>
                    </View>
                )}
            </View>

            <View style={styles.controls}>
                <View style={styles.topControls}>
                    <TouchableOpacity
                        style={[styles.waitToggle, state.isWaitingMode && styles.waitToggleActive]}
                        onPress={toggleWaitingMode}
                    >
                        <Hourglass size={24} color={state.isWaitingMode ? '#fff' : '#4b5563'} />
                        <Text style={[styles.waitToggleText, state.isWaitingMode && styles.waitToggleTextActive]}>
                            Wait Mode
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.pauseBtn}
                        onPress={pauseRide}
                    >
                        {state.isPaused ? (
                            <Play size={28} color="#3b82f6" />
                        ) : (
                            <Pause size={28} color="#6b7280" />
                        )}
                        <Text style={styles.pauseText}>{state.isPaused ? 'Resume' : 'Pause'}</Text>
                    </TouchableOpacity>
                </View>

                <ActionButton
                    title="STOP RIDE"
                    variant="danger"
                    onPress={handleStop}
                    style={styles.stopBtn}
                    textStyle={styles.stopBtnText}
                />
            </View>
        </SafeAreaView>
    );
};

const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827',
    },
    header: {
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#9ca3af',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 2,
    },
    badge: {
        backgroundColor: '#059669',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 100,
    },
    pausedBadge: {
        backgroundColor: '#dc2626',
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '800',
    },
    meterContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    fareRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 48,
    },
    currency: {
        color: '#9ca3af',
        fontSize: 24,
        fontWeight: '600',
        marginRight: 8,
    },
    fareText: {
        color: '#fff',
        fontSize: 84,
        fontWeight: '800',
    },
    statsGrid: {
        flexDirection: 'row',
        width: '100%',
        backgroundColor: '#1f2937',
        borderRadius: 24,
        padding: 24,
        gap: 24,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        gap: 8,
    },
    statLabel: {
        color: '#9ca3af',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
    },
    statValue: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
    },
    waitingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 24,
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 100,
    },
    waitingText: {
        color: '#fbbf24',
        fontSize: 14,
        fontWeight: '600',
    },
    controls: {
        padding: 24,
        backgroundColor: '#1f2937',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
    },
    topControls: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    waitToggle: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#374151',
        borderRadius: 16,
        padding: 16,
        gap: 12,
    },
    waitToggleActive: {
        backgroundColor: '#fbbf24',
    },
    waitToggleText: {
        color: '#9ca3af',
        fontSize: 16,
        fontWeight: '700',
    },
    waitToggleTextActive: {
        color: '#fff',
    },
    pauseBtn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#374151',
        borderRadius: 16,
        padding: 16,
        gap: 4,
    },
    pauseText: {
        color: '#9ca3af',
        fontSize: 12,
        fontWeight: '700',
    },
    stopBtn: {
        height: 64,
    },
    stopBtnText: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: 1,
    },
});

export default ActiveRideScreen;
