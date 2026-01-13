import React, { useState, useMemo } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, StatusBar, Image, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { PRODUCTS } from '../data/mockData';
import QRScanner from '../components/QRScanner';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

const PosScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();

    // --- MAIN STATES ---
    const [cart, setCart] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showScanner, setShowScanner] = useState(false);

    // --- PRODUCT MODAL STATES ---
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [productModalVisible, setProductModalVisible] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [selectedUnit, setSelectedUnit] = useState<any>(null);

    // --- CHECKOUT STATES ---
    const [checkoutVisible, setCheckoutVisible] = useState(false);
    const [checkoutStep, setCheckoutStep] = useState(1); // 1: Review, 2: Customer, 3: Payment
    const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'card'>('cash');
    const [cashGiven, setCashGiven] = useState(''); // Tiền khách đưa

    // --- LOGIC: SEARCH ---
    const searchResults = useMemo(() => {
        if (!searchQuery) return [];
        return PRODUCTS.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.includes(searchQuery));
    }, [searchQuery]);

    // --- LOGIC: ADD TO CART ---
    const openProductModal = (product: any) => {
        setSelectedProduct(product);
        setSelectedUnit(product.units[0]);
        setQuantity(1);
        setProductModalVisible(true);
        setSearchQuery('');
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
                    image: selectedProduct.image,
                    unitName: selectedUnit.name,
                    price: selectedUnit.price,
                    quantity: quantity,
                    total: selectedUnit.price * quantity
                }];
            }
        });
        setProductModalVisible(false);
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

    // --- LOGIC: CHECKOUT FLOW ---
    const totalAmount = cart.reduce((s, i) => s + i.total, 0);

    const startCheckout = () => {
        setCheckoutStep(1);
        setCustomerInfo({ name: '', phone: '' });
        setPaymentMethod('cash');
        setCashGiven('');
        setCheckoutVisible(true);
    };

    const handleFinalPayment = () => {
        // 1. Thực hiện trừ kho (Core Logic)
        cart.forEach(cartItem => {
            const productIndex = PRODUCTS.findIndex(p => p.id === cartItem.id);
            if (productIndex > -1) {
                const product = PRODUCTS[productIndex];

                // Tìm tỉ lệ quy đổi của đơn vị khách mua (VD: Hộp = bao nhiêu viên?)
                // Giả định đơn vị đầu tiên trong mảng units là đơn vị cơ sở (Viên) - giá thấp nhất
                // Hoặc dựa vào logic giá: lấy giá đơn vị mua chia cho giá đơn vị nhỏ nhất

                const baseUnit = product.units[0]; // Đơn vị nhỏ nhất (Viên)

                let conversionFactor = 1;
                // Logic quy đổi đơn giản dựa trên giá (Tạm thời): Giá mua / Giá viên
                if (baseUnit.price > 0) {
                    conversionFactor = Math.round(cartItem.price / baseUnit.price);
                }

                // Nếu conversionFactor < 1 (lỗi), mặc định là 1 (trường hợp mua viên)
                if (conversionFactor < 1) conversionFactor = 1;

                // Tổng số lượng viên cần trừ
                const totalDeduct = cartItem.quantity * conversionFactor;

                // Trừ kho
                PRODUCTS[productIndex].stock -= totalDeduct;

                console.log(`Đã bán ${cartItem.quantity} ${cartItem.unitName} ${product.name}. Trừ kho: ${totalDeduct} đơn vị cơ sở. Tồn còn: ${PRODUCTS[productIndex].stock}`);
            }
        });

        Alert.alert('Thành công', 'Đã thanh toán và TRỪ KHO thành công!', [
            {
                text: 'OK', onPress: () => {
                    setCheckoutVisible(false);
                    setCart([]);
                    setCheckoutStep(1);
                }
            }
        ]);
    };

    // --- RENDERERS ---
    const renderCartItem = ({ item }: { item: any }) => (
        <View style={styles.cartItemRow}>
            <Image source={{ uri: item.image }} style={styles.cartItemImage} resizeMode="cover" />
            <View style={{ flex: 1 }}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.itemUnit}>{item.quantity} {item.unitName} x {item.price.toLocaleString('vi-VN')}</Text>
            </View>
            <Text style={styles.itemTotal}>{item.total.toLocaleString('vi-VN')}₫</Text>
            <TouchableOpacity onPress={() => setCart(prev => prev.filter(i => i !== item))} style={styles.removeBtn}>
                <Ionicons name="close-circle" size={24} color="#D32F2F" />
            </TouchableOpacity>
        </View>
    );

    // --- CHECKOUT MODAL CONTENT ---
    const renderCheckoutContent = () => {
        switch (checkoutStep) {
            case 1: // Review Order
                return (
                    <View style={{ flex: 1 }}>
                        <Text style={styles.stepTitle}>Bước 1: Xác nhận đơn hàng</Text>
                        <ScrollView style={styles.reviewList}>
                            {cart.map((item, index) => (
                                <View key={index} style={styles.reviewItem}>
                                    <Text style={{ flex: 1, fontWeight: '500' }} numberOfLines={1}>{index + 1}. {item.name}</Text>
                                    <Text style={{ width: 80, textAlign: 'right' }}>{item.quantity} {item.unitName}</Text>
                                    <Text style={{ width: 100, textAlign: 'right', fontWeight: 'bold' }}>{item.total.toLocaleString()}₫</Text>
                                </View>
                            ))}
                        </ScrollView>
                        <View style={styles.totalBlock}>
                            <Text style={styles.totalLabel}>Tổng cộng:</Text>
                            <Text style={styles.totalValue}>{totalAmount.toLocaleString()}₫</Text>
                        </View>
                        <TouchableOpacity style={styles.nextBtn} onPress={() => setCheckoutStep(2)}>
                            <Text style={styles.nextBtnText}>TIẾP TỤC (NHẬP KHÁCH HÀNG)</Text>
                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                );
            case 2: // Customer Info
                return (
                    <View style={{ flex: 1 }}>
                        <Text style={styles.stepTitle}>Bước 2: Thông tin khách hàng</Text>
                        <View style={styles.formContainer}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Số điện thoại</Text>
                                <TextInput
                                    style={styles.inputField}
                                    placeholder="09..."
                                    keyboardType="phone-pad"
                                    value={customerInfo.phone}
                                    onChangeText={(t) => setCustomerInfo({ ...customerInfo, phone: t })}
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Tên khách hàng</Text>
                                <TextInput
                                    style={styles.inputField}
                                    placeholder="Nguyễn Văn A"
                                    value={customerInfo.name}
                                    onChangeText={(t) => setCustomerInfo({ ...customerInfo, name: t })}
                                />
                            </View>

                            <TouchableOpacity style={styles.guestBtn} onPress={() => setCustomerInfo({ name: 'Khách lẻ', phone: '' })}>
                                <Text style={styles.guestBtnText}>Sử dụng "Khách lẻ"</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.navRow}>
                            <TouchableOpacity style={styles.backBtn} onPress={() => setCheckoutStep(1)}>
                                <Text style={{ color: '#666' }}>Quay lại</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.nextBtn} onPress={() => setCheckoutStep(3)}>
                                <Text style={styles.nextBtnText}>TIẾP TỤC (THANH TOÁN)</Text>
                                <Ionicons name="arrow-forward" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            case 3: // Payment
                const cash = parseInt(cashGiven) || 0;
                const change = cash - totalAmount;
                return (
                    <View style={{ flex: 1 }}>
                        <Text style={styles.stepTitle}>Bước 3: Thanh toán</Text>

                        <View style={styles.paymentMethods}>
                            <TouchableOpacity
                                style={[styles.methodItem, paymentMethod === 'cash' && styles.methodActive]}
                                onPress={() => setPaymentMethod('cash')}
                            >
                                <MaterialCommunityIcons name="cash" size={24} color={paymentMethod === 'cash' ? '#0288D1' : '#666'} />
                                <Text style={[styles.methodText, paymentMethod === 'cash' && { color: '#0288D1' }]}>Tiền mặt</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.methodItem, paymentMethod === 'transfer' && styles.methodActive]}
                                onPress={() => setPaymentMethod('transfer')}
                            >
                                <MaterialCommunityIcons name="qrcode-scan" size={24} color={paymentMethod === 'transfer' ? '#0288D1' : '#666'} />
                                <Text style={[styles.methodText, paymentMethod === 'transfer' && { color: '#0288D1' }]}>Chuyển khoản</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.methodItem, paymentMethod === 'card' && styles.methodActive]}
                                onPress={() => setPaymentMethod('card')}
                            >
                                <FontAwesome5 name="credit-card" size={22} color={paymentMethod === 'card' ? '#0288D1' : '#666'} />
                                <Text style={[styles.methodText, paymentMethod === 'card' && { color: '#0288D1' }]}>Quẹt thẻ</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.paymentSummary}>
                            <View style={styles.summaryRow}>
                                <Text>Khách hàng:</Text>
                                <Text style={{ fontWeight: 'bold' }}>{customerInfo.name || 'Khách lẻ'}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>TỔNG TIỀN:</Text>
                                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#D32F2F' }}>{totalAmount.toLocaleString()}₫</Text>
                            </View>

                            {paymentMethod === 'cash' && (
                                <View style={styles.cashBlock}>
                                    <TextInput
                                        style={styles.cashInput}
                                        placeholder="Tiền khách đưa"
                                        keyboardType="numeric"
                                        value={cashGiven}
                                        onChangeText={setCashGiven}
                                    />
                                    <View style={styles.changeRow}>
                                        <Text>Tiền thừa:</Text>
                                        <Text style={{ fontWeight: 'bold', color: change >= 0 ? 'green' : 'red' }}>
                                            {change > 0 ? change.toLocaleString() : '0'}₫
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>

                        <View style={styles.navRow}>
                            <TouchableOpacity style={styles.backBtn} onPress={() => setCheckoutStep(2)}>
                                <Text style={{ color: '#666' }}>Quay lại</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.finishBtn} onPress={handleFinalPayment}>
                                <Text style={styles.finishBtnText}>HOÀN TẤT & IN HÓA ĐƠN</Text>
                                <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginLeft: 5 }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                );
        }
    };

    // --- HELPER: FORMAT STOCK DISPLAY ---
    const getStockDisplay = (product: any) => {
        // Tìm đơn vị lớn nhất (Hộp) và nhỏ nhất (Viên)
        const baseUnit = product.units[0]; // Nhỏ nhất (giá thấp nhất)
        const bigUnit = product.units.length > 1 ? product.units[product.units.length - 1] : baseUnit; // Lớn nhất

        const conversion = Math.round(bigUnit.price / (baseUnit.price || 1)); // Tỉ lệ 1 Hộp = ? Viên

        if (conversion > 1) {
            const boxes = Math.floor(product.stock / conversion);
            const remainder = product.stock % conversion;

            if (boxes > 0) {
                return `${boxes} ${bigUnit.name}${remainder > 0 ? ` + ${remainder} ${baseUnit.name} lẻ` : ''}`;
            } else {
                return `${product.stock} ${baseUnit.name} (Lẻ)`; // Chưa đủ 1 hộp
            }
        }

        return `${product.stock} ${baseUnit.name}`;
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            {/* ... (Giữ nguyên Header) ... */}
            <StatusBar barStyle="light-content" backgroundColor="#0D47A1" />

            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={20} color="#999" style={{ marginLeft: 10 }} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm sản phẩm..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus={false}
                    />
                </View>
            </View>

            {/* SEARCH RESULTS OVERLAY */}
            {searchResults.length > 0 && (
                <View style={styles.searchResultContainer}>
                    <FlatList
                        data={searchResults}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.resultItem} onPress={() => openProductModal(item)}>
                                <Image source={{ uri: item.image }} style={styles.resultImage} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.resultName}>{item.name}</Text>
                                    {/* NEW: HIỂN THỊ TỒN KHO CHI TIẾT */}
                                    <Text style={{ fontSize: 13, color: '#2E7D32', fontWeight: '500' }}>
                                        📦 Kho: {getStockDisplay(item)}
                                    </Text>
                                </View>
                                <Text style={styles.resultPrice}>{item.units[0].price.toLocaleString()}₫</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}

            {/* MAIN CONTENT */}
            <View style={styles.content}>
                <View style={styles.orderStatusRow}>
                    <Text style={styles.productCount}>Sản phẩm ({cart.length})</Text>
                    <TouchableOpacity onPress={() => setShowScanner(true)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialCommunityIcons name="plus-circle" size={20} color="#0288D1" />
                        <Text style={[styles.orderType, { marginLeft: 5 }]}>Thêm món</Text>
                    </TouchableOpacity>
                </View>

                {cart.length === 0 ? (
                    <View style={styles.emptyState}>
                        <TouchableOpacity style={styles.bigScanBtn} onPress={() => setShowScanner(true)}>
                            <View style={styles.scanInner}>
                                <MaterialCommunityIcons name="barcode-scan" size={40} color="#fff" />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.scanHint}>Quét mã vạch</Text>
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

            {/* FOOTER */}
            {cart.length > 0 && (
                <View style={styles.footer}>
                    <View style={styles.totalRow}>
                        <Text style={{ color: '#666', fontSize: 12 }}>Tổng thanh toán</Text>
                        <Text style={styles.finalPrice}>{totalAmount.toLocaleString('vi-VN')}₫</Text>
                    </View>
                    <TouchableOpacity style={styles.payBtn} onPress={startCheckout}>
                        <Text style={styles.payBtnText}>THANH TOÁN</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* ADD PRODUCT MODAL */}
            <Modal visible={productModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedProduct && <Image source={{ uri: selectedProduct.image }} style={styles.modalProductImage} resizeMode="contain" />}
                        <Text style={styles.modalTitle}>{selectedProduct?.name}</Text>

                        {/* UPDATE: Hien thi ten ton kho trong modal */}
                        {selectedProduct && (
                            <Text style={{ color: '#666', marginBottom: 10 }}>
                                Tồn kho hiện tại: <Text style={{ fontWeight: 'bold', color: '#2E7D32' }}>{getStockDisplay(selectedProduct)}</Text>
                            </Text>
                        )}

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
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 20 }}>
                            <TouchableOpacity onPress={() => setQuantity(q => Math.max(1, q - 1))} style={styles.qtyBtn}><Ionicons name="remove" size={24} color="#333" /></TouchableOpacity>
                            <Text style={{ fontSize: 24, fontWeight: 'bold', width: 50, textAlign: 'center' }}>{quantity}</Text>
                            <TouchableOpacity onPress={() => setQuantity(q => q + 1)} style={styles.qtyBtn}><Ionicons name="add" size={24} color="#333" /></TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.confirmBtn} onPress={confirmAddToCart}>
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Thêm vào đơn - {(selectedUnit?.price * quantity)?.toLocaleString()}₫</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setProductModalVisible(false)}>
                            <Text style={{ color: '#666' }}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* CHECKOUT FLOW MODAL */}
            <Modal visible={checkoutVisible} animationType="slide">
                <SafeAreaViewWrapper>
                    <View style={styles.checkoutContainer}>
                        <View style={styles.checkoutHeader}>
                            <Text style={styles.checkoutTitle}>Thanh toán đơn hàng</Text>
                            <TouchableOpacity onPress={() => setCheckoutVisible(false)}>
                                <Ionicons name="close" size={28} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {/* Step Indicator */}
                        <View style={styles.stepIndicator}>
                            <View style={[styles.stepDot, checkoutStep >= 1 && styles.stepActive]} />
                            <View style={styles.stepLine} />
                            <View style={[styles.stepDot, checkoutStep >= 2 && styles.stepActive]} />
                            <View style={styles.stepLine} />
                            <View style={[styles.stepDot, checkoutStep >= 3 && styles.stepActive]} />
                        </View>

                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={{ flex: 1 }}
                        >
                            <View style={styles.checkoutBody}>
                                {renderCheckoutContent()}
                            </View>
                        </KeyboardAvoidingView>
                    </View>
                </SafeAreaViewWrapper>
            </Modal>

            <QRScanner visible={showScanner} onClose={() => setShowScanner(false)} onScan={handleScan} />

        </View>
    );
};

