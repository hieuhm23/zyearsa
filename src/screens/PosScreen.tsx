import React, { useState, useEffect, useMemo } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Modal, StatusBar, Image, ScrollView, Vibration, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { inventoryService } from '../services/inventoryService';
import { orderService } from '../services/orderService';
import QRScanner from '../components/QRScanner';
import { useAuth } from '../context/AuthContext';

const PosScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { session, userProfile } = useAuth();
    const [cart, setCart] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [isProject, setIsProject] = useState(false);

    // Checkout states
    const [checkoutVisible, setCheckoutVisible] = useState(false);
    const [discount, setDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');

    // Unit switch modal
    const [unitSwitchModal, setUnitSwitchModal] = useState(false);
    const [unitSwitchIndex, setUnitSwitchIndex] = useState<number | null>(null);
    const [availableUnits, setAvailableUnits] = useState<any[]>([]);

    // Cash payment states
    const [customerPaid, setCustomerPaid] = useState(0);

    // Transfer confirmation
    const [transferConfirmed, setTransferConfirmed] = useState(false);

    // Checkout step (1 = review, 2 = payment)
    const [checkoutStep, setCheckoutStep] = useState(1);

    // Totals
    const subTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
    const totalAmount = subTotal - discount;

    // Search logic
    useEffect(() => {
        const delaySearch = setTimeout(async () => {
            if (searchQuery.length > 0) {
                try {
                    const data = await inventoryService.getProducts(searchQuery);
                    setSearchResults(data || []);
                } catch (e) {
                    console.error(e);
                }
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(delaySearch);
    }, [searchQuery]);

    const handleScan = async (code: string) => {
        Vibration.vibrate(10);
        setShowScanner(false);
        setLoading(true);
        try {
            const results = await inventoryService.getProducts(code);
            if (results && results.length > 0) {
                const p = results[0];
                addToCart(p, p.units?.[0]);
            } else {
                setTimeout(() => {
                    Alert.alert('Không tìm thấy', 'Mã vạch này chưa có trong hệ thống.');
                }, 500);
            }
        } catch (e) {
            Alert.alert('Lỗi', 'Kết nối database thất bại.');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product: any, unit: any) => {
        if (!unit) return;
        Vibration.vibrate(10);
        setCart(prev => {
            const existingIndex = prev.findIndex(item => item.id === product.id && item.unitName === unit.unit_name);
            if (existingIndex > -1) {
                const newCart = [...prev];
                newCart[existingIndex].quantity += 1;
                return newCart;
            }
            return [...prev, {
                id: product.id,
                name: product.name,
                unitName: unit.unit_name,
                price: unit.price,
                quantity: 1,
                image: product.image_url,
                category: product.category || 'Khác',
                detail: product.brand || 'Việt Nam',
                totalStock: product.stock || 0,
                conversionRate: unit.conversion_rate || 1
            }];
        });
        setSearchQuery('');
        setSearchResults([]);
    };

    const updateQty = (index: number, delta: number) => {
        setCart(prev => {
            const newCart = [...prev];
            const newQty = newCart[index].quantity + delta;
            if (newQty <= 0) {
                newCart.splice(index, 1);
            } else {
                newCart[index].quantity = newQty;
            }
            return newCart;
        });
    };

    const setQty = (index: number, qty: number) => {
        if (qty <= 0) {
            setCart(prev => prev.filter((_, i) => i !== index));
        } else {
            setCart(prev => {
                const newCart = [...prev];
                newCart[index].quantity = qty;
                return newCart;
            });
        }
    };

    const openUnitSwitch = async (index: number) => {
        const item = cart[index];
        try {
            const products = await inventoryService.getProducts(item.name);
            const product = products?.find(p => p.id === item.id);
            if (product && product.units) {
                setAvailableUnits(product.units);
                setUnitSwitchIndex(index);
                setUnitSwitchModal(true);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const switchUnit = (newUnit: any) => {
        if (unitSwitchIndex !== null) {
            setCart(prev => {
                const newCart = [...prev];
                const item = newCart[unitSwitchIndex];
                item.unitName = newUnit.unit_name;
                item.price = newUnit.price;
                item.conversionRate = newUnit.conversion_rate || 1;
                return newCart;
            });
        }
        setUnitSwitchModal(false);
        setUnitSwitchIndex(null);
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setLoading(true);
        try {
            const orderData = {
                total_amount: totalAmount,
                discount: discount,
                payment_method: paymentMethod,
                staff_name: userProfile?.full_name || session?.user?.email || 'Nhân viên',
                items: cart.map(item => ({
                    id: item.id,
                    name: item.name, // Thêm tên sản phẩm
                    qty: item.quantity, // Số lượng thực tế người dùng chọn
                    unit: item.unitName,
                    price: item.price,
                    conversionRate: item.conversionRate // Gửi tỷ lệ quy đổi để trừ kho
                }))
            };
            await orderService.createOrder(orderData);
            Alert.alert('Thành công! 🎉', `Đơn hàng ${totalAmount.toLocaleString()}đ đã được thanh toán và trừ kho tự động.`);
            setCart([]);
            setCheckoutVisible(false);
            setCheckoutStep(1);
            setDiscount(0);
            setCustomerPaid(0);
            setTransferConfirmed(false);
        } catch (e) {
            console.error(e);
            Alert.alert('Lỗi', 'Không thể xử lý đơn hàng.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0D47A1" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 5 }]}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
                        <Ionicons name="arrow-back" size={26} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color="#AAA" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Nhập tên, barcode ho..."
                            placeholderTextColor="#AAA"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={18} color="#AAA" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity style={styles.headerIcon}>
                        <MaterialCommunityIcons name="dots-horizontal" size={26} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.mainContent}>
                {/* SEARCH RESULTS OVERLAY - Fixed to top: 0 to be visible immediately */}
                {searchQuery.length > 0 && (
                    <View style={styles.resultsOverlay}>
                        <View style={styles.googleSearchRow}>
                            <MaterialCommunityIcons name="google" size={18} color="#4285F4" />
                            <Text style={styles.googleSearchText}>Tìm kiếm '{searchQuery}' với Google</Text>
                        </View>
                        <FlatList
                            data={searchResults}
                            keyExtractor={item => item.id.toString()}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            renderItem={({ item }) => (
                                <View style={styles.resCard}>
                                    <View style={styles.resCardTop}>
                                        <Text style={styles.resName}>{item.name}</Text>
                                        <TouchableOpacity onPress={() => navigation.navigate('ProductDetail', { product: item })}>
                                            <Text style={styles.detailLinkText}>Chi tiết</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.resBrandRow}>
                                        <MaterialCommunityIcons name="web" size={14} color="#0D47A1" />
                                        <Text style={styles.resBrandText}>{item.brand || 'Việt Nam'}</Text>
                                    </View>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitList}>
                                        {item.units?.map((u: any, i: number) => {
                                            const unitStock = Math.floor((item.stock || 0) / (u.conversion_rate || 1));
                                            return (
                                                <TouchableOpacity key={i} style={styles.unitItem} onPress={() => addToCart(item, u)}>
                                                    <Text style={styles.unitPriceText}>{u.price.toLocaleString()}đ/{u.unit_name}</Text>
                                                    <Text style={styles.unitStockText}>Tồn: {unitStock}</Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                </View>
                            )}
                            ListEmptyComponent={
                                searchQuery.length > 2 && !loading ? (
                                    <View style={styles.noResult}>
                                        <Text style={styles.noResultText}>Không tìm thấy sản phẩm phù hợp</Text>
                                    </View>
                                ) : null
                            }
                        />
                    </View>
                )}

                <View style={styles.subHeader}>
                    <Text style={styles.subHeaderTitle}>Sản phẩm ({cart.length})</Text>
                    <View style={styles.subHeaderAction}>
                        <View style={styles.checkRow}>
                            <TouchableOpacity
                                style={[styles.checkbox, isProject && styles.checkboxActive]}
                                onPress={() => setIsProject(!isProject)}
                            >
                                {isProject && <Ionicons name="checkmark" size={12} color="#fff" />}
                            </TouchableOpacity>
                            <Text style={styles.checkText}>Dự án</Text>
                        </View>
                        <TouchableOpacity style={styles.dropdownBtn}>
                            <Text style={styles.dropdownText}>Đơn bán tại quầy</Text>
                            <Ionicons name="chevron-down" size={14} color="#0D47A1" />
                        </TouchableOpacity>
                    </View>
                </View>

                {cart.length === 0 ? (
                    <View style={styles.emptyView}>
                        <TouchableOpacity style={styles.emptyScan} onPress={() => setShowScanner(true)}>
                            <View style={styles.emptyScanCircle} />
                            <MaterialCommunityIcons name="barcode-scan" size={40} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.emptyTitle}>Quét Barcode để thêm sản phẩm</Text>
                        <View style={styles.emptyButtons}>
                            <TouchableOpacity style={styles.outlineBtn}><Text style={styles.outlineText}>Đơn thuốc điện tử</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.outlineBtn}><Text style={styles.outlineText}>Cắt liều</Text></TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.manualLink}><Text style={styles.manualText}>Nhập thông tin khách hàng</Text></TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={cart}
                        keyExtractor={(item, index) => `${item.id}-${index}`}
                        contentContainerStyle={{ padding: 15, paddingBottom: 350 }}
                        renderItem={({ item, index }) => (
                            <View style={styles.itemCard}>
                                <View style={styles.itemImage} />
                                <View style={styles.itemBody}>
                                    <View style={styles.tagWrap}>
                                        <View style={[styles.tag, { backgroundColor: '#FFEDD5' }]}><Text style={{ color: '#F97316', fontSize: 10, fontWeight: 'bold' }}>{item.category?.toUpperCase() || 'KHÁC'}</Text></View>
                                        <Text style={styles.itemPriceText}>{(item.price * item.quantity).toLocaleString()}đ</Text>
                                    </View>
                                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                                    <View style={styles.detailRow}>
                                        <Ionicons name="location-outline" size={12} color="#94A3B8" />
                                        <Text style={styles.detailText}>{item.detail}</Text>
                                    </View>
                                    <View style={styles.actionRow}>
                                        <TouchableOpacity style={styles.subBtn}><Text style={styles.subBtnText}>SP mua kèm</Text></TouchableOpacity>
                                        <TouchableOpacity style={styles.subBtn}><Ionicons name="link-outline" size={12} color="#0D47A1" /><Text style={styles.subBtnText}>Chọn khuyến mãi</Text></TouchableOpacity>
                                    </View>
                                </View>
                                <View style={styles.itemRight}>
                                    <View style={styles.qtyBox}>
                                        <TouchableOpacity onPress={() => updateQty(index, -1)} style={styles.qtyAction}><Ionicons name="remove" size={16} color="#0D47A1" /></TouchableOpacity>
                                        <TextInput
                                            style={styles.qtyInput}
                                            value={item.quantity.toString()}
                                            keyboardType="numeric"
                                            onChangeText={(t) => setQty(index, parseInt(t) || 0)}
                                            selectTextOnFocus
                                        />
                                        <TouchableOpacity onPress={() => updateQty(index, 1)} style={styles.qtyAction}><Ionicons name="add" size={16} color="#0D47A1" /></TouchableOpacity>
                                    </View>
                                    <TouchableOpacity onPress={() => openUnitSwitch(index)} style={styles.unitBtn}>
                                        <Text style={styles.unitText}>{item.unitName}</Text>
                                        <Ionicons name="caret-down" size={12} color="#0D47A1" />
                                    </TouchableOpacity>
                                    <Text style={styles.stockText}>Tồn: {Math.floor(item.totalStock / item.conversionRate)}</Text>
                                    <TouchableOpacity style={styles.trashBtn} onPress={() => updateQty(index, -item.quantity)}>
                                        <Ionicons name="trash-outline" size={18} color="#FCA5A5" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    />
                )}

                {cart.length > 0 && (
                    <TouchableOpacity style={styles.fabScan} onPress={() => setShowScanner(true)}>
                        <MaterialCommunityIcons name="qrcode-scan" size={24} color="#fff" />
                    </TouchableOpacity>
                )}

                {cart.length > 0 && (
                    <View style={[styles.footer, { paddingBottom: insets.bottom + 5 }]}>
                        <View style={styles.footerOptions}>
                            <TouchableOpacity style={styles.optBtn}><Ionicons name="document-text-outline" size={16} color="#0284C7" /><Text style={styles.optText}>Đơn thuốc điện tử</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.optBtn}><Ionicons name="cut-outline" size={16} color="#0284C7" /><Text style={styles.optText}>Cắt liều</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.optBtn}><Ionicons name="options-outline" size={16} color="#0284C7" /><Text style={styles.optText}>Điều chỉnh giá</Text></TouchableOpacity>
                        </View>

                        <View style={styles.couponRow}>
                            <Ionicons name="ticket-outline" size={20} color="#94A3B8" />
                            <TextInput style={styles.couponInput} placeholder="Nhập mã giảm giá" placeholderTextColor="#94A3B8" />
                        </View>

                        <View style={styles.summary}>
                            <View style={styles.sumLine}><Text style={styles.sumLabel}>Tiết kiệm:</Text><Text style={styles.sumVal}>0đ</Text></View>
                            <View style={styles.sumLine}><Text style={styles.sumLabel}>Tiền ship:</Text><Text style={styles.sumVal}>0đ</Text></View>
                            <View style={styles.sumLine}><Text style={styles.totalLabel}>Tạm tính:</Text><Text style={styles.totalVal}>{totalAmount.toLocaleString()}đ</Text></View>
                        </View>

                        <TouchableOpacity style={styles.nextBtn} onPress={() => setCheckoutVisible(true)}>
                            <Text style={styles.nextText}>Tiếp tục</Text>
                        </TouchableOpacity>
                        <Text style={styles.rewardText}>Nhận 300 điểm F-sell</Text>
                    </View>
                )}
            </View>

            <QRScanner visible={showScanner} onScan={handleScan} onClose={() => setShowScanner(false)} />

            {/* Unit Switch Modal */}
            <Modal visible={unitSwitchModal} transparent animationType="slide">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setUnitSwitchModal(false)}>
                    <View style={styles.unitSwitchSheet}>
                        <Text style={styles.unitSheetTitle}>Chọn đơn vị tính</Text>
                        {availableUnits.map((u, i) => (
                            <TouchableOpacity key={i} style={styles.unitOption} onPress={() => switchUnit(u)}>
                                <Text style={styles.unitOptionName}>{u.unit_name}</Text>
                                <Text style={styles.unitOptionPrice}>{u.price.toLocaleString()}đ</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.unitCancelBtn} onPress={() => setUnitSwitchModal(false)}>
                            <Text style={styles.unitCancelText}>Hủy</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Checkout Modal */}
            <Modal visible={checkoutVisible} transparent animationType="slide">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => { setCheckoutVisible(false); setCustomerPaid(0); setCheckoutStep(1); }} />
                    <View style={styles.checkoutSheet}>
                        <View style={styles.checkoutHeader}>
                            {checkoutStep === 2 && (
                                <TouchableOpacity onPress={() => setCheckoutStep(1)} style={{ marginRight: 10 }}>
                                    <Ionicons name="arrow-back" size={24} color="#0D47A1" />
                                </TouchableOpacity>
                            )}
                            <Text style={[styles.checkoutTitle, { flex: 1 }]}>
                                {checkoutStep === 1 ? 'Xác nhận đơn hàng' : 'Thanh toán'}
                            </Text>
                            <TouchableOpacity onPress={() => { setCheckoutVisible(false); setCustomerPaid(0); setCheckoutStep(1); }}>
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {/* STEP 1: Review Order */}
                        {checkoutStep === 1 && (
                            <>
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <Text style={styles.checkoutLabel}>Sản phẩm ({cart.length})</Text>
                                    <View style={styles.checkoutProductList}>
                                        {cart.map((item, idx) => (
                                            <View key={idx} style={styles.checkoutProductItem}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.checkoutProductName} numberOfLines={1}>{item.name}</Text>
                                                    <Text style={styles.checkoutProductDetail}>{item.quantity} {item.unitName} x {item.price.toLocaleString()}đ</Text>
                                                </View>
                                                <Text style={styles.checkoutProductPrice}>{(item.quantity * item.price).toLocaleString()}đ</Text>
                                            </View>
                                        ))}
                                    </View>

                                    <View style={styles.checkoutSummary}>
                                        <View style={styles.sumLine}>
                                            <Text style={styles.sumLabel}>Tổng sản phẩm:</Text>
                                            <Text style={styles.sumVal}>{cart.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm</Text>
                                        </View>
                                        <View style={[styles.sumLine, { borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 10, marginTop: 5 }]}>
                                            <Text style={styles.totalLabel}>Tạm tính:</Text>
                                            <Text style={styles.totalVal}>{subTotal.toLocaleString()}đ</Text>
                                        </View>
                                    </View>
                                </ScrollView>

                                <TouchableOpacity style={styles.checkoutBtn} onPress={() => setCheckoutStep(2)}>
                                    <Text style={styles.checkoutBtnText}>TIẾP TỤC</Text>
                                    <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                                </TouchableOpacity>
                            </>
                        )}

                        {/* STEP 2: Payment */}
                        {checkoutStep === 2 && (
                            <>
                                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                                    {/* Payment Method */}
                                    <Text style={styles.checkoutLabel}>Phương thức thanh toán</Text>
                                    <View style={styles.paymentRow}>
                                        <TouchableOpacity
                                            style={[styles.paymentBtn, paymentMethod === 'cash' && styles.paymentBtnActive]}
                                            onPress={() => { setPaymentMethod('cash'); setTransferConfirmed(false); }}
                                        >
                                            <Ionicons name="cash-outline" size={24} color={paymentMethod === 'cash' ? '#fff' : '#666'} />
                                            <Text style={[styles.paymentText, paymentMethod === 'cash' && styles.paymentTextActive]}>Tiền mặt</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.paymentBtn, paymentMethod === 'transfer' && styles.paymentBtnActive]}
                                            onPress={() => { setPaymentMethod('transfer'); setCustomerPaid(0); }}
                                        >
                                            <Ionicons name="card-outline" size={24} color={paymentMethod === 'transfer' ? '#fff' : '#666'} />
                                            <Text style={[styles.paymentText, paymentMethod === 'transfer' && styles.paymentTextActive]}>Chuyển khoản</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* VietQR for Transfer */}
                                    {paymentMethod === 'transfer' && (
                                        <View style={styles.qrContainer}>
                                            <Text style={styles.qrTitle}>Quét mã VietQR để thanh toán</Text>
                                            <Image
                                                source={{ uri: `https://img.vietqr.io/image/MB-94456788888-compact2.png?amount=${totalAmount}&addInfo=Thanhtoan${Date.now()}` }}
                                                style={styles.qrImage}
                                                resizeMode="contain"
                                            />
                                            <View style={styles.bankInfo}>
                                                <Text style={styles.bankName}>MB Bank</Text>
                                                <Text style={styles.bankAccount}>STK: 94456788888</Text>
                                                <Text style={styles.bankAmount}>Số tiền: {totalAmount.toLocaleString()}đ</Text>
                                            </View>
                                        </View>
                                    )}

                                    {/* Discount */}
                                    <Text style={styles.checkoutLabel}>Giảm giá (VNĐ)</Text>
                                    <TextInput
                                        style={styles.discountInput}
                                        keyboardType="numeric"
                                        value={discount > 0 ? discount.toString() : ''}
                                        onChangeText={(t) => setDiscount(parseInt(t) || 0)}
                                        placeholder="0"
                                        placeholderTextColor="#999"
                                    />

                                    {/* Customer Paid (Only for Cash) */}
                                    {paymentMethod === 'cash' && (
                                        <>
                                            <Text style={styles.checkoutLabel}>Khách đưa (VNĐ)</Text>
                                            <TextInput
                                                style={[styles.discountInput, { borderColor: '#0D47A1', color: '#0D47A1' }]}
                                                keyboardType="numeric"
                                                value={customerPaid > 0 ? customerPaid.toLocaleString().replace(/,/g, '.') : ''}
                                                onChangeText={(t) => setCustomerPaid(parseInt(t.replace(/\./g, '')) || 0)}
                                                placeholder={totalAmount.toLocaleString()}
                                                placeholderTextColor="#999"
                                            />
                                        </>
                                    )}

                                    {/* Summary */}
                                    <View style={styles.checkoutSummary}>
                                        <View style={styles.sumLine}><Text style={styles.sumLabel}>Tổng cộng:</Text><Text style={styles.sumVal}>{subTotal.toLocaleString()}đ</Text></View>
                                        <View style={styles.sumLine}><Text style={styles.sumLabel}>Giảm giá:</Text><Text style={[styles.sumVal, { color: '#22C55E' }]}>-{discount.toLocaleString()}đ</Text></View>
                                        <View style={[styles.sumLine, { borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 10, marginTop: 5 }]}>
                                            <Text style={styles.totalLabel}>Thành tiền:</Text>
                                            <Text style={styles.totalVal}>{totalAmount.toLocaleString()}đ</Text>
                                        </View>
                                        {paymentMethod === 'cash' && customerPaid >= totalAmount && customerPaid > 0 && (
                                            <View style={[styles.sumLine, { backgroundColor: '#ECFDF5', padding: 10, borderRadius: 8, marginTop: 10 }]}>
                                                <Text style={[styles.totalLabel, { color: '#059669' }]}>Tiền thừa trả khách:</Text>
                                                <Text style={[styles.totalVal, { color: '#059669' }]}>{(customerPaid - totalAmount).toLocaleString()}đ</Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Transfer Confirmation Checkbox */}
                                    {paymentMethod === 'transfer' && (
                                        <TouchableOpacity
                                            style={styles.confirmRow}
                                            onPress={() => setTransferConfirmed(!transferConfirmed)}
                                        >
                                            <View style={[styles.confirmCheckbox, transferConfirmed && styles.confirmCheckboxActive]}>
                                                {transferConfirmed && <Ionicons name="checkmark" size={16} color="#fff" />}
                                            </View>
                                            <Text style={styles.confirmText}>Đã nhận được tiền chuyển khoản</Text>
                                        </TouchableOpacity>
                                    )}
                                </ScrollView>

                                <TouchableOpacity
                                    style={[styles.checkoutBtn,
                                    ((paymentMethod === 'cash' && customerPaid < totalAmount) || (paymentMethod === 'transfer' && !transferConfirmed)) && { opacity: 0.5 }
                                    ]}
                                    onPress={handleCheckout}
                                    disabled={loading || (paymentMethod === 'cash' && customerPaid < totalAmount) || (paymentMethod === 'transfer' && !transferConfirmed)}
                                >
                                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.checkoutBtnText}>THANH TOÁN</Text>}
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0D47A1' },
    header: { backgroundColor: '#0D47A1', paddingHorizontal: 15, paddingBottom: 12 },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    headerIcon: { padding: 5 },
    searchContainer: { flex: 1, height: 40, backgroundColor: '#fff', borderRadius: 8, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, fontSize: 14, color: '#333' },

    mainContent: { flex: 1, backgroundColor: '#F8FAFC', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    subHeader: { backgroundColor: '#fff', padding: 15, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    subHeaderTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
    subHeaderAction: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    checkRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    checkbox: { width: 18, height: 18, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
    checkboxActive: { backgroundColor: '#0D47A1', borderColor: '#0D47A1' },
    checkText: { color: '#64748B', fontSize: 13 },
    dropdownBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    dropdownText: { color: '#0D47A1', fontSize: 13, fontWeight: '600' },

    // Results Overlay - Fixed Position
    resultsOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#F8FAFC', zIndex: 1000 },
    googleSearchRow: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    googleSearchText: { color: '#4285F4', marginLeft: 10, fontSize: 14 },
    resCard: { backgroundColor: '#fff', marginHorizontal: 15, marginTop: 15, borderRadius: 12, padding: 15, elevation: 2 },
    resCardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' },
    resName: { fontWeight: 'bold', fontSize: 16, color: '#333', flex: 1 },
    detailLinkText: { color: '#0D47A1', fontWeight: 'bold', fontSize: 13 },
    resBrandRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 15 },
    resBrandText: { color: '#0D47A1', fontSize: 13 },
    unitList: { flexDirection: 'row' },
    unitItem: { backgroundColor: '#E6F7FF', padding: 10, borderRadius: 8, marginRight: 10, minWidth: 100, borderWidth: 1, borderColor: '#91D5FF' },
    unitPriceText: { color: '#1890FF', fontWeight: 'bold', fontSize: 14 },
    unitStockText: { color: '#64748B', fontSize: 11, marginTop: 2 },
    noResult: { padding: 40, alignItems: 'center' },
    noResultText: { color: '#999', fontSize: 14 },

    itemCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 12, marginBottom: 12, marginHorizontal: 15, borderWidth: 1, borderColor: '#F1F5F9', elevation: 1 },
    itemImage: { width: 80, height: 80, backgroundColor: '#F1F5F9', borderRadius: 8 },
    itemBody: { flex: 1, paddingHorizontal: 12 },
    tagWrap: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    itemName: { fontWeight: 'bold', fontSize: 15, color: '#1E293B', marginBottom: 4 },
    itemPriceText: { color: '#EF4444', fontWeight: '900', fontSize: 15 },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
    detailText: { color: '#64748B', fontSize: 12, flex: 1 },
    actionRow: { flexDirection: 'row', gap: 8 },
    subBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 15, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', gap: 4 },
    subBtnText: { fontSize: 10, color: '#0D47A1', fontWeight: '600' },

    itemRight: { width: 90, alignItems: 'flex-end', justifyContent: 'space-between' },
    qtyBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#BAE6FD', borderRadius: 8, overflow: 'hidden', height: 32 },
    qtyAction: { width: 28, height: '100%', backgroundColor: '#F0F9FF', justifyContent: 'center', alignItems: 'center' },
    qtyVal: { paddingHorizontal: 8, fontWeight: 'bold', color: '#0D47A1', fontSize: 14 },
    unitText: { color: '#0284C7', fontSize: 12, fontWeight: 'bold', marginTop: 4 },
    stockText: { color: '#94A3B8', fontSize: 10, marginTop: 2 },
    trashBtn: { marginTop: 10, padding: 4 },

    emptyView: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyScan: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F59E0B', justifyContent: 'center', alignItems: 'center', elevation: 5 },
    emptyScanCircle: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: '#F59E0B', opacity: 0.1 },
    emptyTitle: { fontSize: 16, fontWeight: '600', color: '#475569', marginTop: 40, marginBottom: 30 },
    emptyButtons: { flexDirection: 'row', gap: 12 },
    outlineBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#fff', minWidth: 150, alignItems: 'center' },
    outlineText: { color: '#0D47A1', fontWeight: 'bold', fontSize: 14 },
    manualLink: { marginTop: 20 },
    manualText: { color: '#0D47A1', fontSize: 15 },

    fabScan: { position: 'absolute', bottom: 380, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#F59E0B', justifyContent: 'center', alignItems: 'center', elevation: 10 },

    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 15, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    footerOptions: { flexDirection: 'row', gap: 8, marginBottom: 15 },
    optBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0' },
    optText: { fontSize: 11, color: '#0284C7', fontWeight: 'bold' },
    couponRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 10, paddingHorizontal: 12, height: 45, marginBottom: 15 },
    couponInput: { flex: 1, marginLeft: 10, fontSize: 14, color: '#1E293B' },
    summary: { gap: 6, marginBottom: 15 },
    sumLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    sumLabel: { color: '#64748B', fontSize: 14 },
    sumVal: { color: '#1E293B', fontSize: 14, fontWeight: 'bold' },
    totalLabel: { fontSize: 15, fontWeight: 'bold', color: '#1E293B' },
    totalVal: { fontSize: 22, fontWeight: '900', color: '#EF4444' },
    nextBtn: { backgroundColor: '#0EA5E9', height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    nextText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    rewardText: { color: '#F59E0B', textAlign: 'center', fontSize: 12, marginTop: 8, fontWeight: 'bold' },

    // Editable quantity input
    qtyInput: { width: 40, textAlign: 'center', fontWeight: 'bold', color: '#0D47A1', fontSize: 14, paddingHorizontal: 4, paddingVertical: 0, height: '100%' },

    // Unit switch button
    unitBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, paddingHorizontal: 6, paddingVertical: 3, backgroundColor: '#E0F2FE', borderRadius: 5 },

    // Modal styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    unitSwitchSheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
    unitSheetTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 15, color: '#333', textAlign: 'center' },
    unitOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    unitOptionName: { fontWeight: 'bold', fontSize: 15, color: '#0D47A1' },
    unitOptionPrice: { color: '#D32F2F', fontWeight: 'bold', fontSize: 15 },
    unitCancelBtn: { marginTop: 15, paddingVertical: 15, backgroundColor: '#F5F5F5', borderRadius: 10, alignItems: 'center' },
    unitCancelText: { color: '#666', fontWeight: 'bold', fontSize: 14 },

    // Checkout Modal Styles
    checkoutSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' },
    checkoutHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    checkoutTitle: { fontWeight: 'bold', fontSize: 20, color: '#1E293B' },
    checkoutBody: { marginBottom: 20 },
    checkoutLabel: { fontWeight: 'bold', fontSize: 14, color: '#64748B', marginBottom: 10, marginTop: 10 },
    paymentRow: { flexDirection: 'row', gap: 15 },
    paymentBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 15, borderRadius: 12, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
    paymentBtnActive: { backgroundColor: '#0D47A1', borderColor: '#0D47A1' },
    paymentText: { fontWeight: 'bold', fontSize: 14, color: '#64748B' },
    paymentTextActive: { color: '#fff' },
    discountInput: { backgroundColor: '#F8FAFC', borderRadius: 10, padding: 15, fontSize: 16, borderWidth: 1, borderColor: '#E2E8F0', fontWeight: 'bold', color: '#22C55E' },
    checkoutSummary: { marginTop: 20, padding: 15, backgroundColor: '#F8FAFC', borderRadius: 12 },
    checkoutBtn: { backgroundColor: '#0D47A1', height: 55, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 15 },
    checkoutBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },

    // Checkout Product List
    checkoutProductList: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
    checkoutProductItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    checkoutProductName: { fontWeight: 'bold', fontSize: 14, color: '#1E293B', marginBottom: 2 },
    checkoutProductDetail: { fontSize: 12, color: '#64748B' },
    checkoutProductPrice: { fontWeight: 'bold', fontSize: 15, color: '#EF4444' },

    // VietQR Styles
    qrContainer: { alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 12, marginVertical: 15, borderWidth: 1, borderColor: '#E2E8F0' },
    qrTitle: { fontWeight: 'bold', fontSize: 15, color: '#0D47A1', marginBottom: 15 },
    qrImage: { width: 200, height: 200, marginBottom: 15 },
    bankInfo: { alignItems: 'center', gap: 4 },
    bankName: { fontWeight: 'bold', fontSize: 16, color: '#7B1FA2' },
    bankAccount: { fontSize: 14, color: '#333' },
    bankAmount: { fontWeight: 'bold', fontSize: 18, color: '#D32F2F', marginTop: 5 },

    // Transfer Confirmation Styles
    confirmRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7ED', padding: 15, borderRadius: 10, marginTop: 15, borderWidth: 1, borderColor: '#FDBA74', gap: 12 },
    confirmCheckbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#F97316', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    confirmCheckboxActive: { backgroundColor: '#22C55E', borderColor: '#22C55E' },
    confirmText: { flex: 1, fontSize: 14, fontWeight: 'bold', color: '#EA580C' },

    // Quick Amount Button Styles
    quickAmountRow: { flexDirection: 'row', marginTop: 10, marginBottom: 5 },
    quickAmountBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', marginRight: 8 },
    quickAmountBtnActive: { backgroundColor: '#0D47A1', borderColor: '#0D47A1' },
    quickAmountText: { fontSize: 13, fontWeight: 'bold', color: '#64748B' },
    quickAmountTextActive: { color: '#fff' }
});

export default PosScreen;
