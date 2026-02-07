import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Download, X } from 'lucide-react-native';

interface UpdateModalProps {
    visible: boolean;
    version: string;
    onUpdate: () => void;
    onClose: () => void;
}

const UpdateModal: React.FC<UpdateModalProps> = ({ visible, version, onUpdate, onClose }) => {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
                        <X size={24} color="#6b7280" />
                    </TouchableOpacity>

                    <View style={styles.iconContainer}>
                        <Download size={48} color="#3b82f6" />
                    </View>

                    <Text style={styles.title}>New Version Available</Text>
                    <Text style={styles.versionText}>Version {version} is ready for download.</Text>

                    <TouchableOpacity style={styles.updateButton} onPress={onUpdate}>
                        <Text style={styles.updateButtonText}>Download Update</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    content: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        width: '100%',
        position: 'relative',
    },
    closeIcon: {
        position: 'absolute',
        top: 16,
        right: 16,
    },
    iconContainer: {
        backgroundColor: '#eff6ff',
        padding: 20,
        borderRadius: 100,
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 8,
    },
    versionText: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    updateButton: {
        backgroundColor: '#3b82f6',
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    updateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default UpdateModal;