// Helper Wrapper for Checkout Modal
const SafeAreaViewWrapper = ({ children }: any) => {
    const insets = useSafeAreaInsets();
    return <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: '#fff' }}>{children}</View>
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0D47A1' },
    header: {
        backgroundColor: '#0D47A1',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingBottom: 15,
        gap: 10,
    },
    iconBtn: { padding: 5 },
    searchBox: {
        flex: 1,
        backgroundColor: '#fff',
        height: 40,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#333' },
    content: { flex: 1, backgroundColor: '#F5F5F5', borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },
    orderStatusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    productCount: { fontWeight: 'bold', fontSize: 15 },
    orderType: { color: '#0288D1', fontWeight: '600' },
    emptyState: { alignItems: 'center', marginTop: 80 },
    bigScanBtn: {
        width: 120, height: 120, borderRadius: 60,
        backgroundColor: 'rgba(255, 179, 0, 0.2)',
        justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    },
    scanInner: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: '#FFB300', justifyContent: 'center', alignItems: 'center',
    },
    scanHint: { fontSize: 16, fontWeight: 'bold', color: '#555' },

    // Cart Item
    cartItemRow: {
        flexDirection: 'row', backgroundColor: '#fff', padding: 10, borderRadius: 12, marginBottom: 10, alignItems: 'center', elevation: 2
    },
    cartItemImage: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#f0f0f0', marginRight: 10 },
    itemName: { fontWeight: 'bold', fontSize: 15, color: '#333', marginBottom: 4 },
    itemUnit: { color: '#666', fontSize: 13 },
    itemTotal: { color: '#0288D1', fontWeight: 'bold', fontSize: 15, marginRight: 10 },
    removeBtn: { padding: 5 },

    // Footer
    footer: {
        backgroundColor: '#fff', padding: 15, borderTopWidth: 1, borderColor: '#eee',
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        elevation: 5
    },
    totalRow: {},
    finalPrice: { fontSize: 20, fontWeight: 'bold', color: '#D32F2F' },
    payBtn: {
        backgroundColor: '#0288D1', paddingHorizontal: 25, paddingVertical: 14, borderRadius: 12, elevation: 2
    },
    payBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

    // Search Result
    searchResultContainer: {
        position: 'absolute', top: 60, left: 15, right: 15, backgroundColor: '#fff', zIndex: 100, borderRadius: 12, elevation: 10, maxHeight: 300
    },
    resultItem: {
        flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderColor: '#f0f0f0', alignItems: 'center'
    },
    resultImage: { width: 40, height: 40, borderRadius: 6, backgroundColor: '#eee', marginRight: 10 },
    resultName: { fontWeight: 'bold', fontSize: 15, color: '#333' },
    resultPrice: { color: '#0288D1', fontWeight: '600' },

    // Add Product Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', padding: 25, borderRadius: 20, alignItems: 'center' },
    modalProductImage: { width: 100, height: 100, marginBottom: 15 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
    unitBadge: { paddingVertical: 10, paddingHorizontal: 15, borderWidth: 1, borderColor: '#eee', borderRadius: 10, flex: 1, alignItems: 'center' },
    unitBadgeActive: { borderColor: '#0288D1', backgroundColor: '#E1F5FE' },
    qtyBtn: { width: 50, height: 50, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', borderRadius: 25 },
    confirmBtn: { backgroundColor: '#0288D1', paddingVertical: 15, width: '100%', borderRadius: 12, alignItems: 'center', marginBottom: 15 },
    cancelBtn: { padding: 10 },

    // CHECKOUT STYLES
    checkoutContainer: { flex: 1, backgroundColor: '#fff' },
    checkoutHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: '#eee' },
    checkoutTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    stepIndicator: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 20 },
    stepDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#ddd' },
    stepLine: { width: 40, height: 2, backgroundColor: '#ddd', marginHorizontal: 5 },
    stepActive: { backgroundColor: '#0288D1' },
    checkoutBody: { flex: 1, padding: 20 },
    stepTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#0288D1' },

    reviewList: { flex: 1, marginBottom: 20 },
    reviewItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderColor: '#f0f0f0' },
    totalBlock: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderTopWidth: 2, borderColor: '#eee' },
    totalLabel: { fontSize: 16, fontWeight: 'bold' },
    totalValue: { fontSize: 22, fontWeight: 'bold', color: '#D32F2F' },

    // Form Customer
    formContainer: { flex: 1 },
    inputGroup: { marginBottom: 20 },
    inputLabel: { fontWeight: 'bold', marginBottom: 8, color: '#666' },
    inputField: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 16 },
    guestBtn: { padding: 15, alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 10 },
    guestBtnText: { color: '#0288D1', fontWeight: 'bold' },

    // Payment Methods
    paymentMethods: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    methodItem: { width: '31%', alignItems: 'center', padding: 15, borderWidth: 1, borderColor: '#ddd', borderRadius: 10 },
    methodActive: { borderColor: '#0288D1', backgroundColor: '#E1F5FE' },
    methodText: { marginTop: 8, fontWeight: 'bold', fontSize: 12, color: '#666' },
    paymentSummary: { flex: 1 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    cashBlock: { marginTop: 20, padding: 15, backgroundColor: '#F9F9F9', borderRadius: 10 },
    cashInput: { borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff', padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 10 },
    changeRow: { flexDirection: 'row', justifyContent: 'space-between' },

    // Nav Buttons
    navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    backBtn: { padding: 15 },
    nextBtn: { backgroundColor: '#0288D1', flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 25, borderRadius: 10 },
    nextBtnText: { color: '#fff', fontWeight: 'bold', marginRight: 10 },
    finishBtn: { backgroundColor: '#388E3C', flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 25, borderRadius: 10, flex: 1, justifyContent: 'center', marginLeft: 15 },
    finishBtnText: { color: '#fff', fontWeight: 'bold' }
});

export default PosScreen;
