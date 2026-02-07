import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface RollingNumberProps {
    value: number;
    precision?: number;
    suffix?: string;
    style?: any;
}

const RollingNumber: React.FC<RollingNumberProps> = ({ value, precision = 2, suffix = '', style }) => {
    const displayValue = value.toFixed(precision);

    return (
        <View style={styles.container}>
            <Text style={[styles.text, style]}>
                {displayValue}
                <Text style={styles.suffix}>{suffix}</Text>
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    text: {
        fontSize: 48,
        fontWeight: '700',
        fontVariant: ['tabular-nums'],
        color: '#1f2937',
    },
    suffix: {
        fontSize: 24,
        fontWeight: '500',
        color: '#6b7280',
        marginLeft: 4,
    },
});

export default RollingNumber;
