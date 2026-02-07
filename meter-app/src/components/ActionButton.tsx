import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ActionButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    style?: ViewStyle;
    textStyle?: TextStyle;
    disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    style,
    textStyle,
    disabled
}) => {
    const getVariantStyle = () => {
        switch (variant) {
            case 'danger': return styles.danger;
            case 'success': return styles.success;
            case 'secondary': return styles.secondary;
            default: return styles.primary;
        }
    };

    return (
        <TouchableOpacity
            style={[styles.button, getVariantStyle(), style, disabled && styles.disabled]}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={disabled}
        >
            <Text style={[styles.text, textStyle]}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    primary: { backgroundColor: '#3b82f6' },
    secondary: { backgroundColor: '#6b7280' },
    danger: { backgroundColor: '#ef4444' },
    success: { backgroundColor: '#10b981' },
    disabled: { opacity: 0.5 },
    text: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default ActionButton;
