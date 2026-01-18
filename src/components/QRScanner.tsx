import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Modal, Alert
} from 'react-native';
import { CameraView, Camera } from "expo-camera";

interface QRScannerProps {
    visible: boolean;
    onClose: () => void;
    onScan: (data: string) => void;
}

const QRScanner = ({ visible, onClose, onScan }: QRScannerProps) => {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        if (scanned) return;
        setScanned(true);
        onScan(data);
        // Reset nhanh hơn (0.8s) để quét liên tục mượt mà
        setTimeout(() => setScanned(false), 800);
    };

    if (hasPermission === null) {
        return <View />;
    }
    if (hasPermission === false) {
        return <Text style={{ color: '#fff' }}>Không có quyền truy cập Camera</Text>;
    }

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <View style={styles.container}>
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr", "ean13", "ean8", "code128", "code39", "upc_a", "upc_e", "itf14", "codabar"],
                    }}
                />

                {/* Overlay Design */}
                <View style={styles.overlay}>
                    <View style={styles.topOverlay}>
                        <Text style={styles.title}>QUÉT MÃ SẢN PHẨM</Text>
                        <Text style={styles.subtitle}>Di chuyển camera vào vùng mã vạch</Text>
                    </View>

                    <View style={styles.centerRow}>
                        <View style={styles.sideOverlay} />
                        <View style={styles.scanFrame} />
                        <View style={styles.sideOverlay} />
                    </View>

                    <View style={styles.bottomOverlay}>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Text style={styles.closeText}>ĐÓNG SCANNER</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    overlay: {
        flex: 1,
    },
    topOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        color: '#ccc',
        fontSize: 14,
    },
    centerRow: {
        flexDirection: 'row',
        height: 160,
    },
    sideOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    scanFrame: {
        width: '85%',
        borderColor: '#00FF00', // Green Laser
        borderWidth: 2,
        borderRadius: 12,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center'
    },
    // Laser line deleted
    bottomOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 50,
    },
    closeButton: {
        backgroundColor: '#FF3B30',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
    },
    closeText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default QRScanner;
