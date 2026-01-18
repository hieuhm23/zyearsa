import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList,
    Alert, StatusBar, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import QRScanner from '../components/QRScanner';
import { PRODUCTS } from '../data/mockData';

const AuditScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [scannedCode, setScannedCode] = useState('');
    const [showScanner, setShowScanner] = useState(false);

    // Audit Session Data
    const [auditItems, setAuditItems] = useState<any[]>([]);

    // Current Scan State
    const [currentItem, setCurrentItem] = useState<any>(null);
    const [actualStock, setActualStock] = useState('');

    const handleScan = (code: string) => {
        setScannedCode(code);
        setShowScanner(false);
        findProduct(code);
    };

    const findProduct = (code: string) => {
        const product = PRODUCTS.find(p => p.barcode === code || p.id === code);
        if (product) {
            setCurrentItem(product);
            setActualStock(''); // Clear previous input
        } else {
            Alert.alert('Không tìm thấy', 'Sản phẩm không có trong hệ thống.');
            setCurrentItem(null);
        }
    };

    const addToAuditList = () => {
        if (!currentItem || actualStock === '') return;

        const systemStock = currentItem.stock || 0;
        const actual = parseInt(actualStock);
        const variance = actual - systemStock;

        const newItem = {
            id: currentItem.id,
            name: currentItem.name,
            barcode: currentItem.barcode,
            unit: currentItem.unit || 'Hộp',
            systemStock,
            actualStock: actual,
            variance,
            status: variance === 0 ? 'MATCH' : (variance > 0 ? 'OVER' : 'UNDER')
        };

        // Remove duplicate if exists, add new
        setAuditItems(prev => [newItem, ...prev.filter(i => i.id !== currentItem.id)]);

        // Reset current
        setCurrentItem(null);
        setScannedCode('');
        setActualStock('');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'MATCH': return '#4CAF50'; // Green
            case 'OVER': return '#2196F3'; // Blue
            case 'UNDER': return '#F44336'; // Red
            default: return '#999';
        }
    };

    const renderAuditItem = ({ item }: { item: any }) => (
        <View style={styles.auditItem}>
            <View style={[styles.statusStrip, { backgroundColor: getStatusColor(item.status) }]} />
            <View style={styles.auditContent}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCode}>{item.barcode}</Text>

                <View style={styles.stockRow}>
                    <View style={styles.stockBlock}>
                        <Text style={styles.stockLabel}>Hệ thống</Text>
                        <Text style={styles.stockValue}>{item.systemStock}</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={16} color="#ccc" />
                    <View style={styles.stockBlock}>
                        <Text style={styles.stockLabel}>Thực tế</Text>
                        <Text style={[styles.stockValue, { color: getStatusColor(item.status) }]}>
                            {item.actualStock}
                        </Text>
                    </View>
                    <View style={[styles.varianceBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                        <Text style={{ color: getStatusColor(item.status), fontWeight: 'bold' }}>
                            {item.variance > 0 ? '+' : ''}{item.variance}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="light-content" backgroundColor="#455A64" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>KIỂM KÊ KHO</Text>
                <TouchableOpacity onPress={() => setAuditItems([])} style={{ padding: 5 }}>
                    <Text style={{ color: '#fff', fontSize: 13 }}>Làm mới</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.body}>
                {/* 1. SCANNER INPUT */}
                <View style={styles.scanSection}>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="barcode-outline" size={20} color="#666" style={{ marginLeft: 10 }} />
                        <TextInput
                            style={styles.input}
                            placeholder="Quét mã vạch sản phẩm..."
                            value={scannedCode}
                            onChangeText={setScannedCode}
                            onSubmitEditing={() => findProduct(scannedCode)}
                        />
                        <TouchableOpacity style={styles.scanBtn} onPress={() => setShowScanner(true)}>
                            <MaterialCommunityIcons name="qrcode-scan" size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 2. CURRENT ITEM ADJUSTMENT */}
                {currentItem && (
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                        <View style={styles.currentCard}>
                            <Text style={styles.currentTitle}>{currentItem.name}</Text>
                            <Text style={styles.currentSub}>{currentItem.barcode} | Đơn vị: {currentItem.unit || 'Hộp'}</Text>

                            <View style={styles.auditInputRow}>
                                <View>
                                    <Text style={styles.label}>Tồn hệ thống</Text>
                                    <Text style={styles.systemStockDisplay}>{currentItem.stock || 0}</Text>
                                </View>

                                <View style={{ flex: 1, paddingHorizontal: 20 }}>
                                    <Text style={styles.label}>Nhập thực tế</Text>
                                    <TextInput
                                        style={styles.actualInput}
                                        value={actualStock}
                                        onChangeText={setActualStock}
                                        keyboardType="numeric"
                                        autoFocus
                                        placeholder="0"
                                    />
                                </View>

                                <TouchableOpacity
                                    style={[styles.confirmBtn, { backgroundColor: actualStock ? '#4CAF50' : '#ccc' }]}
                                    onPress={addToAuditList}
                                    disabled={!actualStock}
                                >
                                    <Ionicons name="checkmark" size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                )}

                {/* 3. AUDIT LIST */}
                <FlatList
                    data={auditItems}
                    keyExtractor={item => item.id}
                    renderItem={renderAuditItem}
                    contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
                    ListHeaderComponent={
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                            <Text style={styles.sectionTitle}>Danh sách đã kiểm ({auditItems.length})</Text>
                            {auditItems.length > 0 && (
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50' }} />
                                        <Text style={{ fontSize: 10, color: '#666' }}>Khớp</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#F44336' }} />
                                        <Text style={{ fontSize: 10, color: '#666' }}>Lệch</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    }
                    ListEmptyComponent={
                        !currentItem ? (
                            <View style={{ alignItems: 'center', marginTop: 50, opacity: 0.5 }}>
                                <MaterialCommunityIcons name="clipboard-check-outline" size={60} color="#ccc" />
                                <Text style={{ marginTop: 10, color: '#999' }}>Chưa có sản phẩm nào được kiểm kê</Text>
                            </View>
                        ) : null
                    }
                />
            </View>

            {/* Bottom Action */}
            {auditItems.length > 0 && (
                <View style={[styles.bottomAction, { paddingBottom: insets.bottom + 10 }]}>
                    <TouchableOpacity style={styles.saveBtn} onPress={() => Alert.alert('Đã lưu', 'Cân bằng kho thành công!')}>
                        <Text style={styles.saveBtnText}>CÂN BẰNG KHO ({auditItems.length})</Text>
                    </TouchableOpacity>
                </View>
            )}

            <QRScanner
                visible={showScanner}
                onClose={() => setShowScanner(false)}
                onScan={handleScan}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#455A64' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 15, backgroundColor: '#455A64'
    },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

    body: { flex: 1, backgroundColor: '#F5F5F5', borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },

    scanSection: { padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
    inputWrapper: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5',
        borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#e0e0e0'
    },
    input: { flex: 1, padding: 12, fontSize: 15, color: '#333' },
    scanBtn: { backgroundColor: '#FFB300', padding: 12, justifyContent: 'center', alignItems: 'center' },

    currentCard: { margin: 15, padding: 15, backgroundColor: '#fff', borderRadius: 12, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1 },
    currentTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    currentSub: { fontSize: 13, color: '#666', marginBottom: 15 },

    auditInputRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
    label: { fontSize: 12, color: '#666', marginBottom: 4 },
    systemStockDisplay: { fontSize: 20, fontWeight: 'bold', color: '#666' },
    actualInput: {
        fontSize: 24, fontWeight: 'bold', color: '#333', borderBottomWidth: 2,
        borderColor: '#0288D1', paddingVertical: 5, textAlign: 'center'
    },
    confirmBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },

    sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#666' },

    auditItem: {
        flexDirection: 'row', backgroundColor: '#fff', borderRadius: 8, marginBottom: 10, overflow: 'hidden',
        elevation: 1
    },
    statusStrip: { width: 6 },
    auditContent: { flex: 1, padding: 12 },
    itemName: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    itemCode: { fontSize: 12, color: '#888', marginBottom: 8 },
    stockRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    stockBlock: { alignItems: 'center' },
    stockLabel: { fontSize: 10, color: '#888' },
    stockValue: { fontSize: 14, fontWeight: '600', color: '#333' },
    varianceBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },

    bottomAction: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 15, borderTopWidth: 1, borderColor: '#eee' },
    saveBtn: { backgroundColor: '#455A64', paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
    saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default AuditScreen;
