import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import ActionButton from '../components/ActionButton';
import { getSettings, saveSettings } from '../services/ActiveRideStorage';
import { DEFAULT_FARE_SETTINGS } from '../services/FareCalculation';
import { FareSettings } from '../types';

const SettingsScreen = () => {
    const navigation = useNavigation();
    const [settings, setSettings] = useState<FareSettings>(DEFAULT_FARE_SETTINGS);

    useEffect(() => {
        (async () => {
            const saved = await getSettings();
            if (saved) setSettings(saved);
        })();
    }, []);

    const handleSave = async () => {
        await saveSettings(settings);
        navigation.goBack();
    };

    const updateField = (field: keyof FareSettings, value: string) => {
        const numValue = parseFloat(value) || 0;
        setSettings(prev => ({ ...prev, [field]: numValue }));
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scroll}>
                    <Text style={styles.sectionTitle}>Fare Configuration</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Base Fare (ETB)</Text>
                        <TextInput
                            style={styles.input}
                            value={settings.baseFare.toString()}
                            onChangeText={(v) => updateField('baseFare', v)}
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Price per KM (ETB)</Text>
                        <TextInput
                            style={styles.input}
                            value={settings.pricePerKm.toString()}
                            onChangeText={(v) => updateField('pricePerKm', v)}
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Price per Minute Waiting (ETB)</Text>
                        <TextInput
                            style={styles.input}
                            value={settings.pricePerMinuteWaiting.toString()}
                            onChangeText={(v) => updateField('pricePerMinuteWaiting', v)}
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Minimum Fare (ETB)</Text>
                        <TextInput
                            style={styles.input}
                            value={settings.minimumFare.toString()}
                            onChangeText={(v) => updateField('minimumFare', v)}
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Night Multiplier (1.0 = None)</Text>
                        <TextInput
                            style={styles.input}
                            value={settings.nightMultiplier.toString()}
                            onChangeText={(v) => updateField('nightMultiplier', v)}
                            keyboardType="numeric"
                        />
                    </View>

                    <ActionButton
                        title="Save Settings"
                        onPress={handleSave}
                        style={styles.saveBtn}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scroll: {
        padding: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4b5563',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#111827',
    },
    saveBtn: {
        marginTop: 12,
    },
});

export default SettingsScreen;
