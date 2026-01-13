import React, { useState, useMemo } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, FlatList, Image, TouchableOpacity, TextInput, Alert, Modal
} from 'react-native';
import { PRODUCTS } from '../data/mockData';
import QRScanner from '../components/QRScanner';

const PosScreen = ({ navigation }: any) => {
    const [cart, setCart] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showScanner, setShowScanner] = useState(false);

    // State Modal
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [selectedUnit, setSelectedUnit] = useState<any>(null);

    // Gợi ý tìm kiếm (chỉ hiện khi có nhập text)
    const searchResults = useMemo(() => {
        if (!searchQuery) return [];
        return PRODUCTS.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.includes(searchQuery));
    }, [searchQuery]);

    const openProductModal = (product: any) => {
        setSelectedProduct(product);
        setSelectedUnit(product.units[0]);
        setQuantity(1);
        setModalVisible(true);
        setSearchQuery(''); // Clear search sau khi chọn
    };

    const confirmAddToCart = () => {
        if (!selectedProduct || !selectedUnit) return;
        setCart(prev => {
            const existingIndex = prev.findIndex(item => item.id === selectedProduct.id && item.unitName === selectedUnit.name);
            if (existingIndex > -1) {
                const newCart = [...prev];
                newCart[existingIndex].quantity += quantity;
                newCart[existingIndex].total = newCart[existingIndex].price * newCart[existingIndex].quantity;
                return newCart;
            } else {
                return [...prev, {
                    id: selectedProduct.id,
                    name: selectedProduct.name,
                    unitName: selectedUnit.name,
                    price: selectedUnit.price,
                    quantity: quantity,
                    total: selectedUnit.price * quantity
                }];
            }
        });
        setModalVisible(false);
    };

    const handleScan = (code: string) => {
        const foundProduct = PRODUCTS.find(p => p.id === code);
        if (foundProduct) {
            openProductModal(foundProduct);
            setShowScanner(false);
        } else {
            Alert.alert('Không tìm thấy', `Mã: ${code}`);
            setShowScanner(false);
        }
    };

    // Render từng dòng trong giỏ hàng
    const renderCartItem = ({ item }: { item: any }) => (
        <View style={styles.cartItemRow}>
            <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemUnit}>{item.quantity} {item.unitName} x {item.price.toLocaleString('vi-VN')}</Text>
            </View>
            <Text style={styles.itemTotal}>{item.total.toLocaleString('vi-VN')}₫</Text>
            <TouchableOpacity onPress={() => setCart(prev => prev.filter(i => i !== item))} style={{ marginLeft: 10 }}>
                <Text style={{ color: 'red' }}>✕</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>

            {/* 1. Header Xanh */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View style={styles.searchBox}>
                    <Text style={{ fontSize: 14 }}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Nhập tên, barcode hoặc hoạt chất..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus={false}
                    />
                </View>
                <TouchableOpacity>
                    <Text style={styles.moreIcon}>•••</Text>
                </TouchableOpacity>
            </View>

            {/* 2. Gợi ý tìm kiếm (Dropdown) */}
            {searchResults.length > 0 && (
                <View style={styles.searchResultContainer}>
                    {searchResults.map(p => (
                        <TouchableOpacity key={p.id} style={styles.resultItem} onPress={() => openProductModal(p)}>
                            <Text style={styles.resultName}>{p.name}</Text>
                            <Text style={styles.resultPrice}>{p.units[0].price.toLocaleString()}₫</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* 3. Nội dung chính */}
            <View style={styles.content}>
                {/* Dòng trạng thái đơn hàng */}
                <View style={styles.orderStatusRow}>
                    <Text style={styles.productCount}>Sản phẩm ({cart.length})</Text>
                    <Text style={styles.orderType}>Đơn bán tại quầy ▼</Text>
                </View>

                {/* LIST GIỎ HÀNG HOẶC MÀN HÌNH CHỜ SCAN */}
                {cart.length === 0 ? (
                    <View style={styles.emptyState}>
                        <TouchableOpacity style={styles.bigScanBtn} onPress={() => setShowScanner(true)}>
                            <View style={styles.scanInner}>
                                <Text style={{ fontSize: 40, color: '#fff' }}>📷</Text>
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.scanHint}>Quét Barcode để thêm sản phẩm</Text>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.outlineBtn}>
                                <Text style={styles.outlineBtnText}>Đơn thuốc điện tử</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.outlineBtn}>
                                <Text style={styles.outlineBtnText}>Cắt liều</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity>
                            <Text style={styles.customerLink}>Nhập thông tin khách hàng</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={cart}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderCartItem}
                        contentContainerStyle={{ padding: 15 }}
                    />
                )}
            </View>

            {/* 4. Footer Thanh Toán */}
            {cart.length > 0 && (
                <View style={styles.footer}>
                    <View style={styles.totalRow}>
                        <Text>Tổng tiền:</Text>
                        <Text style={styles.finalPrice}>
                            {cart.reduce((s, i) => s + i.total, 0).toLocaleString('vi-VN')}₫
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.payBtn}>
                        <Text style={styles.payBtnText}>THANH TOÁN</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Modal Add Item (giữ nguyên) */}
            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{selectedProduct?.name}</Text>
                        {/* Unit Selection */}
                        <View style={{ flexDirection: 'row', gap: 10, marginVertical: 15 }}>
                            {selectedProduct?.units.map((u: any, idx: number) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={[styles.unitBadge, selectedUnit?.name === u.name && styles.unitBadgeActive]}
                                    onPress={() => setSelectedUnit(u)}
                                >
                                    <Text style={{ color: selectedUnit?.name === u.name ? '#0288D1' : '#333' }}>{u.name}</Text>
                                    <Text style={{ fontWeight: 'bold', color: selectedUnit?.name === u.name ? '#0288D1' : '#333' }}>{u.price.toLocaleString()}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {/* Qty */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 20 }}>
                            <TouchableOpacity onPress={() => setQuantity(q => Math.max(1, q - 1))} style={styles.qtyBtn}><Text>-</Text></TouchableOpacity>
                            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{quantity}</Text>
                            <TouchableOpacity onPress={() => setQuantity(q => q + 1)} style={styles.qtyBtn}><Text>+</Text></TouchableOpacity>
                        </View>
                        {/* Button */}
                        <TouchableOpacity style={styles.confirmBtn} onPress={confirmAddToCart}>
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>XÁC NHẬN - {(selectedUnit?.price * quantity)?.toLocaleString()}₫</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                            <Text style={{ color: '#666' }}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <QRScanner visible={showScanner} onClose={() => setShowScanner(false)} onScan={handleScan} />

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        backgroundColor: '#0D47A1',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        gap: 10,
    },
    backIcon: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    moreIcon: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    searchBox: {
        flex: 1,
        backgroundColor: '#fff',
        height: 40,
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    searchInput: { flex: 1, marginLeft: 8 },

    content: { flex: 1, backgroundColor: '#F5F5F5' },
    orderStatusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    productCount: { fontWeight: 'bold' },
    orderType: { color: '#0288D1' },

    emptyState: { alignItems: 'center', marginTop: 80 },
    bigScanBtn: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FFB300', // Yellow Outer
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        opacity: 0.2
    },
    scanInner: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFB300',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 1 // Full opacity
    },
    scanHint: { fontSize: 16, fontWeight: 'bold', marginBottom: 30 },
    actionButtons: { flexDirection: 'row', gap: 15, marginBottom: 20 },
    outlineBtn: {
        borderWidth: 1,
        borderColor: '#0288D1',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    outlineBtnText: { color: '#0288D1', fontWeight: '500' },
    customerLink: { color: '#0288D1', fontSize: 16 },

    // Cart List
    cartItemRow: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        alignItems: 'center',
    },
    itemName: { fontWeight: 'bold', fontSize: 15 },
    itemUnit: { color: '#666', marginTop: 4 },
    itemTotal: { color: '#0288D1', fontWeight: 'bold' },

    // Search Suggestion
    searchResultContainer: {
        position: 'absolute',
        top: 60, left: 10, right: 10,
        backgroundColor: '#fff',
        zIndex: 100,
        borderRadius: 8,
        elevation: 5,
        shadowColor: '#000', shadowOpacity: 0.1,
    },
    resultItem: {
        flexDirection: 'row', justifyContent: 'space-between',
        padding: 15, borderBottomWidth: 1, borderColor: '#eee'
    },
    resultName: { fontWeight: 'bold' },
    resultPrice: { color: '#0288D1' },

    // Footer
    footer: {
        backgroundColor: '#fff', padding: 15, borderTopWidth: 1, borderColor: '#eee',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
    },
    totalRow: {},
    finalPrice: { fontSize: 18, fontWeight: 'bold', color: '#D32F2F' },
    payBtn: {
        backgroundColor: '#0288D1', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 8
    },
    payBtnText: { color: '#fff', fontWeight: 'bold' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 12 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
    unitBadge: {
        padding: 10, borderWidth: 1, borderColor: '#eee', borderRadius: 8, flex: 1, alignItems: 'center'
    },
    unitBadgeActive: { borderColor: '#0288D1', backgroundColor: '#E1F5FE' },
    qtyBtn: { width: 40, height: 40, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', borderRadius: 20 },
    confirmBtn: { backgroundColor: '#0288D1', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
    cancelBtn: { alignItems: 'center', padding: 10 }
});

export default PosScreen;
