import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    ScrollView, Image, StatusBar, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { PRODUCTS } from '../data/mockData';
import QRScanner from '../components/QRScanner';

const WAREHOUSES = [
    { id: 'retail', name: 'Kho Bán Lẻ', color: '#4CAF50' },
    { id: 'dose', name: 'Kho Cắt Liều', color: '#FF9800' },
    { id: 'dam', name: 'Kho Hàng Hỏng', color: '#F44336' },
];

const TransferScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    // STATE
    const [sourceWh, setSourceWh] = useState('retail');
    const [destWh, setDestWh] = useState('dose');

    const [scannedCode, setScannedCode] = useState('');
    const [showScanner, setShowScanner] = useState(false);

    // Selected Product
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [transferQty, setTransferQty] = useState('');
    const [note, setNote] = useState('');

    // History Mock
    const [history, setHistory] = useState<any[]>([]);

    const handleSwapWh = () => {
        const temp = sourceWh;
        setSourceWh(destWh);
        setDestWh(temp);
    };

    const handleScan = (code: string) => {
        setScannedCode(code);
        setShowScanner(false);
        findProduct(code);
    };

    const findProduct = (code: string) => {
        // Mock finding logic
        const found = PRODUCTS.find(p => p.barcode === code || p.id === code);
        if (found) {
            setSelectedProduct(found);
            // Alert.alert('Đã chọn', found.name);
        } else {
            Alert.alert('Lỗi', 'Không tìm thấy sản phẩm trong kho nguồn.');
            setSelectedProduct(null);
        }
    };

    const handleTransfer = () => {
        if (!selectedProduct) {
            Alert.alert('Chưa chọn thuốc', 'Vui lòng quét mã hoặc nhập tên thuốc.');
            return;
        }
        if (!transferQty || parseInt(transferQty) <= 0) {
            Alert.alert('Số lượng sai', 'Vui lòng nhập số lượng hợp lệ.');
            return;
        }
        if (parseInt(transferQty) > selectedProduct.stock) {
            Alert.alert('Cảnh báo', `Tồn kho nguồn chỉ còn ${selectedProduct.stock}. Không đủ để chuyển.`);
            return;
        }

        // Execute Transfer
        const newItem = {
            id: Date.now(),
            name: selectedProduct.name,
            qty: parseInt(transferQty),
            from: WAREHOUSES.find(w => w.id === sourceWh)?.name,
            to: WAREHOUSES.find(w => w.id === destWh)?.name,
            time: new Date().toLocaleTimeString()
        };

        setHistory([newItem, ...history]);

        // Reset
        Alert.alert('Thành công', `Đã chuyển ${transferQty} ${selectedProduct.units?.[0]?.name || 'ĐV'} ${selectedProduct.name} sang ${newItem.to}`);
        setTransferQty('');
        setNote('');
        setScannedCode('');
        setSelectedProduct(null);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="light-content" backgroundColor="#0288D1" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>CHUYỂN KHO NỘI BỘ</Text>
                <View style={{ width: 30 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ padding: 15 }} style={{ flex: 1 }}>

                    {/* 1. WH SELECTION */}
                    <View style={styles.whCard}>
                        <View style={styles.whRow}>
                            <View style={{ flex: 1, alignItems: 'center' }}>
                                <Text style={styles.whLabel}>TỪ KHO (NGUỒN)</Text>
                                <View style={[styles.whBadge, { backgroundColor: WAREHOUSES.find(w => w.id === sourceWh)?.color }]}>
                                    <Text style={styles.whName}>{WAREHOUSES.find(w => w.id === sourceWh)?.name}</Text>
                                </View>
                            </View>

                            <TouchableOpacity onPress={handleSwapWh} style={{ padding: 10 }}>
                                <MaterialCommunityIcons name="swap-horizontal" size={32} color="#0288D1" />
                            </TouchableOpacity>

                            <View style={{ flex: 1, alignItems: 'center' }}>
                                <Text style={styles.whLabel}>ĐẾN KHO (ĐÍCH)</Text>
                                <View style={[styles.whBadge, { backgroundColor: WAREHOUSES.find(w => w.id === destWh)?.color }]}>
                                    <Text style={styles.whName}>{WAREHOUSES.find(w => w.id === destWh)?.name}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* 2. PRODUCT SELECTION */}
                    <Text style={styles.sectionTitle}>CHỌN SẢN PHẨM</Text>
                    <View style={styles.card}>
                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Quét mã hoặc nhập tên..."
                                value={scannedCode}
                                onChangeText={setScannedCode}
                                onEndEditing={() => findProduct(scannedCode)}
                            />
                            <TouchableOpacity style={styles.scanBtn} onPress={() => setShowScanner(true)}>
                                <MaterialCommunityIcons name="barcode-scan" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {selectedProduct ? (
                            <View style={styles.productInfo}>
                                <Text style={styles.prodName}>{selectedProduct.name}</Text>
                                <Text style={{ color: '#666', marginBottom: 5 }}>Mã: {selectedProduct.barcode}</Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 13 }}>Tồn hiện tại: <Text style={{ fontWeight: 'bold', color: '#0288D1' }}>{selectedProduct.stock} {selectedProduct.units?.[0]?.name || 'Đơn vị'}</Text></Text>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.emptyProd}>
                                <Text style={{ color: '#999', fontStyle: 'italic' }}>Chưa chọn sản phẩm nào</Text>
                            </View>
                        )}
                    </View>

                    {/* 3. INPUT QTY */}
                    <Text style={styles.sectionTitle}>SỐ LƯỢNG CHUYỂN</Text>
                    <View style={styles.card}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                            <TextInput
                                style={styles.qtyInput}
                                placeholder="0"
                                keyboardType="numeric"
                                value={transferQty}
                                onChangeText={setTransferQty}
                            />
                            <Text style={{ fontSize: 16, color: '#333' }}>{selectedProduct?.units?.[0]?.name || 'Đơn vị'}</Text>
                        </View>

                        <TextInput
                            style={[styles.searchInput, { marginTop: 15, height: 45 }]}
                            placeholder="Ghi chú (Lý do chuyển)..."
                            value={note}
                            onChangeText={setNote}
                        />
                    </View>

                    {/* ACTION */}
                    <TouchableOpacity
                        style={[styles.submitBtn, (!selectedProduct || !transferQty) && { backgroundColor: '#ccc' }]}
                        onPress={handleTransfer}
                        disabled={!selectedProduct || !transferQty}
                    >
                        <Text style={styles.btnText}>XÁC NHẬN CHUYỂN KHO</Text>
                    </TouchableOpacity>

                    {/* HISTORY */}
                    {history.length > 0 && (
                        <View style={{ marginTop: 20 }}>
                            <Text style={styles.sectionTitle}>LỊCH SỬ VỪA CHUYỂN</Text>
                            {history.map(item => (
                                <View key={item.id} style={styles.historyItem}>
                                    <View>
                                        <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
                                        <Text style={{ fontSize: 12, color: '#666' }}>{item.from} ➔ {item.to}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={{ fontWeight: 'bold', color: '#0288D1', fontSize: 16 }}>{item.qty}</Text>
                                        <Text style={{ fontSize: 10, color: '#999' }}>{item.time}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                </ScrollView>
            </KeyboardAvoidingView>

            <QRScanner visible={showScanner} onClose={() => setShowScanner(false)} onScan={handleScan} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 15, backgroundColor: '#0288D1'
    },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

    whCard: { backgroundColor: '#fff', marginVertical: 15, padding: 15, borderRadius: 10, elevation: 1 },
    whRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    whLabel: { fontSize: 10, color: '#888', marginBottom: 5, fontWeight: 'bold' },
    whBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
    whName: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

    sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#666', marginBottom: 8, marginLeft: 5 },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, elevation: 1, marginBottom: 20 },

    searchInput: {
        flex: 1, backgroundColor: '#F0F0F0', borderRadius: 8, paddingHorizontal: 12, height: 45
    },
    scanBtn: {
        width: 45, height: 45, backgroundColor: '#333', borderRadius: 8,
        justifyContent: 'center', alignItems: 'center'
    },

    productInfo: { padding: 10, backgroundColor: '#E3F2FD', borderRadius: 8, borderWidth: 1, borderColor: '#BBDEFB' },
    prodName: { fontSize: 16, fontWeight: 'bold', color: '#0D47A1', marginBottom: 4 },
    emptyProd: { alignItems: 'center', padding: 10 },

    qtyInput: {
        flex: 1, height: 50, borderWidth: 1, borderColor: '#0288D1', borderRadius: 8,
        textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: '#0288D1'
    },

    submitBtn: {
        backgroundColor: '#0288D1', padding: 15, borderRadius: 8, alignItems: 'center',
        marginTop: 5, elevation: 3
    },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

    historyItem: {
        flexDirection: 'row', justifyContent: 'space-between', padding: 12, backgroundColor: '#fff',
        borderRadius: 8, marginBottom: 8, borderLeftWidth: 3, borderColor: '#0288D1'
    }
});

export default TransferScreen;
