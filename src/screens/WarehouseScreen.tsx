import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    ScrollView, Image, StatusBar, Alert, KeyboardAvoidingView, Platform,
    FlatList, Vibration
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { PRODUCTS, GLOBAL_DRUG_DATABASE } from '../data/mockData';
import QRScanner from '../components/QRScanner';

// Mock Warehouses
const WAREHOUSES = [
    { id: 'retail', name: 'Kho Bán Lẻ', icon: 'store', color: '#4CAF50' },
    { id: 'dose', name: 'Kho Cắt Liều', icon: 'pill', color: '#FF9800' },
    { id: 'dam', name: 'Kho Hàng Hỏng', icon: 'alert-circle-outline', color: '#F44336' },
];

const WarehouseScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();

    // STATE
    const [activeTab, setActiveTab] = useState<'import' | 'inventory'>('import');

    // Import Tab State
    const [selectedWarehouse, setSelectedWarehouse] = useState('retail');
    const [showScanner, setShowScanner] = useState(false);
    const [scannedCode, setScannedCode] = useState('');
    const [productName, setProductName] = useState('');
    const [productImage, setProductImage] = useState<string | null>(null);
    const [importPrice, setImportPrice] = useState('');
    const [sellPrice, setSellPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('Hộp');
    const [lotNumber, setLotNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [recentImports, setRecentImports] = useState<any[]>([]);
    const [currentStock, setCurrentStock] = useState('');

    // Inventory Tab State
    const [searchQuery, setSearchQuery] = useState('');

    // Handlers
    const handleScan = (data: string) => {
        setScannedCode(data);
        setShowScanner(false);
        checkProductInDb(data);
    };

    const checkProductInDb = (code: string) => {
        const found = PRODUCTS.find(p => p.barcode === code || p.id === code);
        if (found) {
            setProductName(found.name);
            setProductImage(found.image || null);
            setUnit(found.units?.[0]?.name || 'Hộp');
            // Auto fill price from unit 1
            const u1Price = found.units?.[0]?.price || 0;
            setSellPrice(u1Price.toString());
            // Fake logic: Import price = Sell Price * 0.7
            setImportPrice(Math.round(u1Price * 0.7).toString());

            setCurrentStock(found.stock.toString());
            // Focus quantity field logic could go here if we had ref

            // Mock Date/Lot for demo convenience
            setLotNumber('L00' + Math.floor(Math.random() * 100));

            Alert.alert(
                'Đã tìm thấy thuốc! 💊',
                `Tên: ${found.name}\nTồn: ${found.stock}\nGiá bán: ${u1Price.toLocaleString()}đ\n\n👉 Vui lòng nhập số lượng nhập thêm.`
            );
        } else {
            // Not found in local, try global
            setProductName('');
            setProductImage(null);
            setCurrentStock('');
            // Simulate fetching from global DB
            if (code.length > 5) {
                setTimeout(() => {
                    const globalFound = GLOBAL_DRUG_DATABASE?.find(g => g.id === code);
                    if (globalFound) {
                        setProductName(globalFound.name);
                        setUnit(globalFound.unit);
                        setProductImage(globalFound.image);
                        Alert.alert('Cơ sở dữ liệu Quốc Gia', `Tìm thấy thuốc mới: ${globalFound.name}\nHãy nhập giá và số lượng.`);
                    } else {
                        Alert.alert('Chưa có dữ liệu', 'Mã này chưa có trong hệ thống. Vui lòng nhập thông tin mới.');
                    }
                }, 800);
            }
        }
    };

    const handleDateChange = (text: string) => {
        // Auto format DD/MM/YYYY
        if (text.length === 2 && expiryDate.length === 1) text += '/';
        if (text.length === 5 && expiryDate.length === 4) text += '/';
        setExpiryDate(text);
    };

    const applyMarkup = (percent: number) => {
        const cost = parseInt(importPrice);
        if (!isNaN(cost)) {
            const price = cost + (cost * percent / 100);
            setSellPrice(Math.round(price).toString());
        }
    };

    const handleImportSubmit = () => {
        Vibration.vibrate([0, 20, 50, 20]);
        if (!productName || !quantity || !importPrice) {
            Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên, số lượng và giá nhập.');
            return;
        }

        const newItem = {
            name: productName,
            qty: parseInt(quantity),
            inPrice: parseInt(importPrice),
            outPrice: parseInt(sellPrice) || 0,
            warehouse: WAREHOUSES.find(w => w.id === selectedWarehouse)?.name,
            warehouseColor: WAREHOUSES.find(w => w.id === selectedWarehouse)?.color,
            image: productImage
        };

        setRecentImports([newItem, ...recentImports]);

        // Reset form
        setScannedCode('');
        setProductName('');
        setQuantity('');
        setImportPrice('');
        setSellPrice('');
        setProductImage(null);
        setCurrentStock('');
        Alert.alert('Thành công', 'Đã nhập hàng vào kho.');
    };

    // --- RENDER: INVENTORY LIST TAB ---
    const renderInventoryView = () => {
        const inventoryList = PRODUCTS.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.barcode && p.barcode.includes(searchQuery)) ||
            (p.id && p.id.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        const totalValue = inventoryList.reduce((sum, item) => {
            return sum + ((item.units?.[0]?.price || 0) * item.stock);
        }, 0);

        return (
            <View style={{ flex: 1 }}>
                <View style={styles.statsPanel}>
                    <View style={styles.searchBox}>
                        <Ionicons name="search" size={20} color="#999" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Tìm thuốc, mã vạch..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={18} color="#999" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={styles.statsRow}>
                        <Text style={styles.statsLabel}>Tổng SP: <Text style={styles.statsVal}>{inventoryList.length}</Text></Text>
                        <Text style={styles.statsLabel}>Giá trị: <Text style={[styles.statsVal, { color: '#1976D2' }]}>{totalValue.toLocaleString()}đ</Text></Text>
                    </View>
                </View>

                <FlatList
                    data={inventoryList}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 15, paddingBottom: 80 }}
                    renderItem={({ item }) => (
                        <View style={styles.inventoryItem}>
                            {item.image ? (
                                <Image source={{ uri: item.image }} style={styles.invImage} />
                            ) : (
                                <View style={[styles.invImage, { backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' }]}>
                                    <MaterialCommunityIcons name="image-off-outline" size={20} color="#999" />
                                </View>
                            )}
                            <View style={{ flex: 1, paddingLeft: 12 }}>
                                <Text style={styles.invName}>{item.name}</Text>
                                <Text style={styles.invCode}>{item.barcode || item.id}</Text>
                                <Text style={styles.invPrice}>Giá bán: <Text style={{ color: '#1976D2' }}>{(item.units?.[0]?.price || 0).toLocaleString()}đ</Text>/{item.units?.[0]?.name || 'ĐV'}</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                                <View style={[styles.stockBadge, item.stock < 10 && { backgroundColor: '#FFEBEE', borderColor: '#EF9A9A' }]}>
                                    <Text style={[styles.stockVal, item.stock < 10 && { color: '#D32F2F' }]}>{item.stock}</Text>
                                    <Text style={[styles.stockUnit, item.stock < 10 && { color: '#D32F2F' }]}>{item.units?.[0]?.name || 'ĐV'}</Text>
                                </View>
                                {item.stock < 10 && <Text style={{ fontSize: 10, color: '#D32F2F', marginTop: 4 }}>Sắp hết</Text>}
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 80, opacity: 0.8 }}>
                            <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginBottom: 15 }}>
                                <MaterialCommunityIcons name="magnify-remove-outline" size={50} color="#BDBDBD" />
                            </View>
                            <Text style={{ color: '#757575', fontSize: 16, fontWeight: 'bold' }}>Không tìm thấy thuốc</Text>
                            <Text style={{ color: '#9E9E9E', fontSize: 13, marginTop: 4 }}>Thử tìm bằng tên khác hoặc quét mã lại</Text>
                        </View>
                    }
                />
            </View>
        );
    };

    // --- RENDER: IMPORT TAB ---
    const renderImportView = () => (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 50 }} style={styles.scrollContent}>
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

                <View style={styles.scanSection}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Mã Barcode / QR</Text>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TextInput
                                style={[styles.input, { flex: 1, backgroundColor: '#fff', fontWeight: 'bold', color: '#000' }]}
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

                <View style={styles.card}>
                    <View style={styles.inputGroup}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={styles.label}>Tên thuốc</Text>
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
                            <Text style={[styles.label, { color: '#FBC02D' }]}>Giá Bán</Text>
                            <TextInput
                                style={[styles.input, { color: '#F57F17', borderColor: '#FBC02D', fontWeight: 'bold' }]}
                                value={sellPrice}
                                onChangeText={setSellPrice}
                                keyboardType="numeric"
                                placeholder="vnđ" placeholderTextColor="#999"
                            />
                            <View style={{ flexDirection: 'row', gap: 5, marginTop: 8 }}>
                                {[10, 20, 30].map(p => (
                                    <TouchableOpacity key={p} onPress={() => applyMarkup(p)} style={styles.markupBtn}>
                                        <Text style={styles.markupText}>+{p}%</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Lo / Han */}
                <View style={styles.card}>
                    <View style={{ flexDirection: 'row', gap: 15 }}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Số Lô (Lot)</Text>
                            <TextInput
                                style={styles.input}
                                value={lotNumber}
                                onChangeText={setLotNumber}
                                placeholder="A123..." placeholderTextColor="#ccc"
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Hạn dùng (Exp)</Text>
                            <TextInput
                                style={styles.input}
                                value={expiryDate}
                                onChangeText={handleDateChange}
                                keyboardType="numeric"
                                maxLength={10}
                                placeholder="DD/MM/YYYY" placeholderTextColor="#ccc"
                            />
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={[styles.submitBtn, { backgroundColor: WAREHOUSES.find(w => w.id === selectedWarehouse)?.color }]} onPress={handleImportSubmit}>
                    <Text style={styles.submitBtnText}>NHẬP VÀO {WAREHOUSES.find(w => w.id === selectedWarehouse)?.name?.toUpperCase()}</Text>
                    <MaterialCommunityIcons name="arrow-right-bottom" size={20} color="#fff" style={{ marginLeft: 8 }} />
                </TouchableOpacity>

                {recentImports.length > 0 && (
                    <View style={{ marginTop: 25 }}>
                        <View style={{ alignItems: 'center', marginBottom: 10 }}>
                            <Text style={{ color: '#666', fontSize: 13 }}>Tổng tiền hàng phiên này: <Text style={{ fontWeight: 'bold', color: '#D32F2F', fontSize: 15 }}>{recentImports.reduce((acc, item) => acc + (item.qty * item.inPrice), 0).toLocaleString()}đ</Text></Text>
                        </View>
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
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="light-content" backgroundColor="#0D47A1" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>QUẢN LÝ KHO</Text>
                <TouchableOpacity style={{ padding: 5 }}>
                    <Ionicons name="settings-outline" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tabBtn, activeTab === 'import' && styles.activeTabBtn]}
                    onPress={() => setActiveTab('import')}
                >
                    <MaterialCommunityIcons name="arrow-down-box" size={20} color={activeTab === 'import' ? '#1976D2' : '#666'} />
                    <Text style={[styles.tabText, activeTab === 'import' && styles.activeTabText]}>NHẬP HÀNG</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabBtn, activeTab === 'inventory' && styles.activeTabBtn]}
                    onPress={() => setActiveTab('inventory')}
                >
                    <MaterialCommunityIcons name="clipboard-list" size={20} color={activeTab === 'inventory' ? '#1976D2' : '#666'} />
                    <Text style={[styles.tabText, activeTab === 'inventory' && styles.activeTabText]}>TỒN KHO</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            {activeTab === 'import' ? renderImportView() : renderInventoryView()}

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

    // Tabs
    tabContainer: { flexDirection: 'row', backgroundColor: '#fff', elevation: 2 },
    tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderBottomWidth: 3, borderColor: 'transparent', gap: 5 },
    activeTabBtn: { borderColor: '#1976D2' },
    tabText: { color: '#666', fontWeight: 'bold', fontSize: 13 },
    activeTabText: { color: '#1976D2' },

    scrollContent: { backgroundColor: '#F5F5F5' },
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
        backgroundColor: '#fff', color: '#333', borderRadius: 10, padding: 12,
        borderWidth: 1, borderColor: '#eee', fontSize: 15,
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1
    },
    scanBtn: { backgroundColor: '#FFB300', borderRadius: 8, width: 50, justifyContent: 'center', alignItems: 'center' },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, elevation: 2 },
    inputGroup: { marginBottom: 10 },
    submitBtn: {
        padding: 15, borderRadius: 10, marginTop: 15,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center', elevation: 5
    },
    submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    historyItem: {
        flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderRadius: 10, marginBottom: 8, alignItems: 'center',
        borderLeftWidth: 4, borderColor: '#0288D1', elevation: 2
    },
    historyImg: { width: 40, height: 40, borderRadius: 6, backgroundColor: '#f0f0f0' },
    historyName: { color: '#333', fontWeight: 'bold', fontSize: 14 },
    historySub: { color: '#666', fontSize: 12, marginTop: 2 },
    markupBtn: { backgroundColor: '#FFF9C4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#FBC02D' },
    markupText: { fontSize: 10, color: '#F57F17', fontWeight: 'bold' },

    // Inventory Styles
    statsPanel: { backgroundColor: '#fff', padding: 15, paddingBottom: 10, borderBottomWidth: 1, borderColor: '#eee' },
    searchBox: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5',
        borderRadius: 8, paddingHorizontal: 10, borderWidth: 1, borderColor: '#eee'
    },
    searchInput: { flex: 1, paddingVertical: 8, marginLeft: 8, fontSize: 14, color: '#333' },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    statsLabel: { color: '#666', fontSize: 13 },
    statsVal: { fontWeight: 'bold', color: '#333' },
    inventoryItem: {
        flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 10,
        elevation: 2
    },
    invImage: { width: 50, height: 50, borderRadius: 8 },
    invName: { fontWeight: 'bold', fontSize: 14, color: '#333' },
    invCode: { fontSize: 11, color: '#888', marginTop: 2 },
    invPrice: { fontSize: 12, color: '#666', marginTop: 2 },
    stockBadge: {
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: '#E3F2FD',
        borderWidth: 1, borderColor: '#90CAF9', alignItems: 'center', minWidth: 40
    },
    stockVal: { fontWeight: 'bold', color: '#1976D2', fontSize: 14 },
    stockUnit: { fontSize: 10, color: '#1976D2' },
});

export default WarehouseScreen;
