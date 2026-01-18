import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    ScrollView, Image, StatusBar, Alert, KeyboardAvoidingView, Platform,
    FlatList, Vibration, ActivityIndicator, Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { PRODUCTS } from '../data/mockData';
import QRScanner from '../components/QRScanner';
import { inventoryService, Product, ProductUnit } from '../services/inventoryService';

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
    const [loading, setLoading] = useState(false);
    const [dbProducts, setDbProducts] = useState<Product[]>([]);

    // Import/Edit Tab State
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingProductId, setEditingProductId] = useState<string | null>(null);
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

    // Conversion State
    const [enableConversion, setEnableConversion] = useState(false);
    const [unitBig, setUnitBig] = useState('Hộp');
    const [unitMid, setUnitMid] = useState('Vỉ');
    const [unitSmall, setUnitSmall] = useState('Viên');
    const [rateBigToMid, setRateBigToMid] = useState('10');
    const [rateMidToSmall, setRateMidToSmall] = useState('10');

    // Inventory Tab State
    const [searchQuery, setSearchQuery] = useState('');

    // Load Data Effect
    useEffect(() => {
        if (activeTab === 'inventory') {
            fetchInventory();
        }
    }, [activeTab, searchQuery]);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const data = await inventoryService.getProducts(searchQuery);
            setDbProducts(data || []);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handlers
    const handleScan = (data: string) => {
        setScannedCode(data);
        setShowScanner(false);
        checkProductInDb(data);
    };

    const checkProductInDb = (code: string) => {
        const found = dbProducts.find(p => p.barcode === code) || PRODUCTS.find(p => p.barcode === code || p.id === code);
        if (found) {
            setupEditMode(found as Product);
            Alert.alert(
                'Đã tìm thấy thuốc! 💊',
                `Chế độ: Cập nhật thuốc\nTên: ${found.name}\n\n👉 Bác có thể chỉnh sửa thông tin hoặc nhập thêm kho.`
            );
        } else {
            resetForm();
            setScannedCode(code);
        }
    };

    const setupEditMode = (p: Product) => {
        setIsEditMode(true);
        setEditingProductId(p.id);
        setProductName(p.name);
        setScannedCode(p.barcode || '');
        setProductImage(p.image_url || null);
        setCurrentStock(p.stock.toString());
        setQuantity('0');

        // Setup units
        if (p.units && p.units.length >= 3) {
            setEnableConversion(true);
            const big = p.units.find(u => !u.is_base_unit && u.conversion_rate > 1);
            const mid = p.units.find(u => !u.is_base_unit && u.conversion_rate > 1 && u.conversion_rate < (big?.conversion_rate || 999));
            const small = p.units.find(u => u.is_base_unit);

            setUnitBig(big?.unit_name || 'Hộp');
            setUnitMid(mid?.unit_name || 'Vỉ');
            setUnitSmall(small?.unit_name || 'Viên');
            setSellPrice(big?.price.toString() || '0');
            if (big && mid) setRateBigToMid(Math.round(big.conversion_rate / mid.conversion_rate).toString());
            if (mid && small) setRateMidToSmall(mid.conversion_rate.toString());
        } else if (p.units && p.units.length > 0) {
            setEnableConversion(false);
            setUnit(p.units[0].unit_name);
            setSellPrice(p.units[0].price.toString());
        }
    };

    const resetForm = () => {
        setIsEditMode(false);
        setEditingProductId(null);
        setScannedCode('');
        setProductName('');
        setQuantity('');
        setImportPrice('');
        setSellPrice('');
        setCurrentStock('');
        setProductImage(null);
        setLotNumber('');
        setExpiryDate('');
        setEnableConversion(false);
    };

    const handleDateChange = (text: string) => {
        let cleaned = text.replace(/\D/g, '');
        if (cleaned.length > 2 && cleaned.length <= 4) cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
        else if (cleaned.length > 4) cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8);
        setExpiryDate(cleaned);
    };

    const applyMarkup = (percent: number) => {
        const price = parseInt(importPrice);
        if (price) {
            setSellPrice(Math.round(price * (1 + percent / 100)).toString());
        }
    };

    const handleImportSubmit = async () => {
        if (!productName || (quantity === '' && !isEditMode)) {
            Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên thuốc và số lượng.');
            return;
        }

        setLoading(true);
        try {
            const qtyInput = parseInt(quantity) || 0;
            const priceBig = parseInt(sellPrice) || 0;

            let finalBaseStockAdded = qtyInput;
            let units: any[] = [];

            if (enableConversion) {
                const r1 = parseInt(rateBigToMid) || 1;
                const r2 = parseInt(rateMidToSmall) || 1;
                finalBaseStockAdded = qtyInput * r1 * r2;

                units = [
                    { unit_name: unitBig, price: priceBig, is_base_unit: false, conversion_rate: r1 * r2 },
                    { unit_name: unitMid, price: Math.round(priceBig / r1), is_base_unit: false, conversion_rate: r2 },
                    { unit_name: unitSmall, price: Math.round(priceBig / (r1 * r2)), is_base_unit: true, conversion_rate: 1 },
                ];
            } else {
                units = [
                    { unit_name: unit, price: priceBig, is_base_unit: true, conversion_rate: 1 }
                ];
            }

            const productData: Partial<Product> = {
                id: editingProductId || undefined,
                name: productName,
                barcode: scannedCode,
                stock: (parseInt(currentStock) || 0) + finalBaseStockAdded,
                image_url: productImage || '',
                brand: 'Việt Nam'
            };

            await inventoryService.upsertProduct(productData, units);

            setRecentImports([{
                name: productName,
                qty: qtyInput,
                inPrice: parseInt(importPrice) || 0,
                outPrice: priceBig,
                warehouse: WAREHOUSES.find(w => w.id === selectedWarehouse)?.name,
                image: productImage,
                isUpdate: isEditMode
            }, ...recentImports]);

            Alert.alert('Thành công', isEditMode ? 'Đã cập nhật thông tin thuốc! 💊' : 'Đã nhập kho mới thành công! 💊');
            resetForm();
            if (activeTab === 'inventory') fetchInventory();
        } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Thao tác thất bại.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            "Xóa thuốc",
            "Bác có chắc chắn muốn xóa thuốc này khỏi kho không?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa", style: "destructive", onPress: async () => {
                        try {
                            setLoading(true);
                            await inventoryService.deleteProduct(id);
                            fetchInventory();
                            Alert.alert("Thành công", "Đã xóa thuốc.");
                        } catch (e) {
                            Alert.alert("Lỗi", "Không thể xóa.");
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const renderImportView = () => (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <ScrollView style={styles.scrollContent} contentContainerStyle={{ padding: 15, paddingBottom: 100 }}>
                {/* Mode Indicator */}
                <View style={[styles.modeIndicator, isEditMode && styles.modeIndicatorEdit]}>
                    <MaterialCommunityIcons name={isEditMode ? "pencil" : "plus-box"} size={20} color={isEditMode ? "#0D47A1" : "#4CAF50"} />
                    <Text style={[styles.modeText, { color: isEditMode ? "#0D47A1" : "#4CAF50" }]}>
                        {isEditMode ? "ĐANG CHỈNH SỬA THUỐC" : "NHẬP KHO MỚI"}
                    </Text>
                    {isEditMode && (
                        <TouchableOpacity onPress={resetForm} style={styles.cancelEditBtn}>
                            <Text style={styles.cancelEditText}>Hủy</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Warehouse Selector */}
                <Text style={styles.sectionLabel}>CHỌN KHO NHẬP</Text>
                <View style={styles.warehouseList}>
                    {WAREHOUSES.map(w => (
                        <TouchableOpacity
                            key={w.id}
                            style={[styles.warehouseChip, selectedWarehouse === w.id && { backgroundColor: w.color, borderColor: w.color }]}
                            onPress={() => setSelectedWarehouse(w.id)}
                        >
                            <MaterialCommunityIcons name={w.icon as any} size={18} color={selectedWarehouse === w.id ? '#fff' : '#666'} />
                            <Text style={[styles.warehouseText, selectedWarehouse === w.id && { color: '#fff', fontWeight: 'bold' }]}>{w.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Barcode & Image */}
                <View style={styles.scanSection}>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text style={styles.label}>Mã Barcode</Text>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                value={scannedCode}
                                onChangeText={setScannedCode}
                                placeholder="Quét hoặc nhập tay..." placeholderTextColor="#ccc"
                                onBlur={() => scannedCode && checkProductInDb(scannedCode)}
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

                {/* Name & Qty */}
                <View style={styles.card}>
                    <View style={styles.inputGroup}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={styles.label}>Tên thuốc</Text>
                            {currentStock !== '' && (
                                <Text style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: 12 }}>Hiện tồn: {currentStock}</Text>
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
                            <Text style={styles.label}>{isEditMode ? "Nhập thêm SL" : "Số lượng nhập"}</Text>
                            <TextInput
                                style={[styles.input, { borderColor: '#4CAF50' }]}
                                value={quantity}
                                onChangeText={setQuantity}
                                keyboardType="numeric"
                                placeholder="0"
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Đơn vị</Text>
                            <TextInput style={styles.input} value={unit} onChangeText={setUnit} editable={!enableConversion} />
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 15 }}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Giá Nhập</Text>
                            <TextInput style={styles.input} value={importPrice} onChangeText={setImportPrice} keyboardType="numeric" placeholder="vnđ" />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Giá Bán ({unitBig})</Text>
                            <TextInput style={[styles.input, { color: '#F57F17', fontWeight: 'bold' }]} value={sellPrice} onChangeText={setSellPrice} keyboardType="numeric" placeholder="vnđ" />
                        </View>
                    </View>
                </View>

                {/* Phân rã */}
                <View style={styles.card}>
                    <TouchableOpacity style={styles.conversionToggle} onPress={() => setEnableConversion(!enableConversion)}>
                        <Ionicons name={enableConversion ? "checkbox" : "square-outline"} size={24} color="#0D47A1" />
                        <Text style={styles.conversionToggleText}>Phân rã đơn vị (Chỉnh sửa quy cách)</Text>
                    </TouchableOpacity>
                    {enableConversion && (
                        <View style={styles.conversionBox}>
                            <View style={styles.convRow}>
                                <TextInput style={styles.convInputSmall} value={unitBig} onChangeText={setUnitBig} />
                                <Text style={styles.convText}>=</Text>
                                <TextInput style={styles.convInputQty} value={rateBigToMid} onChangeText={setRateBigToMid} keyboardType="numeric" />
                                <TextInput style={styles.convInputSmall} value={unitMid} onChangeText={setUnitMid} />
                            </View>
                            <View style={styles.convRow}>
                                <TextInput style={styles.convInputSmall} value={unitMid} onChangeText={setUnitMid} />
                                <Text style={styles.convText}>=</Text>
                                <TextInput style={styles.convInputQty} value={rateMidToSmall} onChangeText={setRateMidToSmall} keyboardType="numeric" />
                                <TextInput style={styles.convInputSmall} value={unitSmall} onChangeText={setUnitSmall} />
                            </View>
                            {/* Conversion Preview */}
                            {quantity !== '' && parseInt(quantity) > 0 && (
                                <View style={styles.previewBox}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                        <Ionicons name="calculator-outline" size={18} color="#1976D2" />
                                        <Text style={{ fontWeight: 'bold', color: '#1976D2', fontSize: 13 }}>Xác nhận quy đổi:</Text>
                                    </View>
                                    <View style={styles.previewRow}>
                                        <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                                        <Text style={styles.previewText}>Nhập thêm: <Text style={{ fontWeight: 'bold' }}>{quantity} {unitBig}</Text></Text>
                                    </View>
                                    <View style={styles.previewRow}>
                                        <Ionicons name="arrow-forward" size={14} color="#666" />
                                        <Text style={styles.previewSubText}>= <Text style={{ fontWeight: 'bold' }}>{parseInt(quantity) * (parseInt(rateBigToMid) || 1)} {unitMid}</Text></Text>
                                    </View>
                                    <View style={styles.previewRow}>
                                        <Ionicons name="arrow-forward" size={14} color="#666" />
                                        <Text style={styles.previewSubText}>= <Text style={{ fontWeight: 'bold', color: '#D32F2F' }}>{(parseInt(quantity) * (parseInt(rateBigToMid) || 1) * (parseInt(rateMidToSmall) || 1)).toLocaleString()} {unitSmall}</Text></Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* Lot & Exp */}
                <View style={styles.card}>
                    <View style={{ flexDirection: 'row', gap: 15 }}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Số Lô (Lot)</Text>
                            <TextInput style={styles.input} value={lotNumber} onChangeText={setLotNumber} />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Hạn dùng</Text>
                            <TextInput style={styles.input} value={expiryDate} onChangeText={handleDateChange} keyboardType="numeric" placeholder="DD/MM/YYYY" />
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={[styles.submitBtn, { backgroundColor: isEditMode ? "#0D47A1" : (WAREHOUSES.find(w => w.id === selectedWarehouse)?.color || '#0D47A1') }]} onPress={handleImportSubmit}>
                    <Text style={styles.submitBtnText}>{isEditMode ? "CẬP NHẬT THÔNG TIN" : `NHẬP VÀO ${(WAREHOUSES.find(w => w.id === selectedWarehouse)?.name || 'KHO').toUpperCase()}`}</Text>
                    <MaterialCommunityIcons name={isEditMode ? "content-save-check" : "arrow-right-bottom"} size={20} color="#fff" style={{ marginLeft: 8 }} />
                </TouchableOpacity>

                {recentImports.length > 0 && (
                    <View style={{ marginTop: 20 }}>
                        <Text style={{ color: '#888', marginBottom: 10, fontSize: 12 }}>LỊCH SỬ THAO TÁC PHIÊN NAY</Text>
                        {recentImports.map((item, idx) => (
                            <View key={idx} style={styles.historyItem}>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={styles.historyName}>{item.name}</Text>
                                        <Text style={{ color: item.isUpdate ? "#0D47A1" : "#4CAF50", fontSize: 10, fontWeight: 'bold' }}>{item.isUpdate ? "CẬP NHẬT" : "MỚI"}</Text>
                                    </View>
                                    <Text style={styles.historySub}>SL: +{item.qty} | Kho: {item.warehouse}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );

    const renderInventoryView = () => (
        <View style={{ flex: 1 }}>
            <View style={styles.searchBox}>
                <Ionicons name="search" size={20} color="#999" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm thuốc trong kho..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
            <FlatList
                data={dbProducts}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 100 }}
                renderItem={({ item }) => (
                    <View style={styles.inventoryItem}>
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemStock}>Tồn kho: <Text style={styles.stockUnit}>{item.stock} {item.units?.find(u => u.is_base_unit)?.unit_name || 'Viên'}</Text></Text>
                            {item.barcode && <Text style={{ fontSize: 10, color: '#999', marginTop: 2 }}>Barcode: {item.barcode}</Text>}
                        </View>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TouchableOpacity style={styles.miniBtn} onPress={() => { setupEditMode(item); setActiveTab('import'); }}>
                                <Ionicons name="pencil" size={16} color="#0D47A1" />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.miniBtn, { borderColor: '#FFCDD2' }]} onPress={() => handleDelete(item.id)}>
                                <Ionicons name="trash" size={16} color="#C62828" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={{ alignItems: 'center', marginTop: 50 }}>
                        <ActivityIndicator size="large" color="#0D47A1" />
                        <Text style={{ color: '#999', marginTop: 10 }}>Đang tải dữ liệu...</Text>
                    </View>
                }
            />
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="light-content" backgroundColor="#0D47A1" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 5 }}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
                <Text style={styles.headerTitle}>QUẢN LÝ KHO</Text>
                <TouchableOpacity style={{ padding: 5 }}><Ionicons name="settings-outline" size={24} color="#fff" /></TouchableOpacity>
            </View>
            <View style={styles.tabContainer}>
                <TouchableOpacity style={[styles.tabBtn, activeTab === 'import' && styles.activeTabBtn]} onPress={() => setActiveTab('import')}>
                    <MaterialCommunityIcons name="arrow-down-box" size={20} color={activeTab === 'import' ? '#1976D2' : '#666'} />
                    <Text style={[styles.tabText, activeTab === 'import' && styles.activeTabText]}>{isEditMode ? "SỬA THUỐC" : "NHẬP HÀNG"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tabBtn, activeTab === 'inventory' && styles.activeTabBtn]} onPress={() => setActiveTab('inventory')}>
                    <MaterialCommunityIcons name="clipboard-list" size={20} color={activeTab === 'inventory' ? '#1976D2' : '#666'} />
                    <Text style={[styles.tabText, activeTab === 'inventory' && styles.activeTabText]}>TỒN KHO</Text>
                </TouchableOpacity>
            </View>
            {activeTab === 'import' ? renderImportView() : renderInventoryView()}
            <QRScanner visible={showScanner} onClose={() => setShowScanner(false)} onScan={handleScan} />
            {loading && (
                <View style={styles.fullLoading}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={{ color: '#fff', marginTop: 10 }}>Đang xử lý...</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0D47A1' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: '#0D47A1' },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    tabContainer: { flexDirection: 'row', backgroundColor: '#fff', elevation: 2 },
    tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderBottomWidth: 3, borderColor: 'transparent', gap: 5 },
    activeTabBtn: { borderColor: '#1976D2' },
    tabText: { color: '#666', fontWeight: 'bold', fontSize: 13 },
    activeTabText: { color: '#1976D2' },
    scrollContent: { backgroundColor: '#F5F5F5' },
    sectionLabel: { color: '#666', fontSize: 11, marginBottom: 8, fontWeight: 'bold', paddingHorizontal: 15, marginTop: 10 },
    warehouseList: { flexDirection: 'row', gap: 10, paddingHorizontal: 15, marginBottom: 15 },
    warehouseChip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff', gap: 5 },
    warehouseText: { color: '#666', fontSize: 12 },
    scanSection: { flexDirection: 'row', gap: 10, paddingHorizontal: 15, marginBottom: 15 },
    imageBox: { width: 70, height: 70, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#ddd', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
    imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
    label: { color: '#666', marginBottom: 6, fontSize: 11 },
    input: { backgroundColor: '#fff', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#eee', fontSize: 14, color: '#333' },
    scanBtn: { backgroundColor: '#FFB300', borderRadius: 8, width: 45, justifyContent: 'center', alignItems: 'center' },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 12, marginHorizontal: 15, elevation: 2 },
    inputGroup: { marginBottom: 12 },
    markupBtn: { backgroundColor: '#FFF9C4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#FBC02D' },
    markupText: { color: '#F57F17', fontSize: 10, fontWeight: 'bold' },
    submitBtn: { backgroundColor: '#1976D2', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 15, borderRadius: 12, marginHorizontal: 15, marginTop: 5, marginBottom: 25 },
    submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    historyItem: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8, marginHorizontal: 15, borderWidth: 1, borderColor: '#eee' },
    historyName: { fontWeight: 'bold', fontSize: 13, color: '#333' },
    historySub: { fontSize: 11, color: '#666', marginTop: 2 },
    conversionToggle: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    conversionToggleText: { fontSize: 14, fontWeight: 'bold', color: '#0D47A1' },
    conversionBox: { marginTop: 15, backgroundColor: '#F0F7FF', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#D1E8FF' },
    convRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    convInputSmall: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 8, textAlign: 'center', fontSize: 12 },
    convInputQty: { width: 50, backgroundColor: '#fff', borderWidth: 1, borderColor: '#0D47A1', borderRadius: 6, padding: 8, textAlign: 'center', fontSize: 13, fontWeight: 'bold' },
    convText: { fontWeight: 'bold', color: '#666' },
    previewBox: { marginTop: 15, padding: 12, backgroundColor: '#fff', borderRadius: 8, borderLeftWidth: 5, borderLeftColor: '#1976D2', elevation: 2 },
    previewRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    previewText: { fontSize: 14, color: '#333' },
    previewSubText: { fontSize: 13, color: '#666' },
    inventoryItem: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 10, alignItems: 'center', marginHorizontal: 15 },
    itemInfo: { flex: 1 },
    itemName: { fontWeight: 'bold', fontSize: 15, color: '#333' },
    itemStock: { color: '#666', fontSize: 12, marginTop: 4 },
    miniBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center' },
    modeIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', padding: 10, borderRadius: 8, marginHorizontal: 15, marginBottom: 15, borderWidth: 1, borderColor: '#C8E6C9' },
    modeIndicatorEdit: { backgroundColor: '#E3F2FD', borderColor: '#BBDEFB' },
    modeText: { fontSize: 12, fontWeight: 'bold', marginLeft: 8, flex: 1 },
    cancelEditBtn: { backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#ddd' },
    cancelEditText: { fontSize: 11, color: '#666' },
    fullLoading: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
    stockUnit: { color: '#1976D2', fontSize: 11, fontWeight: 'bold' },
    searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 15, marginTop: 10, marginBottom: 15, paddingHorizontal: 12, height: 45, borderRadius: 10, elevation: 2 },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 14 }
});

export default WarehouseScreen;
