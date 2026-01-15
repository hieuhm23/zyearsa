import React, { useState, useMemo } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, StatusBar, Image, ScrollView, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback
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
    const [activeTab, setActiveTab] = useState<'project' | 'counter'>('counter');

    // --- PRODUCT MODAL STATES ---
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [productModalVisible, setProductModalVisible] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [selectedUnit, setSelectedUnit] = useState<any>(null);

    // --- CHECKOUT STATES ---
    const [checkoutVisible, setCheckoutVisible] = useState(false);
    const [checkoutStep, setCheckoutStep] = useState<'review' | 'customer' | 'payment'>('review');
    const [discountCode, setDiscountCode] = useState('');

    // Customer Info
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerName, setCustomerName] = useState('');

    // Payment Method
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'momo'>('cash');
    const [customerPaid, setCustomerPaid] = useState('');

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
                    total: selectedUnit.price * quantity,
                    origin: selectedProduct.desc || 'Việt Nam',
                    stock: selectedProduct.stock,
                    category: selectedProduct.category
                }];
            }
        });
        setProductModalVisible(false);
    };

    const updateCartItemQuantity = (index: number, newQty: number) => {
        if (newQty < 1) return;
        setCart(prev => {
            const newCart = [...prev];
            newCart[index].quantity = newQty;
            newCart[index].total = newCart[index].price * newQty;
            return newCart;
        });
    };

    const removeCartItem = (index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index));
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

    // --- LOGIC: CHECKOUT ---
    const totalAmount = cart.reduce((s, i) => s + i.total, 0);

    const handleCheckout = () => {
        if (cart.length === 0) {
            Alert.alert('Giỏ hàng trống', 'Vui lòng thêm sản phẩm trước khi thanh toán.');
            return;
        }
        setCheckoutStep('review');
        setCheckoutVisible(true);
    };

    const handleNextStep = () => {
        if (checkoutStep === 'review') {
            setCheckoutStep('customer');
        } else if (checkoutStep === 'customer') {
            setCheckoutStep('payment');
        }
    };

    const handlePrevStep = () => {
        if (checkoutStep === 'payment') {
            setCheckoutStep('customer');
        } else if (checkoutStep === 'customer') {
            setCheckoutStep('review');
        } else {
            setCheckoutVisible(false);
        }
    };

    const handleCompletePayment = () => {
        // TODO: Deduct stock, save order to database
        Alert.alert(
            '🎉 Thanh toán thành công!',
            `Tổng tiền: ${totalAmount.toLocaleString()}đ\nPhương thức: ${paymentMethod === 'cash' ? 'Tiền mặt' : paymentMethod === 'transfer' ? 'Chuyển khoản' : 'Momo'}`,
            [{
                text: 'Đóng', onPress: () => {
                    setCart([]);
                    setCheckoutVisible(false);
                    setCustomerPhone('');
                    setCustomerName('');
                    setCustomerPaid('');
                }
            }]
        );
    };

    // --- HELPER: Get Tag Color ---
    const getTagStyle = (category: string) => {
        switch (category) {
            case 'ks': return { bg: '#E3F2FD', text: '#1976D2', label: 'Thuốc kê toa' };
            case 'gn': return { bg: '#FFF3E0', text: '#E65100', label: 'Giảm đau' };
            case 'tieuhoa': return { bg: '#E8F5E9', text: '#388E3C', label: 'Tiêu hóa' };
            case 'vit': return { bg: '#FCE4EC', text: '#C2185B', label: 'Vitamin' };
            default: return { bg: '#ECEFF1', text: '#546E7A', label: 'Khác' };
        }
    };

    // --- RENDER: Cart Item (New Design) ---
    const renderCartItem = ({ item, index }: { item: any; index: number }) => {
        const tag = getTagStyle(item.category);
        return (
            <View style={styles.productCard}>
                {/* Product Image */}
                <Image source={{ uri: item.image }} style={styles.productImage} resizeMode="contain" />

                {/* Product Info */}
                <View style={styles.productInfo}>
                    {/* Tags */}
                    <View style={styles.tagRow}>
                        <View style={[styles.tag, { backgroundColor: tag.bg }]}>
                            <Text style={[styles.tagText, { color: tag.text }]}>{tag.label}</Text>
                        </View>
                    </View>

                    {/* Name */}
                    <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>

                    {/* Origin */}
                    <View style={styles.originRow}>
                        <Ionicons name="location-outline" size={12} color="#666" />
                        <Text style={styles.originText}>{item.origin}</Text>
                    </View>

                    {/* Price */}
                    <View style={styles.priceRow}>
                        <MaterialCommunityIcons name="sale" size={16} color="#E53935" />
                        <Text style={styles.priceText}>{item.price.toLocaleString()}đ</Text>
                    </View>

                    {/* Actions */}
                    <View style={styles.actionsRow}>
                        <TouchableOpacity style={styles.actionChip}>
                            <Text style={styles.actionChipText}>SP mua kèm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionChip}>
                            <Ionicons name="pricetag-outline" size={12} color="#0288D1" />
                            <Text style={styles.actionChipText}> Chọn khuyến mãi</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quantity & Unit */}
                <View style={styles.quantitySection}>
                    <View style={styles.quantityBox}>
                        <TouchableOpacity onPress={() => updateCartItemQuantity(index, item.quantity - 1)} style={styles.qtyBtn}>
                            <Text style={styles.qtyBtnText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.qtyValue}>{item.quantity}</Text>
                        <TouchableOpacity onPress={() => updateCartItemQuantity(index, item.quantity + 1)} style={styles.qtyBtn}>
                            <Text style={styles.qtyBtnText}>+</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.unitLabel}>{item.unitName}</Text>
                    <Text style={styles.stockText}>Tồn: {item.stock}</Text>
                    <TouchableOpacity onPress={() => removeCartItem(index)} style={styles.removeBtn}>
                        <Ionicons name="trash-outline" size={18} color="#D32F2F" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={[styles.container, { paddingTop: insets.top }]}>
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
                            placeholder="Nhập tên, barcode ho..."
                            placeholderTextColor="#999"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
                    </TouchableOpacity>
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
                                        <Text style={{ fontSize: 13, color: '#2E7D32' }}>Tồn: {item.stock}</Text>
                                    </View>
                                    <Text style={styles.resultPrice}>{item.units[0].price.toLocaleString()}đ</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                )}

                {/* TAB BAR */}
                <View style={styles.tabBar}>
                    <Text style={styles.tabTitle}>Sản phẩm ({cart.length})</Text>
                    <View style={styles.tabButtons}>
                        <TouchableOpacity
                            style={[styles.tabBtn, activeTab === 'project' && styles.tabBtnActive]}
                            onPress={() => setActiveTab('project')}
                        >
                            <View style={[styles.checkbox, activeTab === 'project' && styles.checkboxActive]} />
                            <Text style={styles.tabBtnText}>Dự án</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tabBtn, activeTab === 'counter' && styles.tabBtnActive]}
                            onPress={() => setActiveTab('counter')}
                        >
                            <Text style={[styles.tabBtnText, activeTab === 'counter' && { color: '#0288D1' }]}>Đơn bán tại quầy</Text>
                            <Ionicons name="chevron-down" size={16} color={activeTab === 'counter' ? '#0288D1' : '#666'} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* MAIN CONTENT */}
                <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 220 }}>
                    {cart.length === 0 ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="cart-off" size={60} color="#ccc" />
                            <Text style={styles.emptyText}>Chưa có sản phẩm nào</Text>
                            <Text style={styles.emptyHint}>Quét mã vạch hoặc tìm kiếm để thêm</Text>
                        </View>
                    ) : (
                        cart.map((item, index) => (
                            <View key={index}>{renderCartItem({ item, index })}</View>
                        ))
                    )}
                </ScrollView>

                {/* FLOATING SCAN BUTTON */}
                <TouchableOpacity style={[styles.fabScan, { bottom: 240 + insets.bottom }]} onPress={() => setShowScanner(true)}>
                    <MaterialCommunityIcons name="qrcode-scan" size={28} color="#fff" />
                </TouchableOpacity>

                {/* BOTTOM PANEL */}
                <View style={[styles.bottomPanel, { paddingBottom: insets.bottom + 10 }]}>
                    {/* Quick Actions - Always visible */}
                    <View style={styles.quickActions}>
                        <TouchableOpacity style={styles.quickBtn}>
                            <Ionicons name="document-text-outline" size={16} color="#0288D1" />
                            <Text style={styles.quickBtnText}>Đơn thuốc điện tử</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickBtn}>
                            <MaterialCommunityIcons name="content-cut" size={16} color="#0288D1" />
                            <Text style={styles.quickBtnText}>Cắt liều</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickBtn}>
                            <MaterialCommunityIcons name="tag-text-outline" size={16} color="#0288D1" />
                            <Text style={styles.quickBtnText}>Điều chỉnh giá</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Only show when cart has items */}
                    {cart.length > 0 && (
                        <>
                            {/* Discount Input */}
                            <View style={styles.discountRow}>
                                <Ionicons name="ticket-outline" size={20} color="#999" />
                                <TextInput
                                    style={styles.discountInput}
                                    placeholder="Nhập mã giảm giá"
                                    placeholderTextColor="#999"
                                    value={discountCode}
                                    onChangeText={setDiscountCode}
                                />
                            </View>

                            {/* Summary */}
                            <View style={styles.summarySection}>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Tiết kiệm</Text>
                                    <Text style={styles.summaryValue}>0đ</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Tiền ship</Text>
                                    <Text style={styles.summaryValue}>0đ</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabelBold}>Tạm tính</Text>
                                    <Text style={styles.summaryValueBold}>{totalAmount.toLocaleString()}đ</Text>
                                </View>
                            </View>

                            {/* Checkout Button */}
                            <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
                                <Text style={styles.checkoutBtnText}>Tiếp tục</Text>
                            </TouchableOpacity>

                            {/* Bonus Points */}
                            <Text style={styles.bonusText}>Nhận 300 điểm F-sell</Text>
                        </>
                    )}
                </View>

                {/* ADD PRODUCT MODAL */}
                <Modal visible={productModalVisible} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            {selectedProduct && <Image source={{ uri: selectedProduct.image }} style={styles.modalProductImage} resizeMode="contain" />}
                            <Text style={styles.modalTitle}>{selectedProduct?.name}</Text>
                            <Text style={{ color: '#666', marginBottom: 10 }}>Tồn kho: {selectedProduct?.stock}</Text>

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
                                <TouchableOpacity onPress={() => setQuantity(q => Math.max(1, q - 1))} style={styles.modalQtyBtn}><Ionicons name="remove" size={24} color="#333" /></TouchableOpacity>
                                <Text style={{ fontSize: 24, fontWeight: 'bold', width: 50, textAlign: 'center' }}>{quantity}</Text>
                                <TouchableOpacity onPress={() => setQuantity(q => q + 1)} style={styles.modalQtyBtn}><Ionicons name="add" size={24} color="#333" /></TouchableOpacity>
                            </View>
                            <TouchableOpacity style={styles.confirmBtn} onPress={confirmAddToCart}>
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Thêm vào đơn - {(selectedUnit?.price * quantity)?.toLocaleString()}đ</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setProductModalVisible(false)}>
                                <Text style={{ color: '#666' }}>Đóng</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* CHECKOUT MODAL - 3 STEPS */}
                <Modal visible={checkoutVisible} transparent animationType="slide">
                    <View style={styles.checkoutOverlay}>
                        <View style={styles.checkoutContent}>
                            {/* Header */}
                            <View style={styles.checkoutHeader}>
                                <TouchableOpacity onPress={handlePrevStep}>
                                    <Ionicons name="arrow-back" size={24} color="#333" />
                                </TouchableOpacity>
                                <Text style={styles.checkoutTitle}>
                                    {checkoutStep === 'review' ? 'Xác nhận đơn hàng' : checkoutStep === 'customer' ? 'Thông tin khách hàng' : 'Thanh toán'}
                                </Text>
                                <TouchableOpacity onPress={() => setCheckoutVisible(false)}>
                                    <Ionicons name="close" size={24} color="#333" />
                                </TouchableOpacity>
                            </View>

                            {/* Step Indicator */}
                            <View style={styles.stepIndicator}>
                                <View style={[styles.stepDot, checkoutStep === 'review' && styles.stepDotActive]} />
                                <View style={styles.stepLine} />
                                <View style={[styles.stepDot, checkoutStep === 'customer' && styles.stepDotActive]} />
                                <View style={styles.stepLine} />
                                <View style={[styles.stepDot, checkoutStep === 'payment' && styles.stepDotActive]} />
                            </View>

                            {/* STEP 1: REVIEW */}
                            {checkoutStep === 'review' && (
                                <ScrollView style={{ flex: 1, marginVertical: 15 }}>
                                    {cart.map((item, idx) => (
                                        <View key={idx} style={styles.checkoutItem}>
                                            <Text style={{ flex: 1, fontWeight: 'bold' }}>{item.name}</Text>
                                            <Text style={{ color: '#666' }}>{item.quantity} {item.unitName}</Text>
                                            <Text style={{ fontWeight: 'bold', color: '#D32F2F', marginLeft: 10 }}>{item.total.toLocaleString()}đ</Text>
                                        </View>
                                    ))}
                                    <View style={{ borderTopWidth: 1, borderColor: '#eee', paddingTop: 15, marginTop: 10 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Tổng cộng:</Text>
                                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#D32F2F' }}>{totalAmount.toLocaleString()}đ</Text>
                                        </View>
                                    </View>
                                </ScrollView>
                            )}

                            {/* STEP 2: CUSTOMER INFO */}
                            {checkoutStep === 'customer' && (
                                <View style={{ flex: 1, marginVertical: 15 }}>
                                    <Text style={styles.inputLabel}>Số điện thoại</Text>
                                    <TextInput
                                        style={styles.checkoutInput}
                                        placeholder="Nhập SĐT khách hàng..."
                                        placeholderTextColor="#999"
                                        keyboardType="phone-pad"
                                        value={customerPhone}
                                        onChangeText={setCustomerPhone}
                                    />
                                    <Text style={styles.inputLabel}>Tên khách hàng (tùy chọn)</Text>
                                    <TextInput
                                        style={styles.checkoutInput}
                                        placeholder="Nhập tên..."
                                        placeholderTextColor="#999"
                                        value={customerName}
                                        onChangeText={setCustomerName}
                                    />
                                </View>
                            )}

                            {/* STEP 3: PAYMENT */}
                            {checkoutStep === 'payment' && (
                                <View style={{ flex: 1, marginVertical: 15 }}>
                                    <Text style={styles.inputLabel}>Phương thức thanh toán</Text>
                                    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                                        <TouchableOpacity
                                            style={[styles.paymentOption, paymentMethod === 'cash' && styles.paymentOptionActive]}
                                            onPress={() => setPaymentMethod('cash')}
                                        >
                                            <Ionicons name="cash-outline" size={24} color={paymentMethod === 'cash' ? '#0288D1' : '#666'} />
                                            <Text style={paymentMethod === 'cash' ? { color: '#0288D1', fontWeight: 'bold' } : { color: '#666' }}>Tiền mặt</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.paymentOption, paymentMethod === 'transfer' && styles.paymentOptionActive]}
                                            onPress={() => setPaymentMethod('transfer')}
                                        >
                                            <Ionicons name="card-outline" size={24} color={paymentMethod === 'transfer' ? '#0288D1' : '#666'} />
                                            <Text style={paymentMethod === 'transfer' ? { color: '#0288D1', fontWeight: 'bold' } : { color: '#666' }}>Chuyển khoản</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.paymentOption, paymentMethod === 'momo' && styles.paymentOptionActive]}
                                            onPress={() => setPaymentMethod('momo')}
                                        >
                                            <MaterialCommunityIcons name="wallet-outline" size={24} color={paymentMethod === 'momo' ? '#A50064' : '#666'} />
                                            <Text style={paymentMethod === 'momo' ? { color: '#A50064', fontWeight: 'bold' } : { color: '#666' }}>Momo</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <Text style={styles.inputLabel}>Tiền khách đưa</Text>
                                    <TextInput
                                        style={[styles.checkoutInput, { fontSize: 20, fontWeight: 'bold', color: '#2E7D32' }]}
                                        placeholder="0"
                                        placeholderTextColor="#999"
                                        keyboardType="numeric"
                                        value={customerPaid}
                                        onChangeText={setCustomerPaid}
                                    />

                                    <View style={{ backgroundColor: '#E8F5E9', padding: 15, borderRadius: 10, marginTop: 15 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                            <Text style={{ color: '#666' }}>Tổng tiền:</Text>
                                            <Text style={{ fontWeight: 'bold' }}>{totalAmount.toLocaleString()}đ</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={{ color: '#2E7D32', fontWeight: 'bold' }}>Tiền thừa:</Text>
                                            <Text style={{ fontWeight: 'bold', color: '#2E7D32', fontSize: 18 }}>
                                                {Math.max(0, (parseInt(customerPaid) || 0) - totalAmount).toLocaleString()}đ
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            )}

                            {/* Footer Button */}
                            <TouchableOpacity
                                style={styles.checkoutNextBtn}
                                onPress={checkoutStep === 'payment' ? handleCompletePayment : handleNextStep}
                            >
                                <Text style={styles.checkoutNextBtnText}>
                                    {checkoutStep === 'payment' ? 'Hoàn tất thanh toán' : 'Tiếp tục'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <QRScanner visible={showScanner} onClose={() => setShowScanner(false)} onScan={handleScan} />
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0D47A1' },
    header: {
        backgroundColor: '#0D47A1',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 12,
        gap: 10,
    },
    iconBtn: { padding: 5 },
    searchBox: {
        flex: 1,
        backgroundColor: '#fff',
        height: 42,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#333' },

    // Tab Bar
    tabBar: {
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: '#eee',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    tabTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
    tabButtons: { flexDirection: 'row', gap: 15 },
    tabBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    tabBtnActive: {},
    tabBtnText: { color: '#666', fontSize: 14 },
    checkbox: { width: 16, height: 16, borderRadius: 3, borderWidth: 1.5, borderColor: '#ccc' },
    checkboxActive: { backgroundColor: '#0288D1', borderColor: '#0288D1' },

    // Content
    content: { flex: 1, padding: 10, backgroundColor: '#F5F5F5' },
    emptyState: { alignItems: 'center', marginTop: 60 },
    emptyText: { fontSize: 16, color: '#999', marginTop: 15 },
    emptyHint: { fontSize: 13, color: '#bbb', marginTop: 5 },

    // Product Card
    productCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        flexDirection: 'row',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    productImage: { width: 70, height: 70, borderRadius: 8, backgroundColor: '#f5f5f5' },
    productInfo: { flex: 1, marginLeft: 12 },
    tagRow: { flexDirection: 'row', marginBottom: 4 },
    tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
    tagText: { fontSize: 11, fontWeight: '600' },
    productName: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 4 },
    originRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    originText: { fontSize: 12, color: '#666', marginLeft: 4 },
    priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    priceText: { fontSize: 15, fontWeight: 'bold', color: '#E53935', marginLeft: 4 },
    actionsRow: { flexDirection: 'row', gap: 8 },
    actionChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 15 },
    actionChipText: { fontSize: 11, color: '#0288D1' },

    // Quantity Section
    quantitySection: { alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
    quantityBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#0288D1', borderRadius: 6, overflow: 'hidden' },
    qtyBtn: { width: 28, height: 28, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E3F2FD' },
    qtyBtnText: { fontSize: 18, color: '#0288D1', fontWeight: 'bold' },
    qtyValue: { width: 30, textAlign: 'center', fontSize: 14, fontWeight: 'bold' },
    unitLabel: { fontSize: 12, color: '#0288D1', marginTop: 4, fontWeight: '500' },
    stockText: { fontSize: 11, color: '#999', marginTop: 2 },
    removeBtn: { marginTop: 8 },

    // FAB Scan
    fabScan: {
        position: 'absolute',
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FFB300',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },

    // Bottom Panel
    bottomPanel: {
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingTop: 12,
        borderTopWidth: 1,
        borderColor: '#eee',
        elevation: 10,
    },
    quickActions: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    quickBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 20 },
    quickBtnText: { fontSize: 12, color: '#333' },
    discountRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 8, paddingHorizontal: 12, marginBottom: 12 },
    discountInput: { flex: 1, height: 40, marginLeft: 8, fontSize: 14 },
    summarySection: { marginBottom: 12 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    summaryLabel: { fontSize: 13, color: '#666' },
    summaryValue: { fontSize: 13, color: '#333' },
    summaryLabelBold: { fontSize: 15, fontWeight: 'bold', color: '#333' },
    summaryValueBold: { fontSize: 16, fontWeight: 'bold', color: '#D32F2F' },
    checkoutBtn: { backgroundColor: '#0288D1', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
    checkoutBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    bonusText: { textAlign: 'center', fontSize: 12, color: '#FFB300', marginTop: 8 },

    // Search Results
    searchResultContainer: {
        position: 'absolute', top: 70, left: 15, right: 15, backgroundColor: '#fff', zIndex: 100, borderRadius: 12, elevation: 10, maxHeight: 300
    },
    resultItem: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderColor: '#f0f0f0', alignItems: 'center' },
    resultImage: { width: 40, height: 40, borderRadius: 6, backgroundColor: '#eee', marginRight: 10 },
    resultName: { fontWeight: 'bold', fontSize: 15, color: '#333' },
    resultPrice: { color: '#0288D1', fontWeight: '600' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', padding: 25, borderRadius: 20, alignItems: 'center' },
    modalProductImage: { width: 100, height: 100, marginBottom: 15 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
    unitBadge: { paddingVertical: 10, paddingHorizontal: 15, borderWidth: 1, borderColor: '#eee', borderRadius: 10, flex: 1, alignItems: 'center' },
    unitBadgeActive: { borderColor: '#0288D1', backgroundColor: '#E1F5FE' },
    modalQtyBtn: { width: 50, height: 50, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', borderRadius: 25 },
    confirmBtn: { backgroundColor: '#0288D1', paddingVertical: 15, width: '100%', borderRadius: 12, alignItems: 'center', marginBottom: 15 },
    cancelBtn: { padding: 10 },

    // Checkout Modal
    checkoutOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    checkoutContent: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, minHeight: '60%', maxHeight: '90%' },
    checkoutHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    checkoutTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
    stepDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#E0E0E0' },
    stepDotActive: { backgroundColor: '#0288D1', width: 16, height: 16, borderRadius: 8 },
    stepLine: { width: 40, height: 2, backgroundColor: '#E0E0E0', marginHorizontal: 5 },
    checkoutItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f0f0f0' },
    inputLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 15 },
    checkoutInput: { backgroundColor: '#F5F5F5', padding: 15, borderRadius: 10, fontSize: 16, borderWidth: 1, borderColor: '#E0E0E0' },
    paymentOption: { flex: 1, alignItems: 'center', padding: 15, borderRadius: 12, borderWidth: 2, borderColor: '#E0E0E0', gap: 5 },
    paymentOptionActive: { borderColor: '#0288D1', backgroundColor: '#E3F2FD' },
    checkoutNextBtn: { backgroundColor: '#0288D1', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 15 },
    checkoutNextBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default PosScreen;
