import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { getRideHistory, deleteRide } from '../services/Database';
import RideCard from '../components/RideCard';
import { Ride } from '../types';
import { FileSearch } from 'lucide-react-native';

const HistoryScreen = () => {
    const [rides, setRides] = useState<Ride[]>([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<any>();

    const loadHistory = async () => {
        setLoading(true);
        const history = await getRideHistory();
        setRides(history);
        setLoading(false);
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const handleDelete = async (id: number) => {
        await deleteRide(id);
        loadHistory();
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={rides}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                renderItem={({ item }) => (
                    <RideCard
                        ride={item}
                        onPress={() => navigation.navigate('Summary', { ride: item })}
                        onDelete={() => item.id && handleDelete(item.id)}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <FileSearch size={64} color="#d1d5db" />
                        <Text style={styles.emptyText}>No rides found in history.</Text>
                    </View>
                }
                contentContainerStyle={styles.list}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    list: {
        padding: 16,
        flexGrow: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
        gap: 16,
    },
    emptyText: {
        color: '#9ca3af',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default HistoryScreen;
