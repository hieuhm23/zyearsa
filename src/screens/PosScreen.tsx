import React, { useState, useMemo, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, StatusBar, Image, ScrollView, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Linking, DeviceEventEmitter, Vibration
} from 'react-native';
import { PRODUCTS } from '../data/mockData';
import QRScanner from '../components/QRScanner';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { getPendingDoseCombo } from '../utils/DoseState';

const DOSE_SAMPLES = [
    {
        id: 'D01', name: 'Combo Cảm Cúm (Người lớn)', type: 'adult', desc: '3 ngày thuốc (Sáng - Tối)', items: [
            { id: 'T001', name: 'Panadol Extra', unit: 'Viên', qty: 6 },
            { id: 'T003', name: 'Vitamin C', unit: 'Viên', qty: 3 },
            { id: 'T005', name: 'Loratadin', unit: 'Viên', qty: 3 },
        ]
    },
    {
        id: 'D02', name: 'Đau Dạ Dày Cấp (Người lớn)', type: 'adult', desc: 'Cắt cơn đau nhanh', items: [
            { id: 'T006', name: 'Gaviscon', unit: 'Gói', qty: 2 },
            { id: 'T007', name: 'Omeprazol', unit: 'Viên', qty: 2 },
        ]
    },
    {
        id: 'D03', name: 'Hạ Sốt (Trẻ em)', type: 'child', desc: 'Cho bé 10-15kg', items: [
            { id: 'T008', name: 'Hapacol 250', unit: 'Gói', qty: 3 },
            { id: 'T009', name: 'Oresol Cam', unit: 'Gói', qty: 1 },
        ]
    },
    {
        id: 'D04', name: 'Ho Khan / Sổ Mũi (Bé)', type: 'child', desc: 'Siro thảo dược', items: [
            { id: 'T010', name: 'Siro Ho Prospan', unit: 'Chai', qty: 1 },
            { id: 'T005', name: 'Loratadin 5mg', unit: 'Viên', qty: 2 },
        ]
    }
];

const PosScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const route = useRoute<any>();

    // --- MAIN STATES ---
    const [cart, setCart] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showScanner, setShowScanner] = useState(false);
    const [activeTab, setActiveTab] = useState<'project' | 'counter'>('counter');

    // --- DOSE COMBO STATES ---
    const [expandedCombos, setExpandedCombos] = useState<string[]>([]);
    const [showQRModal, setShowQRModal] = useState(false);

    // --- Handle Dose Combo (Global State Check on Focus) ---
    useFocusEffect(
        React.useCallback(() => {
            const checkDoseState = () => {
                try {
                    const { getPendingDoseCombo } = require('../utils/DoseState');
                    const combo = getPendingDoseCombo();

                    if (combo) {
                        console.log('Got pending dose combo on focus');

                        // SANITIZE DATA: Create a fresh new object with only primitive types
                        // This removes any hidden dangerous references from the original object
                        const safeItems = (combo.items || []).map((item: any) => ({
                            id: String(item.id || Math.random()),
                            name: String(item.name || 'Thuốc'),
                            unit: String(item.unit || item.unitName || 'Đơn vị'),
                            price: Number(item.price) || 0,
                            quantity: Number(item.quantity) || 1
                        }));

                        const safeCombo = {
                            isCombo: true,
                            comboId: String(combo.comboId || Date.now()),
                            comboName: String(combo.comboName || 'Combo thuốc'),
                            ageGroup: String(combo.ageGroup || ''),
                            doseCount: Number(combo.doseCount) || 1,
                            items: safeItems,
                            totalPrice: Number(combo.totalPrice || 0),
                            // Dummy fields to satisfy Typescript/Render logic
                            id: String(combo.comboId || Date.now()),
                            name: String(combo.comboName || 'Combo thuốc'),
                            unitName: 'Liều',
                            price: Number(combo.totalPrice || 0),
                            quantity: 1,
                            total: Number(combo.totalPrice || 0),
                            origin: 'Cắt liều',
                            category: 'combo'
                        };

                        setCart(prev => [...prev, safeCombo]);
                        console.log('Added SAFE COMBO to cart');
                    }
                } catch (e) {
                    console.error('Error checking dose state:', e);
                }
            };

            // Small delay to ensure navigation settled
            const timer = setTimeout(checkDoseState, 200);
            return () => clearTimeout(timer);
        }, [])
    );

    // --- PRODUCT MODAL STATES ---
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [productModalVisible, setProductModalVisible] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [selectedUnit, setSelectedUnit] = useState<any>(null);
    const [editingCartItemIndex, setEditingCartItemIndex] = useState<number | null>(null); // For switching units in cart
    const [detailModalVisible, setDetailModalVisible] = useState(false); // New Detail Screen Modal
    const [editingDetailIndex, setEditingDetailIndex] = useState<number | null>(null);

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

    // --- COMPUTED: Safe Total Amount ---
    const totalAmount = useMemo(() => {
        try {
            return cart.reduce((sum, item) => {
                let itemTotal = 0;
                if (item.isCombo) {
                    itemTotal = Number(item.totalPrice) || 0;
                } else {
                    itemTotal = Number(item.total) || 0;
                }
                return sum + itemTotal;
            }, 0);
        } catch (e) {
            console.error('Error calculating total:', e);
            return 0;
        }
    }, [cart]);

    // --- LOGIC: SEARCH ---
    const searchResults = useMemo(() => {
        if (!searchQuery) return [];
        return PRODUCTS.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.includes(searchQuery));
    }, [searchQuery]);

    // --- HELPER: Calculate stock breakdown by unit ---
    const getStockBreakdown = (product: any) => {
        const baseStock = product.stock; // Total smallest units (e.g., viên)
        const units = product.units;
        if (!units || units.length === 0) return `Tồn: ${baseStock}`;

        // Parse unit quantities from names like "Vỉ (12v)", "Hộp (10 vỉ)"
        // Result: [{name: 'Viên', qty: 1}, {name: 'Vỉ', qty: 12}, {name: 'Hộp', qty: 10}]
        const unitInfo = units.map((u: any) => {
            const match = u.name.match(/\((\d+)/);
            return {
                name: u.name.split(' (')[0],
                qtyPerUnit: match ? parseInt(match[1]) : 1 // How many of previous unit in this unit
            };
        });

        // Calculate stock for each unit
        // Viên: 2400, Vỉ: 2400/12=200, Hộp: 2400/(12*10)=20
        let divisor = 1;
        const stockByUnit = unitInfo.map((u: any, idx: number) => {
            if (idx > 0) {
                divisor *= unitInfo[idx].qtyPerUnit; // Multiply by how many smaller units in this unit
            }
            const qty = Math.floor(baseStock / divisor);
            return { name: u.name, qty };
        });

        // Format: "Tồn: 2400 Viên (200 Vỉ / 20 Hộp)"
        if (stockByUnit.length === 1) {
            return `Tồn: ${stockByUnit[0].qty} ${stockByUnit[0].name}`;
        }

        const primary = `${stockByUnit[0].qty} ${stockByUnit[0].name}`;
        const others = stockByUnit.slice(1).map((s: any) => `${s.qty} ${s.name}`).join(' / ');
        return `Tồn: ${primary} (${others})`;
    };

    // --- LOGIC: ADD TO CART ---
    // --- LOGIC: ADD TO CART ---
    const openDetailModal = (product: any, cartIndex: number | null = null, currentUnit: any = null, currentQty: number = 1) => {
        setSelectedProduct(product);
        setSelectedUnit(currentUnit || product.units[0]);
        setQuantity(currentQty);
        setEditingDetailIndex(cartIndex); // Use new state
        setDetailModalVisible(true);
        setSearchQuery('');
    };

    const openProductModal = (product: any, specificUnit: any = null) => {
        setSelectedProduct(product);
        setSelectedUnit(specificUnit || product.units[0]);
        setQuantity(1);
        setProductModalVisible(true);
        setSearchQuery('');
    };

    // Dose Modal State
    const [doseModalVisible, setDoseModalVisible] = useState(false);
    const [doseTarget, setDoseTarget] = useState<'adult' | 'child'>('adult');

    const handleAddDose = (dose: any) => {
        let addedCount = 0;
        dose.items.forEach((item: any) => {
            const productInfo = PRODUCTS.find(p => p.id === item.id);
            if (productInfo) {
                const unitObj = productInfo.units.find(u => u.name === item.unit) || productInfo.units[0];
                addDirectToCart(productInfo, unitObj, item.qty, true); // Silent add
                addedCount++;
            }
        });

        if (addedCount > 0) {
            Alert.alert('Thành công', `Đã thêm combo "${dose.name}" vào giỏ hàng.`);
            setDoseModalVisible(false);
        } else {
            Alert.alert('Lỗi', 'Không tìm thấy thông tin thuốc trong kho.');
        }
    };

    const confirmAddToCart = () => {
        Vibration.vibrate(10);
        if (!selectedProduct || !selectedUnit) return;
        const maxStock = selectedProduct.stock || 999;

        setCart(prev => {
            let newCart = [...prev];

            // If editing mode, remove the old item first (simulate "replace")
            if (editingDetailIndex !== null && editingDetailIndex >= 0 && editingDetailIndex < newCart.length) {
                newCart.splice(editingDetailIndex, 1);
            }

            const existingIndex = newCart.findIndex(item => item.id === selectedProduct.id && item.unitName === selectedUnit.name);
            if (existingIndex > -1) {
                // Merge if duplicate, but limit to stock
                const currentQty = newCart[existingIndex].quantity;
                const newQty = Math.min(currentQty + quantity, maxStock);
                newCart[existingIndex].quantity = newQty;
                newCart[existingIndex].total = newCart[existingIndex].price * newQty;
                return newCart;
            } else {
                // Add new, limit to stock
                const finalQty = Math.min(quantity, maxStock);
                const newItem = {
                    id: selectedProduct.id,
                    name: selectedProduct.name,
                    image: selectedProduct.image,
                    unitName: selectedUnit.name,
                    price: selectedUnit.price,
                    quantity: finalQty,
                    total: selectedUnit.price * finalQty,
                    origin: selectedProduct.desc || 'Việt Nam',
                    stock: selectedProduct.stock,
                    category: selectedProduct.category,
                    units: selectedProduct.units
                };
                return [...newCart, newItem];
            }
        });
        setProductModalVisible(false); // Close legacy modal if open
        setEditingDetailIndex(null); // Reset edit state
    };

    const addDirectToCart = (product: any, unit: any, qty: number = 1, silent: boolean = false) => {
        const maxStock = product.stock || 999;

        setCart(prev => {
            let newCart = [...prev];
            const existingIndex = newCart.findIndex(item => item.id === product.id && item.unitName === unit.name);

            if (existingIndex > -1) {
                // Limit to stock
                const currentQty = newCart[existingIndex].quantity;
                const newQty = Math.min(currentQty + qty, maxStock);
                newCart[existingIndex].quantity = newQty;
                newCart[existingIndex].total = newCart[existingIndex].price * newQty;
            } else {
                const finalQty = Math.min(qty, maxStock);
                newCart.push({
                    id: product.id,
                    name: product.name,
                    image: product.image,
                    unitName: unit.name,
                    price: unit.price,
                    quantity: finalQty,
                    total: unit.price * finalQty,
                    origin: product.desc || 'Việt Nam',
                    stock: product.stock,
                    category: product.category,
                    units: product.units
                });
            }
            return newCart;
        });

        // Notify user if not silent
        if (!silent) {
            Alert.alert("Đã thêm", `${product.name} (${unit.name})`);
        }
    };

    const updateCartItemQuantity = (index: number, newQty: number) => {
        if (newQty < 0) return; // Allow 0 for text input clearing
        setCart(prev => {
            const newCart = [...prev];
            const item = newCart[index];
            // Limit quantity to available stock
            const maxQty = item.stock || 999;
            const finalQty = Math.min(newQty, maxQty);
            item.quantity = finalQty;
            item.total = item.price * finalQty;
            return newCart;
        });
    };

    const updateCartItemUnit = (index: number, newUnit: any) => {
        setCart(prev => {
            const newCart = [...prev];
            const item = newCart[index];
            item.unitName = newUnit.name;
            item.price = newUnit.price;
            item.total = item.quantity * newUnit.price;
            return newCart;
        });
    };

    const removeCartItem = (index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const handleScan = (code: string) => {
        // Prevent processing if scanner is likely closing (optional safeguard, though checking state in callback is tricky without ref)

        const cleanCode = code.trim();
        const foundProduct = PRODUCTS.find(p => p.id === cleanCode || p.barcode === cleanCode);

        if (foundProduct) {
            setShowScanner(false); // Close scanner UI immediately

            // Give a small delay for scanner cleanup
            setTimeout(() => {
                const defaultUnit = foundProduct.units[0];
                addDirectToCart(foundProduct, defaultUnit, 1);
            }, 300);
        } else {
            setShowScanner(false);
            setTimeout(() => {
                Alert.alert('Không tìm thấy', `Mã: ${code}`);
            }, 400);
        }
    };

    // --- LOGIC: CHECKOUT ---
    // Total amount is computed via useMemo above

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
        Vibration.vibrate([0, 50, 100, 50]);
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
        }
    };

    // --- RENDER: Cart Item (SAFE DEBUG MODE) ---
    const renderCartItem = ({ item, index }: { item: any; index: number }) => {
        try {
            // Safe check
            if (!item) return <View style={{ height: 1 }} />;

            // Simple render for Combo
            if (item.isCombo) {
                return (
                    <View style={{
                        marginHorizontal: 15, // Match padding of container 
                        marginVertical: 5,
                        backgroundColor: '#FFF8E1',
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#FFE082',
                        overflow: 'hidden'
                    }}>
                        <View style={{ padding: 15 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <View style={{ flex: 1, marginRight: 10 }}>
                                    <View style={{ backgroundColor: '#F57C00', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 6 }}>
                                        <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>CẮT LIỀU</Text>
                                    </View>
                                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{item.comboName}</Text>
                                    <Text style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
                                        {item.ageGroup} • {item.doseCount} ngày
                                    </Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#E65100' }}>
                                        {(item.totalPrice || 0).toLocaleString()}đ
                                    </Text>
                                </View>
                            </View>

                            {/* List items safely */}
                            <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: '#FFE082', gap: 6 }}>
                                {(item.items || []).map((sub: any, idx: number) => (
                                    <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={{ fontSize: 13, color: '#444', flex: 1 }}>{sub.name}</Text>
                                        <Text style={{ fontSize: 13, color: '#333', fontWeight: '500' }}>x{sub.quantity} {sub.unit}</Text>
                                    </View>
                                ))}
                            </View>

                            <TouchableOpacity
                                onPress={() => removeCartItem(index)}
                                style={{ marginTop: 15, alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center' }}
                            >
                                <Ionicons name="trash-outline" size={16} color="#D32F2F" style={{ marginRight: 4 }} />
                                <Text style={{ color: '#D32F2F', fontWeight: 'bold', fontSize: 13 }}>Xoá combo</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            }

            // Normal product item
            const tag = getTagStyle(item.category || 'other') || { bg: '#ECEFF1', text: '#546E7A', label: 'Khác' };
            return (
                <View style={styles.productCard}>
                    <TouchableOpacity
                        style={{ flexDirection: 'row', flex: 1 }}
                        onPress={() => {
                            const fullProduct = PRODUCTS.find(p => p.id === item.id);
                            if (fullProduct) {
                                const unitObj = fullProduct.units.find((u: any) => u.name === item.unitName);
                                openDetailModal(fullProduct, index, unitObj, item.quantity);
                            }
                        }}
                        activeOpacity={0.7}
                    >
                        {/* Product Image - Safe Load */}
                        {item.image ? (
                            <Image source={{ uri: item.image }} style={styles.productImage} resizeMode="cover" />
                        ) : (
                            <View style={[styles.productImage, { alignItems: 'center', justifyContent: 'center' }]}>
                                <Ionicons name="image-outline" size={30} color="#ccc" />
                            </View>
                        )}

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
                    </TouchableOpacity>

                    {/* Quantity & Unit */}
                    <View style={styles.quantitySection}>
                        <View style={styles.quantityBox}>
                            <TouchableOpacity onPress={() => updateCartItemQuantity(index, item.quantity - 1)} style={styles.qtyBtn}>
                                <Text style={styles.qtyBtnText}>-</Text>
                            </TouchableOpacity>
                            <TextInput
                                style={[styles.qtyValue, { minWidth: 35 }]}
                                keyboardType="numeric"
                                value={item.quantity === 0 ? '' : String(item.quantity)}
                                onChangeText={(text) => {
                                    if (text === '') {
                                        updateCartItemQuantity(index, 0);
                                        return;
                                    }
                                    const num = parseInt(text.replace(/[^0-9]/g, ''));
                                    if (!isNaN(num)) {
                                        updateCartItemQuantity(index, num);
                                    }
                                }}
                                onEndEditing={() => {
                                    if (item.quantity < 1) updateCartItemQuantity(index, 1);
                                }}
                                selectTextOnFocus
                            />
                            <TouchableOpacity onPress={() => updateCartItemQuantity(index, item.quantity + 1)} style={styles.qtyBtn}>
                                <Text style={styles.qtyBtnText}>+</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                const fullProduct = PRODUCTS.find(p => p.id === item.id);
                                if (!fullProduct || !fullProduct.units || fullProduct.units.length <= 1) return;
                                setEditingCartItemIndex(index);
                            }}
                        >
                            <Text style={[styles.unitLabel, { color: '#0288D1', textDecorationLine: 'underline' }]}>{item.unitName}</Text>
                        </TouchableOpacity>
                        <Text style={styles.stockText}>Tồn: {item.stock}</Text>
                        <TouchableOpacity onPress={() => removeCartItem(index)} style={styles.removeBtn}>
                            <Ionicons name="trash-outline" size={18} color="#D32F2F" />
                        </TouchableOpacity>
                    </View>
                </View>
            );
        } catch (e) {
            return null;
        }
    };

    return (
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
                        placeholder="Nhập tên, barcode code..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <TouchableOpacity style={styles.iconBtn}>
                    <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* FULL SCREEN SEARCH RESULTS */}
            {searchQuery.length > 0 ? (
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1, backgroundColor: '#FAFAFA' }}
                >
                    <TouchableOpacity
                        style={{ paddingVertical: 12, paddingHorizontal: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', alignItems: 'center' }}
                        onPress={() => Linking.openURL(`https://www.google.com/search?q=${searchQuery}`)}
                    >
                        <Ionicons name="logo-google" size={16} color="#0288D1" style={{ marginRight: 8 }} />
                        <Text style={{ color: '#0288D1', fontSize: 14 }}>
                            Tìm kiếm '<Text style={{ fontWeight: 'bold' }}>{searchQuery}</Text>' với Google
                        </Text>
                    </TouchableOpacity>

                    <FlatList
                        data={searchResults}
                        keyExtractor={item => item.id}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ paddingTop: 10, paddingBottom: 80 }}
                        renderItem={({ item }) => (
                            <View style={styles.searchResultCard}>
                                {/* Tags Row */}
                                {(item.isHot || item.isPrescription) && (
                                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                                        {item.isHot && (
                                            <View style={{ borderWidth: 1, borderColor: '#E91E63', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: '#FCE4EC' }}>
                                                <Text style={{ fontSize: 10, color: '#E91E63', fontWeight: 'bold' }}>Hàng hot</Text>
                                            </View>
                                        )}
                                        {item.isPrescription && (
                                            <View style={{ borderWidth: 1, borderColor: '#6200EA', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: '#EDE7F6' }}>
                                                <Text style={{ fontSize: 10, color: '#6200EA', fontWeight: 'bold' }}>Thuốc kê toa</Text>
                                            </View>
                                        )}
                                    </View>
                                )}

                                {/* Product Info */}
                                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333' }}>{item.name}</Text>

                                        {/* CAUTION BADGE */}
                                        {item.caution ? (
                                            <View style={{ marginTop: 4, marginBottom: 4, backgroundColor: '#FFF3E0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' }}>
                                                <Text style={{ color: '#E65100', fontSize: 11, fontWeight: 'bold' }} numberOfLines={2}>
                                                    {item.caution}
                                                </Text>
                                            </View>
                                        ) : null}

                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                                            <View style={{ backgroundColor: '#EDE7F6', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, flexDirection: 'row', alignItems: 'center' }}>
                                                <MaterialCommunityIcons name="earth" size={12} color="#673AB7" />
                                                <Text style={{ fontSize: 11, color: '#673AB7', marginLeft: 4, fontWeight: '500' }}>Việt Nam</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <TouchableOpacity onPress={() => openDetailModal(item)} style={{ justifyContent: 'center', paddingLeft: 10 }}>
                                        <Text style={{ color: '#0288D1', fontSize: 13, fontWeight: 'bold' }}>Chi tiết</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Pricing Grid */}
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View style={{ flexDirection: 'row', gap: 10 }}>
                                        {item.units.map((u: any, idx: number) => (
                                            <TouchableOpacity
                                                key={idx}
                                                onPress={() => openProductModal(item, u)} // Quick add with specific unit
                                                style={{ backgroundColor: '#E3F2FD', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, alignItems: 'center', minWidth: 90 }}
                                            >
                                                <Text style={{ color: '#0288D1', fontWeight: 'bold', fontSize: 13 }}>{u.price.toLocaleString()}đ/{u.name.toLowerCase()}</Text>
                                                <Text style={{ color: '#555', fontSize: 11, marginTop: 4 }}>Tồn: <Text style={{ fontWeight: 'bold', color: '#333' }}>{Math.floor(item.stock / (idx + 1))}</Text> {u.name.toLowerCase()}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>
                        )}
                    />
                </KeyboardAvoidingView>
            ) : (
                <>
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
                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={{ paddingBottom: cart.length > 0 ? 260 : 150 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        onScrollBeginDrag={Keyboard.dismiss}
                    >
                        {cart.length === 0 ? (
                            <View style={{ alignItems: 'center', marginTop: 50 }}>
                                <View style={{
                                    width: 140, height: 140, borderRadius: 70,
                                    backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
                                    shadowColor: "#2196F3", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20
                                }}>
                                    <MaterialCommunityIcons name="cart-variant" size={70} color="#2196F3" />
                                    <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#fff', borderRadius: 20, padding: 8, elevation: 4 }}>
                                        <MaterialCommunityIcons name="plus" size={20} color="#4CAF50" />
                                    </View>
                                </View>

                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1A237E', marginBottom: 5 }}>
                                    Đơn hàng mới
                                </Text>
                                <Text style={{ fontSize: 14, color: '#90A4AE', textAlign: 'center', marginBottom: 30 }}>
                                    Sẵn sàng quét mã hoặc tìm kiếm thuốc
                                </Text>

                                <TouchableOpacity
                                    onPress={() => {
                                        Vibration.vibrate(10);
                                        setShowScanner(true);
                                    }}
                                    activeOpacity={0.8}
                                    style={{
                                        flexDirection: 'row', alignItems: 'center',
                                        backgroundColor: '#29B6F6', paddingVertical: 14, paddingHorizontal: 35, borderRadius: 30,
                                        shadowColor: "#29B6F6", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
                                        marginBottom: 30
                                    }}
                                >
                                    <MaterialCommunityIcons name="barcode-scan" size={24} color="#fff" style={{ marginRight: 8 }} />
                                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>QUÉT MÃ NGAY</Text>
                                </TouchableOpacity>

                                {/* Quick Actions */}
                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                    <TouchableOpacity style={{ paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#F5F5F5', borderRadius: 20 }}>
                                        <Text style={{ color: '#78909C', fontSize: 13, fontWeight: '600' }}>Đơn thuốc mẫu</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#F5F5F5', borderRadius: 20 }}>
                                        <Text style={{ color: '#78909C', fontSize: 13, fontWeight: '600' }}>Cắt liều</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            cart.map((item, index) => (
                                <View key={index}>{renderCartItem({ item, index })}</View>
                            ))
                        )}
                    </ScrollView>

                    {/* FLOATING SCAN BUTTON - Position dynamically based on cart */}
                    {/* FLOATING SCAN BUTTON - Only show when cart has items */}
                    {cart.length > 0 && (
                        <TouchableOpacity
                            style={[styles.fabScan, { bottom: 280 + insets.bottom }]}
                            onPress={() => setShowScanner(true)}
                        >
                            <MaterialCommunityIcons name="qrcode-scan" size={28} color="#fff" />
                        </TouchableOpacity>
                    )}

                    {/* BOTTOM PANEL - Only show when cart has items */}
                    {cart.length > 0 && (
                        <View style={[styles.bottomPanel, { paddingBottom: insets.bottom + 10 }]}>
                            {/* Quick Actions - Always visible */}
                            <View style={styles.quickActions}>
                                <TouchableOpacity style={styles.quickBtn}>
                                    <Ionicons name="document-text-outline" size={16} color="#0288D1" />
                                    <Text style={styles.quickBtnText}>Đơn thuốc điện tử</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.quickBtn} onPress={() => setDoseModalVisible(true)}>
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
                                            <Text style={styles.summaryLabel}>Tiết kiệm: </Text>
                                            <Text style={styles.summaryValue}>0đ</Text>
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Tiền ship: </Text>
                                            <Text style={styles.summaryValue}>0đ</Text>
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabelBold}>Tạm tính: </Text>
                                            <Text style={styles.summaryValueBold}>{totalAmount.toLocaleString()}đ</Text>
                                        </View>
                                    </View>

                                    {/* Checkout Button */}
                                    <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
                                        <Text style={styles.checkoutBtnText}>Tiếp tục</Text>
                                    </TouchableOpacity>


                                </>
                            )}
                        </View>
                    )}

                </>
            )
            }

            {/* ADD PRODUCT MODAL */}
            <Modal visible={productModalVisible} transparent animationType="fade">
                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={styles.modalContent}>
                        {/* Close Button Icon */}
                        <TouchableOpacity
                            style={{ position: 'absolute', top: 10, right: 10, zIndex: 10, padding: 5 }}
                            onPress={() => setProductModalVisible(false)}
                        >
                            <Ionicons name="close" size={24} color="#999" />
                        </TouchableOpacity>

                        {selectedProduct && <Image source={{ uri: selectedProduct.image }} style={styles.modalProductImage} resizeMode="contain" />}
                        <Text style={styles.modalTitle}>{selectedProduct?.name}</Text>
                        <Text style={{ color: '#2E7D32', marginBottom: 15, fontSize: 13, textAlign: 'center' }}>
                            {selectedProduct && getStockBreakdown(selectedProduct)}
                        </Text>

                        {/* Units Selection - Centered */}
                        <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
                            {selectedProduct?.units.map((u: any, idx: number) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={[styles.unitBadge, selectedUnit?.name === u.name && styles.unitBadgeActive]}
                                    onPress={() => setSelectedUnit(u)}
                                >
                                    <Text style={{ fontSize: 12, color: selectedUnit?.name === u.name ? '#0288D1' : '#666', marginBottom: 2 }}>{u.name}</Text>
                                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: selectedUnit?.name === u.name ? '#0288D1' : '#333' }}>
                                        {u.price.toLocaleString()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 20 }}>
                            <TouchableOpacity onPress={() => setQuantity(q => Math.max(1, q - 1))} style={styles.modalQtyBtn}><Ionicons name="remove" size={24} color="#333" /></TouchableOpacity>
                            <TextInput
                                style={{ fontSize: 24, fontWeight: 'bold', width: 60, textAlign: 'center', paddingVertical: 5 }}
                                keyboardType="numeric"
                                value={quantity === 0 ? '' : String(quantity)}
                                onChangeText={(text) => {
                                    if (text === '') {
                                        setQuantity(0);
                                        return;
                                    }
                                    const num = parseInt(text.replace(/[^0-9]/g, ''));
                                    if (!isNaN(num)) {
                                        setQuantity(num);
                                    }
                                }}
                                onEndEditing={() => {
                                    if (quantity < 1) setQuantity(1);
                                }}
                                selectTextOnFocus
                            />
                            <TouchableOpacity onPress={() => setQuantity(q => q + 1)} style={styles.modalQtyBtn}><Ionicons name="add" size={24} color="#333" /></TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.confirmBtn} onPress={confirmAddToCart}>
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Thêm vào đơn - {(selectedUnit?.price * quantity)?.toLocaleString()}đ</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>


            {/* UNIT SELECTION MINI-MODAL */}
            <Modal visible={editingCartItemIndex !== null} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setEditingCartItemIndex(null)}
                >
                    <View style={styles.modalContent}>
                        {editingCartItemIndex !== null && cart[editingCartItemIndex] && (
                            <>
                                <Text style={styles.modalTitle}>Chọn đơn vị tính</Text>
                                <Text style={{ textAlign: 'center', marginBottom: 20, color: '#666' }}>{cart[editingCartItemIndex].name}</Text>

                                <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                                    {cart[editingCartItemIndex].units.map((u: any, idx: number) => (
                                        <TouchableOpacity
                                            key={idx}
                                            style={[styles.unitBadge, cart[editingCartItemIndex].unitName === u.name && styles.unitBadgeActive]}
                                            onPress={() => {
                                                updateCartItemUnit(editingCartItemIndex, u);
                                                setEditingCartItemIndex(null);
                                            }}
                                        >
                                            <Text style={{ fontSize: 13, color: cart[editingCartItemIndex].unitName === u.name ? '#0288D1' : '#666' }}>{u.name}</Text>
                                            <Text style={{ fontWeight: 'bold', fontSize: 14, color: cart[editingCartItemIndex].unitName === u.name ? '#0288D1' : '#333' }}>
                                                {u.price.toLocaleString()}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* CHECKOUT MODAL - 3 STEPS */}
            < Modal visible={checkoutVisible} transparent animationType="slide" >
                <KeyboardAvoidingView
                    style={styles.checkoutOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
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
                                        onPress={() => {
                                            setPaymentMethod('transfer');
                                            setShowQRModal(true);
                                        }}
                                    >
                                        <MaterialCommunityIcons name="qrcode-scan" size={24} color={paymentMethod === 'transfer' ? '#0288D1' : '#666'} />
                                        <Text style={paymentMethod === 'transfer' ? { color: '#0288D1', fontWeight: 'bold' } : { color: '#666' }}>Quét QR</Text>
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
                                    value={customerPaid ? parseInt(customerPaid.replace(/\./g, '')).toLocaleString('vi-VN') : ''}
                                    onChangeText={(text) => {
                                        // Remove dots and store raw number
                                        const rawNumber = text.replace(/\./g, '').replace(/\D/g, '');
                                        setCustomerPaid(rawNumber);
                                    }}
                                />

                                <View style={{ backgroundColor: '#E8F5E9', padding: 15, borderRadius: 10, marginTop: 15 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <Text style={{ color: '#666' }}>Khách cần trả:</Text>
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
                            style={[styles.checkoutNextBtn, checkoutStep === 'payment' && {
                                backgroundColor: '#D84315',
                                shadowColor: "#D84315", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6
                            }]}
                            onPress={() => {
                                Vibration.vibrate(10);
                                checkoutStep === 'payment' ? handleCompletePayment() : handleNextStep();
                            }}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.checkoutNextBtnText, checkoutStep === 'payment' && { fontSize: 18, letterSpacing: 1 }]}>
                                {checkoutStep === 'payment' ? 'XÁC NHẬN THANH TOÁN' : 'Tiếp tục'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal >

            {/* FULL SCREEN PRODUCT DETAIL MODAL */}
            <Modal visible={detailModalVisible} animationType="slide" onRequestClose={() => setDetailModalVisible(false)}>
                <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>

                    {/* Header Container with Safe Area Color */}
                    <View style={{ backgroundColor: '#0D47A1', paddingTop: insets.top }}>
                        <StatusBar barStyle="light-content" backgroundColor="#0D47A1" />
                        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 15 }}>
                            <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                                <Ionicons name="chevron-back" size={24} color="#fff" />
                            </TouchableOpacity>
                            <Text style={{ flex: 1, color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>Chi tiết sản phẩm</Text>
                            <MaterialCommunityIcons name="cart-outline" size={24} color="#fff" />
                        </View>
                    </View>

                    <ScrollView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
                        {selectedProduct && (
                            <>
                                {/* Product Info Card */}
                                <View style={{ backgroundColor: '#fff', padding: 15, marginBottom: 10 }}>
                                    <View style={{ flexDirection: 'row', gap: 15 }}>
                                        {selectedProduct.image ? (
                                            <Image source={{ uri: selectedProduct.image }} style={{ width: 100, height: 100, borderRadius: 5, borderWidth: 1, borderColor: '#eee' }} resizeMode="contain" />
                                        ) : (
                                            <View style={{ width: 100, height: 100, borderRadius: 5, borderWidth: 1, borderColor: '#eee', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9' }}>
                                                <MaterialCommunityIcons name="pill" size={40} color="#ccc" />
                                            </View>
                                        )}
                                        <View style={{ flex: 1 }}>
                                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 5 }}>
                                                <View style={{ borderWidth: 1, borderColor: '#7B1FA2', borderRadius: 4, paddingHorizontal: 4 }}>
                                                    <Text style={{ color: '#7B1FA2', fontSize: 10 }}>Thuốc kê đơn</Text>
                                                </View>
                                            </View>
                                            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 5 }}>{selectedProduct.name}</Text>
                                            <Text style={{ color: '#0288D1', fontWeight: 'bold', fontSize: 16 }}>{selectedUnit?.price.toLocaleString()}đ <Text style={{ color: '#666', fontWeight: 'normal', fontSize: 13 }}>• Còn hàng {selectedProduct.stock}</Text></Text>
                                        </View>
                                    </View>

                                    {/* Unit Selection */}
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 15 }}>
                                        <View style={{ flexDirection: 'row', gap: 15, alignItems: 'center' }}>
                                            {selectedProduct.units.map((u: any, idx: number) => (
                                                <TouchableOpacity
                                                    key={idx}
                                                    style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
                                                    onPress={() => setSelectedUnit(u)}
                                                >
                                                    <Ionicons name={selectedUnit?.name === u.name ? "radio-button-on" : "radio-button-off"} size={22} color={selectedUnit?.name === u.name ? "#0288D1" : "#666"} />
                                                    <Text style={{ fontSize: 15, color: selectedUnit?.name === u.name ? '#000' : '#444', fontWeight: selectedUnit?.name === u.name ? '600' : 'normal' }}>{u.name}{u.name !== 'Viên' && u.qtyPerUnit ? ` (${u.qtyPerUnit}v)` : ''}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </ScrollView>

                                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderColor: '#f0f0f0' }}>
                                        <Text style={{ color: '#0288D1', fontWeight: '500' }}>Luân chuyển nội bộ</Text>
                                        <Ionicons name="chevron-forward" size={16} color="#0288D1" />
                                    </TouchableOpacity>
                                </View>

                                {/* Details Grid */}
                                <View style={{ backgroundColor: '#fff', padding: 15, marginBottom: 10 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, flexWrap: 'wrap', rowGap: 15 }}>
                                        <View style={{ width: '48%' }}>
                                            <Text style={{ color: '#666', fontSize: 12 }}>Mã sản phẩm</Text>
                                            <Text style={{ fontWeight: 'bold' }}>{selectedProduct.id} <Ionicons name="copy-outline" size={12} color="#0288D1" /></Text>
                                        </View>
                                        <View style={{ width: '48%' }}>
                                            <Text style={{ color: '#666', fontSize: 12 }}>Nước sản xuất</Text>
                                            <Text style={{ fontWeight: 'bold' }}>{selectedProduct.origin || 'Việt Nam'}</Text>
                                        </View>
                                        <View style={{ width: '48%' }}>
                                            <Text style={{ color: '#666', fontSize: 12 }}>Kho</Text>
                                            <Text style={{ fontWeight: 'bold' }}>Kho hàng thường</Text>
                                        </View>
                                        <View style={{ width: '48%' }}>
                                            <Text style={{ color: '#666', fontSize: 12 }}>Vị trí</Text>
                                            <Text style={{ fontWeight: 'bold' }}>-</Text>
                                        </View>
                                    </View>

                                    <View style={{ borderTopWidth: 1, borderColor: '#eee', paddingTop: 15 }}>
                                        <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Thành phần và hàm lượng</Text>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text>{selectedProduct.desc}</Text>
                                        </View>
                                    </View>

                                    <View style={{ marginTop: 15 }}>
                                        <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Bảo quản</Text>
                                        <Text>HÀNG THƯỜNG</Text>
                                    </View>

                                    {/* Usage */}
                                    {selectedProduct.usage && (
                                        <View style={{ marginTop: 15, borderTopWidth: 1, borderColor: '#eee', paddingTop: 15 }}>
                                            <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Hướng dẫn sử dụng</Text>
                                            <Text style={{ lineHeight: 20 }}>{selectedProduct.usage}</Text>
                                        </View>
                                    )}
                                </View>
                            </>
                        )}
                    </ScrollView>

                    {/* Footer */}
                    <View style={{ padding: 10, borderTopWidth: 1, borderColor: '#eee' }}>
                        <TouchableOpacity
                            style={{ backgroundColor: '#0D47A1', padding: 15, borderRadius: 5, alignItems: 'center' }}
                            onPress={() => {
                                confirmAddToCart();
                                setDetailModalVisible(false);
                            }}
                        >
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                                {editingDetailIndex !== null ? 'Cập nhật giỏ hàng' : 'Thêm vào giỏ hàng'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <QRScanner visible={showScanner} onClose={() => setShowScanner(false)} onScan={handleScan} />

            {/* QR PAYMENT MODAL */}
            <Modal
                visible={showQRModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowQRModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { width: 340, alignItems: 'center', padding: 0, overflow: 'hidden' }]}>
                        {/* Header */}
                        <View style={{ width: '100%', backgroundColor: '#0D47A1', padding: 15, alignItems: 'center' }}>
                            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Quét mã thanh toán</Text>
                            <Text style={{ color: '#BBDEFB', fontSize: 13, marginTop: 4 }}>Tự động nhập số tiền chính xác</Text>
                            <TouchableOpacity
                                style={{ position: 'absolute', right: 10, top: 10, padding: 5 }}
                                onPress={() => setShowQRModal(false)}
                            >
                                <Ionicons name="close" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {/* QR Image */}
                        <View style={{ padding: 20, alignItems: 'center', width: '100%' }}>
                            <View style={{
                                padding: 10, backgroundColor: '#fff', borderRadius: 10,
                                shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
                            }}>
                                <Image
                                    source={{
                                        uri: `https://img.vietqr.io/image/MB-94456788888-compact2.png?amount=${Math.max(0, Math.floor(totalAmount))}&addInfo=POS Payment&accountName=HOANG MINH HIEU`
                                    }}
                                    style={{ width: 220, height: 220 }}
                                    resizeMode="contain"
                                />
                            </View>

                            <View style={{ marginTop: 20, alignItems: 'center' }}>
                                <Text style={{ fontSize: 14, color: '#666' }}>Số tiền cần thanh toán</Text>
                                <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#0D47A1', marginTop: 4 }}>
                                    {totalAmount.toLocaleString()}đ
                                </Text>
                            </View>

                            <View style={{ width: '100%', height: 1, backgroundColor: '#eee', marginVertical: 20 }} />

                            {/* Bank Info */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                                <MaterialCommunityIcons name="bank" size={20} color="#666" />
                                <Text style={{ fontSize: 15, color: '#333' }}>MB Bank (Quân Đội)</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <MaterialCommunityIcons name="card-account-details-outline" size={20} color="#666" />
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>9445 678 8888</Text>
                            </View>
                        </View>

                        {/* Footer Actions */}
                        <View style={{ flexDirection: 'row', padding: 15, gap: 10, width: '100%', backgroundColor: '#f9f9f9' }}>
                            <TouchableOpacity
                                style={{ flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', alignItems: 'center' }}
                                onPress={() => setShowQRModal(false)}
                            >
                                <Text style={{ fontWeight: 'bold', color: '#666' }}>Đóng</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#4CAF50', alignItems: 'center' }}
                                onPress={() => {
                                    setShowQRModal(false);
                                    handleCompletePayment();
                                }}
                            >
                                <Text style={{ fontWeight: 'bold', color: '#fff' }}>Đã nhận tiền</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* DOSE CUTTING MODAL */}
            <Modal visible={doseModalVisible} transparent animationType="slide" onRequestClose={() => setDoseModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Cắt Liều Theo Đơn 💊</Text>
                            <TouchableOpacity onPress={() => setDoseModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {/* Target Switcher */}
                        <View style={{ flexDirection: 'row', backgroundColor: '#eee', borderRadius: 8, padding: 4, margin: 15 }}>
                            <TouchableOpacity onPress={() => setDoseTarget('adult')} style={{ flex: 1, padding: 10, borderRadius: 6, backgroundColor: doseTarget === 'adult' ? '#fff' : 'transparent', alignItems: 'center', elevation: doseTarget === 'adult' ? 1 : 0 }}>
                                <Text style={{ fontWeight: 'bold', color: doseTarget === 'adult' ? '#0D47A1' : '#666' }}>Người Lớn 🧑</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setDoseTarget('child')} style={{ flex: 1, padding: 10, borderRadius: 6, backgroundColor: doseTarget === 'child' ? '#fff' : 'transparent', alignItems: 'center', elevation: doseTarget === 'child' ? 1 : 0 }}>
                                <Text style={{ fontWeight: 'bold', color: doseTarget === 'child' ? '#0D47A1' : '#666' }}>Trẻ Em 👶</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={DOSE_SAMPLES.filter(d => d.type === doseTarget)}
                            keyExtractor={item => item.id}
                            style={{ marginHorizontal: 15, marginBottom: 15 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={[styles.cardSection, { borderWidth: 1, borderColor: '#eee' }]} onPress={() => handleAddDose(item)}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#0D47A1' }}>{item.name}</Text>
                                        <View style={{ backgroundColor: '#E8F5E9', padding: 5, borderRadius: 20 }}>
                                            <MaterialCommunityIcons name="plus" size={20} color="#2E7D32" />
                                        </View>
                                    </View>
                                    <Text style={{ color: '#666', fontStyle: 'italic', marginBottom: 8, fontSize: 12 }}>{item.desc}</Text>
                                    <View style={{ backgroundColor: '#FAFAFA', padding: 8, borderRadius: 6 }}>
                                        {item.items.map((med, idx) => (
                                            <Text key={idx} style={{ color: '#444', fontSize: 13 }}>• {med.name} <Text style={{ fontWeight: 'bold' }}>x{med.qty}</Text> {med.unit}</Text>
                                        ))}
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

        </View >
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
    content: { flexGrow: 1, flexShrink: 1, padding: 10, backgroundColor: '#F5F5F5' },
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

    // Search Results
    searchResultContainer: {
        position: 'absolute', top: 120, left: 15, right: 15, backgroundColor: '#fff', zIndex: 100, borderRadius: 12, elevation: 10, maxHeight: 300, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8
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

    // Modal & Card
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
    cardSection: { padding: 15, borderRadius: 8, backgroundColor: '#fff', marginBottom: 10 },

    // Search Result Card New Design
    searchResultCard: {
        backgroundColor: '#fff',
        marginHorizontal: 15,
        marginBottom: 10,
        borderRadius: 8,
        padding: 15,
        borderBottomWidth: 1,
        borderColor: '#eee',
        elevation: 1, // Slight shadow
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2
    },

    // Combo Card (Dose items in cart)
    comboCard: {
        backgroundColor: '#FFF8E1',
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#FFE082',
        position: 'relative'
    },
    comboHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    comboBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F57C00',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        gap: 4,
        alignSelf: 'flex-start',
        marginBottom: 6
    },
    comboBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    comboName: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 2 },
    comboSubtext: { fontSize: 12, color: '#666' },
    comboPrice: { fontSize: 15, fontWeight: 'bold', color: '#E65100', marginBottom: 4 },
    comboItems: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderColor: '#FFE082'
    },
    comboItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6
    },
    comboItemName: { fontSize: 13, color: '#333', flex: 1 },
    comboItemQty: { fontSize: 13, color: '#666', fontWeight: '500' },
    comboDeleteBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 5
    },
});

export default PosScreen;
