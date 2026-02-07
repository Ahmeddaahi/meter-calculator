import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import ActionButton from '../components/ActionButton';
import { getActiveRideState } from '../services/ActiveRideStorage';
import { checkAppUpdate, downloadUpdate, UpdateInfo } from '../services/UpdateChecker';
import UpdateModal from '../components/UpdateModal';
import { Settings, History, PlayCircle } from 'lucide-react-native';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [hasActiveRide, setHasActiveRide] = useState(false);
    const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    useEffect(() => {
        const checkState = async () => {
            const state = await getActiveRideState();
            setHasActiveRide(!!(state && state.isActive));
        };

        const checkForUpdates = async () => {
            // Replace with actual version.json URL
            const info = await checkAppUpdate('https://mydomain.com/version.json');
            if (info) {
                setUpdateInfo(info);
                setShowUpdateModal(true);
            }
        };

        checkState();
        checkForUpdates();

        const unsubscribe = navigation.addListener('focus', checkState);
        return unsubscribe;
    }, [navigation]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Taxi Meter</Text>
                    <Text style={styles.subtitle}>Professional Fare Tracking</Text>
                </View>

                <View style={styles.mainActions}>
                    {hasActiveRide ? (
                        <ActionButton
                            title="Resume Active Ride"
                            variant="success"
                            onPress={() => navigation.navigate('ActiveRide', { resume: true })}
                            style={styles.startBtn}
                        />
                    ) : (
                        <ActionButton
                            title="Start New Ride"
                            variant="primary"
                            onPress={() => navigation.navigate('ActiveRide', { resume: false })}
                            style={styles.startBtn}
                        />
                    )}
                </View>

                <View style={styles.grid}>
                    <TouchableOpacity
                        style={styles.gridItem}
                        onPress={() => navigation.navigate('History')}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: '#eff6ff' }]}>
                            <History size={28} color="#3b82f6" />
                        </View>
                        <Text style={styles.gridLabel}>History</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.gridItem}
                        onPress={() => navigation.navigate('Settings')}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: '#fef2f2' }]}>
                            <Settings size={28} color="#ef4444" />
                        </View>
                        <Text style={styles.gridLabel}>Settings</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {updateInfo && (
                <UpdateModal
                    visible={showUpdateModal}
                    version={updateInfo.latestVersion}
                    onUpdate={() => downloadUpdate(updateInfo.apkUrl)}
                    onClose={() => setShowUpdateModal(false)}
                />
            )}
        </SafeAreaView>
    );
};

// Internal TouchableOpacity since I didn't make a generic GridItem
import { TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 24,
        flex: 1,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#111827',
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        marginTop: 8,
    },
    mainActions: {
        marginBottom: 48,
    },
    startBtn: {
        height: 64,
    },
    grid: {
        flexDirection: 'row',
        gap: 16,
    },
    gridItem: {
        flex: 1,
        backgroundColor: '#f9fafb',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        padding: 16,
        borderRadius: 16,
    },
    gridLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
});

export default HomeScreen;
