import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert, ScrollView,
    KeyboardAvoidingView, Platform, StatusBar, FlatList
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import QRScanner from '../components/QRScanner';
import { PRODUCTS, GLOBAL_DRUG_DATABASE } from '../data/mockData';

// Định nghĩa các loại Kho
const WAREHOUSES = [
    { id: 'W_RETAIL', name: 'Kho Bán Lẻ', icon: 'store', color: '#4CAF50' },
    { id: 'W_DOSE', name: 'Kho Cắt Liều', icon: 'pill', color: '#FF9800' },
    { id: 'W_DAMAGED', name: 'Kho Hàng Hỏng', icon: 'alert-circle-outline', color: '#F44336' },
];

const WarehouseScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [scannedCode, setScannedCode] = useState('');
    const [showScanner, setShowScanner] = useState(false);

    // Selected Warehouse
    const [selectedWarehouse, setSelectedWarehouse] = useState('W_RETAIL');

    // Form Data
    const [productName, setProductName] = useState('');
    const [productImage, setProductImage] = useState<string | null>(null);
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('Hộp');
    const [lotNumber, setLotNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');

    // NEW: Tồn kho hiện tại
    const [currentStock, setCurrentStock] = useState<string>('');

    // Price Data
    const [importPrice, setImportPrice] = useState('');
    const [sellPrice, setSellPrice] = useState('');

    const [recentImports, setRecentImports] = useState<any[]>([]);

    const handleScan = (code: string) => {
        setScannedCode(code);
        setShowScanner(false);

        // 1. Tìm trong kho hiện tại trước
        const existing = PRODUCTS.find(p => p.id === code);

        if (existing) {
            // Trường hợp 1: Thuốc đã có trong kho -> Nhập thêm
            setProductName(existing.name);
            setProductImage(existing.image || null);
            setSellPrice(existing.units?.[0]?.price?.toString() || '0');

            // Hiển thị tồn kho
            // Giả định 1 hộp = 120 viên (nếu số lượng > 100) để demo quy đổi
            const boxCount = Math.floor(existing.stock / 100);
            const stockText = `${existing.stock}`;
            setCurrentStock(stockText);

            Alert.alert(
                'Đã có trong kho',
                `Sản phẩm: ${existing.name}\n📦 Tồn hiện tại: ${existing.stock} đơn vị`
            );
        } else {
            // 2. Nếu chưa có -> Tìm trong Master Data (Dữ liệu Quốc gia)
            const masterData = GLOBAL_DRUG_DATABASE.find(p => p.id === code);

            if (masterData) {
                setProductName(masterData.name);
                setProductImage(masterData.image || null);
                setUnit(masterData.unit);
                setCurrentStock('0 (Sản phẩm mới)');
                Alert.alert('Tìm thấy trong Dữ liệu Quốc gia', `Tự động điền thông tin cho: ${masterData.name}`);
            } else {
                resetFormOnly();
                setScannedCode(code);
                setCurrentStock('0 (Sản phẩm mới)');
                Alert.alert('Sản phẩm mới', 'Mã chưa có dữ liệu. Vui lòng nhập thông tin mới.');
            }
        }
    };

    const handleImportSubmit = () => {
        if (!scannedCode || !productName || !quantity) {
            Alert.alert('Thiếu thông tin', 'Vui lòng nhập Barcode, Tên và Số lượng.');
            return;
        }

        const currentWarehouse = WAREHOUSES.find(w => w.id === selectedWarehouse);

        const newImport = {
            id: scannedCode,
            name: productName,
            image: productImage,
            qty: parseInt(quantity),
            unit: unit,
            warehouse: currentWarehouse?.name, // Lưu tên kho
            warehouseColor: currentWarehouse?.color,
            lot: lotNumber || 'N/A',
            exp: expiryDate || 'N/A',
            inPrice: parseInt(importPrice) || 0,
            outPrice: parseInt(sellPrice) || 0,
            time: new Date().toLocaleTimeString()
        };

        setRecentImports(prev => [newImport, ...prev]);

        // Reset giữ lại mã kho để nhập tiếp
        setScannedCode('');
        resetFormOnly();
        Alert.alert('Thành công', `Đã nhập vào ${currentWarehouse?.name}`);
    };

    const resetFormOnly = () => {
        setProductName('');
        setProductImage(null);
        setQuantity('');
        setLotNumber('');
        setExpiryDate('');
        setImportPrice('');
        setSellPrice('');
        setCurrentStock('');
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="light-content" backgroundColor="#0D47A1" />

            {/* Header - Đồng bộ với các màn hình khác */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>NHẬP KHO</Text>
                <TouchableOpacity style={{ padding: 5 }}>
                    <Ionicons name="settings-outline" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 50 }} style={styles.scrollContent}>

                    {/* 1. CHỌN KHO */}
                    <Text style={styles.sectionLabel}>CHỌN KHO NHẬP:</Text>
                    <View style={styles.warehouseList}>
                        {WAREHOUSES.map((w) => (
                            <TouchableOpacity
                                key={w.id}
                                style={[
                                    styles.warehouseChip,
                                    selectedWarehouse === w.id && { backgroundColor: w.color, borderColor: w.color }
                                ]}
                                onPress={() => setSelectedWarehouse(w.id)}
                            >
                                <MaterialCommunityIcons
                                    name={w.icon as any}
                                    size={18}
                                    color={selectedWarehouse === w.id ? '#fff' : '#888'}
                                />
                                <Text style={[
                                    styles.warehouseText,
                                    selectedWarehouse === w.id && { color: '#fff', fontWeight: 'bold' }
                                ]}>
                                    {w.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* 2. SCAN & ẢNH */}
                    <View style={styles.scanSection}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Mã Barcode / QR</Text>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <TextInput
                                    style={[styles.input, { flex: 1, backgroundColor: '#333', fontWeight: 'bold' }]}
                                    value={scannedCode}
                                    onChangeText={setScannedCode}
                                    placeholder="Quét mã..."
                                    placeholderTextColor="#666"
                                />
                                <TouchableOpacity style={styles.scanBtn} onPress={() => setShowScanner(true)}>
                                    <MaterialCommunityIcons name="barcode-scan" size={24} color="#000" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.imageBox}>
                            {productImage ? (
                                <Image source={{ uri: productImage }} style={styles.imagePreview} />
                            ) : (
                                <View style={{ alignItems: 'center' }}>
                                    <MaterialCommunityIcons name="image-plus" size={30} color="#555" />
                                    <Text style={{ fontSize: 10, color: '#555' }}>Ảnh</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* 3. THÔNG TIN & GIÁ */}
                    <View style={styles.card}>
                        <View style={styles.inputGroup}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={styles.label}>Tên thuốc</Text>
                                {/* NEW: HIỂN THỊ TỒN KHO */}
                                {currentStock !== '' && (
                                    <Text style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: 12 }}>
                                        Tồn kho: {currentStock}
                                    </Text>
                                )}
                            </View>
                            <TextInput
                                style={[styles.input, { fontSize: 16, fontWeight: 'bold' }]}
                                value={productName}
                                onChangeText={setProductName}
                                placeholder="VD: Panadol Extra..." placeholderTextColor="#666"
                            />
                        </View>

                        <View style={{ flexDirection: 'row', gap: 15 }}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Số lượng</Text>
                                <TextInput
                                    style={[styles.input, { borderColor: '#4CAF50' }]}
                                    value={quantity}
                                    onChangeText={setQuantity}
                                    keyboardType="numeric"
                                    placeholder="0" placeholderTextColor="#666"
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Đơn vị</Text>
                                <TextInput
                                    style={styles.input}
                                    value={unit}
                                    onChangeText={setUnit}
                                />
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 15, marginTop: 10 }}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Giá Nhập</Text>
                                <TextInput
                                    style={styles.input}
                                    value={importPrice}
                                    onChangeText={setImportPrice}
                                    keyboardType="numeric"
                                    placeholder="vnđ" placeholderTextColor="#666"
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: '#FFD700' }]}>Giá Bán</Text>
                                <TextInput
                                    style={[styles.input, { color: '#FFD700', borderColor: '#FFD700' }]}
                                    value={sellPrice}
                                    onChangeText={setSellPrice}
                                    keyboardType="numeric"
                                    placeholder="vnđ" placeholderTextColor="#666"
                                />
                            </View>
                        </View>
                    </View>

                    {/* 4. CHI TIẾT LÔ / HẠN */}
                    <View style={styles.card}>
                        <View style={{ flexDirection: 'row', gap: 15 }}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Số Lô (Lot)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={lotNumber}
                                    onChangeText={setLotNumber}
                                    placeholder="A123..." placeholderTextColor="#666"
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Hạn dùng (Exp)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={expiryDate}
                                    onChangeText={setExpiryDate}
                                    placeholder="DD/MM/YYYY" placeholderTextColor="#666"
                                />
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity style={[styles.submitBtn, { backgroundColor: WAREHOUSES.find(w => w.id === selectedWarehouse)?.color }]} onPress={handleImportSubmit}>
                        <Text style={styles.submitBtnText}>NHẬP VÀO {WAREHOUSES.find(w => w.id === selectedWarehouse)?.name?.toUpperCase()}</Text>
                        <MaterialCommunityIcons name="arrow-right-bottom" size={20} color="#fff" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>

                    {/* HISTORY LIST */}
                    {recentImports.length > 0 && (
                        <View style={{ marginTop: 25 }}>
                            <Text style={{ color: '#888', marginBottom: 10, fontSize: 12 }}>LỊCH SỬ NHẬP PHIÊN NAY</Text>
                            {recentImports.map((item, idx) => (
                                <View key={idx} style={styles.historyItem}>
                                    {item.image && <Image source={{ uri: item.image }} style={styles.historyImg} />}
                                    <View style={{ flex: 1, paddingLeft: 10 }}>
                                        <Text style={styles.historyName}>{item.name}</Text>
                                        <Text style={{ color: item.warehouseColor, fontSize: 10, fontWeight: 'bold' }}>{item.warehouse}</Text>
                                        <Text style={styles.historySub}>SL: <Text style={{ color: '#4CAF50', fontWeight: 'bold' }}>+{item.qty}</Text> | Giá: {item.outPrice.toLocaleString()}</Text>
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
    container: { flex: 1, backgroundColor: '#0D47A1' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 15, backgroundColor: '#0D47A1'
    },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    scrollContent: { backgroundColor: '#F5F5F5', borderTopLeftRadius: 20, borderTopRightRadius: 20 },

    sectionLabel: { color: '#666', fontSize: 12, marginBottom: 8, fontWeight: 'bold' },
    warehouseList: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    warehouseChip: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12,
        borderRadius: 20, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff', gap: 5
    },
    warehouseText: { color: '#666', fontSize: 12 },

    scanSection: { flexDirection: 'row', gap: 15, marginBottom: 15 },
    imageBox: {
        width: 80, height: 80, backgroundColor: '#fff', borderRadius: 8,
        borderWidth: 1, borderColor: '#ddd', borderStyle: 'dashed',
        justifyContent: 'center', alignItems: 'center', overflow: 'hidden'
    },
    imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },

    label: { color: '#666', marginBottom: 6, fontSize: 12 },
    input: {
        backgroundColor: '#fff', color: '#333', borderRadius: 8, padding: 12,
        borderWidth: 1, borderColor: '#ddd', fontSize: 15
    },
    scanBtn: {
        backgroundColor: '#FFB300', borderRadius: 8, width: 50, justifyContent: 'center', alignItems: 'center'
    },

    card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
    inputGroup: { marginBottom: 10 },

    submitBtn: {
        padding: 15, borderRadius: 10, marginTop: 15,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 5, elevation: 5
    },
    submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

    historyItem: {
        flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderRadius: 10, marginBottom: 8, alignItems: 'center',
        borderLeftWidth: 4, borderColor: '#0288D1', elevation: 2
    },
    historyImg: { width: 40, height: 40, borderRadius: 6, backgroundColor: '#f0f0f0' },
    historyName: { color: '#333', fontWeight: 'bold', fontSize: 14 },
    historySub: { color: '#666', fontSize: 12, marginTop: 2 }
});

export default WarehouseScreen;
