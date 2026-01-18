import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, TextInput, Modal, ScrollView, StatusBar, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PRODUCTS } from '../data/mockData';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';

const OrderHistoryScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState(0); // 0: Tại quầy, 1: Ecom
    const [searchQuery, setSearchQuery] = useState('');
    const [isTaxSearch, setIsTaxSearch] = useState(false);
    const [expandedOrders, setExpandedOrders] = useState<string[]>([]);

    // Data states
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // UNIFIED MODAL STATE
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isRefundMode, setIsRefundMode] = useState(false);

    // REFUND DATA
    const [refundItems, setRefundItems] = useState<{ [key: string]: number }>({});
    const [refundUnits, setRefundUnits] = useState<{ [key: string]: any }>({});

    // Fetch orders from Supabase
    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await orderService.getOrders();
            if (data) {
                // Group orders by date
                const grouped = groupOrdersByDate(data);
                setOrders(grouped);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchOrders();
        setRefreshing(false);
    };

    const groupOrdersByDate = (ordersData: any[]) => {
        const groups: { [key: string]: any[] } = {};

        ordersData.forEach(order => {
            const date = new Date(order.created_at);
            const dateKey = date.toLocaleDateString('vi-VN', {
                weekday: 'long',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }

            // Transform order data
            groups[dateKey].push({
                id: `#${order.id.slice(0, 7).toUpperCase()}`,
                realId: order.id,
                createdAt: date.toLocaleString('vi-VN'),
                customerPhone: order.customer_phone || 'Khách lẻ',
                customerName: order.customer_name || 'Khách lẻ',
                staffName: order.staff_name || 'Nhân viên',
                total: order.total_amount || 0,
                paymentMethod: order.payment_method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản',
                status: 'completed',
                statusText: 'Hoàn thành',
                items: order.order_items?.map((item: any) => ({
                    name: item.product_name || item.product_id || 'Sản phẩm',
                    quantity: item.quantity || 0,
                    unit: item.unit_name || 'Đơn vị',
                    price: item.price_at_sale || 0,
                    subtotal: (item.quantity || 0) * (item.price_at_sale || 0)
                })) || []
            });
        });

        return Object.keys(groups).map(title => ({
            title,
            data: groups[title]
        }));
    };

    const toggleExpand = (id: string) => {
        setExpandedOrders(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const formatCurrency = (amount: number) => amount.toLocaleString() + 'đ';

    // HANDLERS
    const handleOpenDetail = (item: any) => {
        setIsRefundMode(false);
        setRefundItems({});
        setRefundUnits({});
        setSelectedOrder(item);
    };

    const handleSwitchToRefund = () => {
        setRefundItems({});
        // Init units
        const initialUnits: any = {};
        if (selectedOrder && selectedOrder.items) {
            selectedOrder.items.forEach((item: any) => {
                initialUnits[item.name] = { name: item.unit, price: item.price };
            });
        }
        setRefundUnits(initialUnits);
        setIsRefundMode(true);
    };

    const handleCloseModal = () => {
        setSelectedOrder(null);
        setIsRefundMode(false);
    };

    const cycleRefundUnit = (item: any) => {
        // Find full product definition to get unit list
        const product = PRODUCTS.find(p => p.name === item.name);
        if (!product || !product.units) return;

        const currentUnitName = refundUnits[item.name]?.name || item.unit;
        const currentIndex = product.units.findIndex((u: any) => u.name === currentUnitName);

        let nextIndex = 0;
        if (currentIndex !== -1) {
            nextIndex = (currentIndex + 1) % product.units.length;
        }

        const nextUnit = product.units[nextIndex];
        setRefundUnits(prev => ({
            ...prev,
            [item.name]: { name: nextUnit.name, price: nextUnit.price }
        }));
    };

    const updateRefundQty = (itemName: string, delta: number, maxQty: number = 999) => {
        setRefundItems(prev => {
            const current = prev[itemName] || 0;
            // Allow flexibility since unit changed
            const next = Math.max(0, current + delta);
            if (next === 0) {
                const { [itemName]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [itemName]: next };
        });
    };

    const calculateRefundTotal = () => {
        if (!selectedOrder) return 0;
        return selectedOrder.items.reduce((sum: number, item: any) => {
            const qty = refundItems[item.name] || 0;
            const unitPrice = refundUnits[item.name]?.price || item.price;
            return sum + (qty * unitPrice);
        }, 0);
    };

    const handleConfirmRefund = () => {
        const totalRefund = calculateRefundTotal();
        // Simulate API
        setTimeout(() => {
            alert(`Đã hoàn trả thành công!\nSố tiền hoàn: ${formatCurrency(totalRefund)}`);
            handleCloseModal();
        }, 300);
    };

    const renderItem = ({ item }: { item: any }) => {
        const isExpanded = expandedOrders.includes(item.id);

        return (
            <TouchableOpacity
                style={styles.orderCard}
                onPress={() => handleOpenDetail(item)}
                activeOpacity={0.7}
            >
                {/* Top Row: Status + Price + Chevron */}
                <View style={styles.cardHeader}>
                    <View style={styles.leftHeader}>
                        <View style={[styles.statusBadge, item.status === 'cancelled' && styles.statusBadgeCancelled]}>
                            <Text style={[styles.statusText, item.status === 'cancelled' && styles.statusTextCancelled]}>{item.statusText}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                            <Text style={styles.orderId}>{item.id}</Text>
                            <TouchableOpacity
                                style={{ marginLeft: 4 }}
                                onPress={async () => {
                                    await Clipboard.setStringAsync(item.realId || item.id);
                                    Alert.alert('✅ Đã sao chép', `Mã đơn hàng ${item.id}`);
                                }}
                            >
                                <Ionicons name="copy-outline" size={14} color="#0288D1" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.rightHeader}
                        onPress={(e) => {
                            e.stopPropagation?.();
                            toggleExpand(item.id);
                        }}
                    >
                        <Text style={styles.totalPrice}>{item.total.toLocaleString()}đ</Text>
                        <Ionicons
                            name={isExpanded ? "chevron-up" : "chevron-down"}
                            size={18}
                            color="#999"
                            style={{ marginLeft: 5 }}
                        />
                    </TouchableOpacity>
                </View>

                {/* Expanded Details */}
                {isExpanded && (
                    <View style={styles.cardBody}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Ngày mua</Text>
                            <Text style={styles.detailValue}>{item.createdAt}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>SĐT khách</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.detailValue}>{item.customerPhone}</Text>
                                <Ionicons name="copy-outline" size={12} color="#0288D1" style={{ marginLeft: 4 }} />
                            </View>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Nhân viên</Text>
                            <Text style={styles.detailValue}>{item.staffName}</Text>
                        </View>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0D47A1" />
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <View style={{ width: 30 }} />
                <Text style={styles.headerTitle}>Danh sách đơn hàng</Text>
                <View style={{ width: 30 }} />
            </View>

            {/* Filter Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity onPress={() => setActiveTab(0)} style={[styles.tabBtn, activeTab === 0 && styles.tabBtnActive]}>
                    <Text style={[styles.tabText, activeTab === 0 && styles.tabTextActive]}>Đơn bán tại quầy</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab(1)} style={[styles.tabBtn, activeTab === 1 && styles.tabBtnActive]}>
                    <Text style={[styles.tabText, activeTab === 1 && styles.tabTextActive]}>Đơn hàng Ecom</Text>
                </TouchableOpacity>
            </View>

            {/* Search & Filter */}
            <View style={styles.searchSection}>
                <View style={styles.searchRow}>
                    <View style={styles.searchInputContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Tìm kiếm"
                            placeholderTextColor="#999"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <TouchableOpacity style={styles.filterBtn}>
                        <MaterialCommunityIcons name="filter-variant" size={24} color="#0288D1" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.checkboxRow} onPress={() => setIsTaxSearch(!isTaxSearch)}>
                    <View style={[styles.checkbox, isTaxSearch && styles.checkboxChecked]}>
                        {isTaxSearch && <Ionicons name="checkmark" size={14} color="#fff" />}
                    </View>
                    <Text style={styles.checkboxLabel}>Tìm kiếm theo mã số thuế</Text>
                </TouchableOpacity>
            </View>

            {/* Content List */}
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 50 }}>
                    <ActivityIndicator size="large" color="#0288D1" />
                    <Text style={{ marginTop: 10, color: '#666' }}>Đang tải đơn hàng...</Text>
                </View>
            ) : orders.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 50 }}>
                    <Ionicons name="receipt-outline" size={60} color="#ccc" />
                    <Text style={{ marginTop: 10, color: '#666', fontSize: 16 }}>Chưa có đơn hàng nào</Text>
                </View>
            ) : (
                <SectionList
                    sections={orders}
                    keyExtractor={(item, index) => item.id + index}
                    renderItem={renderItem}
                    renderSectionHeader={({ section: { title } }) => (
                        <Text style={styles.sectionHeader}>{title}</Text>
                    )}
                    contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 20 }}
                    stickySectionHeadersEnabled={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0288D1']} />
                    }
                />
            )}

            {/* UNIFIED MODAL */}
            <Modal visible={!!selectedOrder} transparent animationType="slide" onRequestClose={handleCloseModal}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedOrder && (
                            <>
                                {/* Header */}
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>
                                        {isRefundMode ? 'Hoàn trả đơn hàng' : 'Chi tiết đơn hàng'}
                                    </Text>
                                    <TouchableOpacity onPress={handleCloseModal}>
                                        <Ionicons name="close" size={24} color="#333" />
                                    </TouchableOpacity>
                                </View>

                                {!isRefundMode ? (
                                    // --- VIEW: ORDER DETAIL ---
                                    <>
                                        <ScrollView style={{ maxHeight: 450 }} showsVerticalScrollIndicator={false}>
                                            <View style={styles.infoSection}>
                                                <View style={styles.infoRow}>
                                                    <Text style={styles.infoLabel}>Mã đơn hàng:</Text>
                                                    <Text style={styles.infoValue}>{selectedOrder.id}</Text>
                                                </View>
                                                <View style={styles.infoRow}>
                                                    <Text style={styles.infoLabel}>Thời gian:</Text>
                                                    <Text style={styles.infoValue}>{selectedOrder.createdAt}</Text>
                                                </View>
                                                <View style={styles.infoRow}>
                                                    <Text style={styles.infoLabel}>Khách hàng:</Text>
                                                    <Text style={styles.infoValue}>{selectedOrder.customerName}</Text>
                                                </View>
                                                <View style={styles.infoRow}>
                                                    <Text style={styles.infoLabel}>Tổng tiền:</Text>
                                                    <Text style={[styles.infoValue, { color: '#D32F2F', fontWeight: 'bold' }]}>
                                                        {formatCurrency(selectedOrder.total)}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View style={styles.divider} />
                                            <Text style={styles.sectionTitle}>Danh sách sản phẩm</Text>

                                            {selectedOrder.items.map((item: any, idx: number) => (
                                                <View key={idx} style={styles.productRow}>
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={styles.productName}>{item.name}</Text>
                                                        <Text style={styles.productDetail}>{item.quantity} {item.unit} x {formatCurrency(item.price)}</Text>
                                                    </View>
                                                    <Text style={styles.productSubtotal}>{formatCurrency(item.subtotal)}</Text>
                                                </View>
                                            ))}
                                        </ScrollView>

                                        <View style={styles.actionRow}>
                                            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#E3F2FD' }]}>
                                                <MaterialCommunityIcons name="printer" size={20} color="#0288D1" />
                                                <Text style={[styles.actionBtnText, { color: '#0288D1' }]}>In hóa đơn</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.actionBtn, { backgroundColor: '#FFEBEE' }]}
                                                onPress={handleSwitchToRefund}
                                            >
                                                <MaterialCommunityIcons name="backup-restore" size={20} color="#C62828" />
                                                <Text style={[styles.actionBtnText, { color: '#C62828' }]}>Hoàn trả</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                ) : (
                                    // --- VIEW: REFUND INTERFACE ---
                                    <>
                                        <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                                            <View style={{ backgroundColor: '#FFF3E0', padding: 10, borderRadius: 8, marginBottom: 15 }}>
                                                <Text style={{ color: '#E65100', fontSize: 13 }}>Đang xử lý hoàn trả cho: <Text style={{ fontWeight: 'bold' }}>{selectedOrder.id}</Text></Text>
                                            </View>

                                            {selectedOrder.items.map((item: any, idx: number) => {
                                                const returnQty = refundItems[item.name] || 0;
                                                const currentUnit = refundUnits[item.name] || { name: item.unit, price: item.price };

                                                return (
                                                    <View key={idx} style={[styles.refundItemRow, returnQty > 0 && styles.refundItemActive]}>
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={styles.productName}>{item.name}</Text>

                                                            {/* UNIT SELECTION ROW */}
                                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                                                                <Text style={styles.productDetail}>Đơn vị hoàn: </Text>
                                                                <TouchableOpacity
                                                                    onPress={() => cycleRefundUnit(item)}
                                                                    style={{
                                                                        flexDirection: 'row', alignItems: 'center',
                                                                        backgroundColor: '#E3F2FD',
                                                                        paddingHorizontal: 8, paddingVertical: 4,
                                                                        borderRadius: 6, borderWidth: 1, borderColor: '#2196F3',
                                                                        marginHorizontal: 4
                                                                    }}
                                                                >
                                                                    <Text style={{ fontSize: 12, color: '#1565C0', fontWeight: 'bold', marginRight: 4 }}>
                                                                        {currentUnit.name}
                                                                    </Text>
                                                                    <Ionicons name="swap-horizontal" size={14} color="#1565C0" />
                                                                </TouchableOpacity>
                                                            </View>
                                                            <Text style={[styles.productDetail, { marginTop: 4, fontStyle: 'italic' }]}>
                                                                Đơn giá: {formatCurrency(currentUnit.price)}
                                                            </Text>
                                                        </View>

                                                        {/* QUANTITY & TOTAL */}
                                                        <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                                                            <View style={styles.qtyControl}>
                                                                <TouchableOpacity
                                                                    onPress={() => updateRefundQty(item.name, -1)}
                                                                    disabled={returnQty === 0}
                                                                    style={[styles.qtyBtn, returnQty === 0 && { opacity: 0.3 }]}
                                                                >
                                                                    <Text style={styles.qtyBtnText}>-</Text>
                                                                </TouchableOpacity>

                                                                <Text style={styles.qtyValue}>{returnQty}</Text>

                                                                <TouchableOpacity
                                                                    onPress={() => updateRefundQty(item.name, 1)}
                                                                    style={[styles.qtyBtn]}
                                                                >
                                                                    <Text style={styles.qtyBtnText}>+</Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                            <Text style={{ marginTop: 8, fontWeight: 'bold', fontSize: 13, color: returnQty > 0 ? '#D32F2F' : '#999' }}>
                                                                {formatCurrency(returnQty * currentUnit.price)}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                );
                                            })}

                                            <View style={styles.divider} />
                                            <View style={styles.totalRow}>
                                                <Text style={styles.totalLabel}>Tổng hoàn:</Text>
                                                <Text style={styles.totalValue}>{formatCurrency(calculateRefundTotal())}</Text>
                                            </View>
                                        </ScrollView>

                                        <TouchableOpacity
                                            style={[styles.confirmRefundBtn, calculateRefundTotal() === 0 && { backgroundColor: '#ccc' }]}
                                            onPress={handleConfirmRefund}
                                            disabled={calculateRefundTotal() === 0}
                                        >
                                            <Text style={styles.confirmRefundText}>Xác nhận hoàn trả</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },

    // Header
    header: {
        backgroundColor: '#0D47A1',
        paddingHorizontal: 15,
        paddingBottom: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerTitle: { color: '#fff', fontSize: 17, fontWeight: 'bold' },

    // Tabs
    tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee' },
    tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderColor: 'transparent' },
    tabBtnActive: { borderColor: '#0288D1' },
    tabText: { color: '#666', fontSize: 14, fontWeight: '500' },
    tabTextActive: { color: '#0288D1', fontWeight: 'bold' },

    // Search
    searchSection: { padding: 15 },
    searchRow: { flexDirection: 'row', gap: 10 },
    searchInputContainer: { flex: 1, height: 44, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 4, justifyContent: 'center', paddingHorizontal: 10 },
    searchInput: { fontSize: 14 },
    filterBtn: { width: 44, height: 44, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 4, justifyContent: 'center', alignItems: 'center' },

    checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    checkbox: { width: 18, height: 18, borderWidth: 1, borderColor: '#999', borderRadius: 2, marginRight: 8, justifyContent: 'center', alignItems: 'center' },
    checkboxChecked: { backgroundColor: '#0288D1', borderColor: '#0288D1' },
    checkboxLabel: { color: '#333', fontSize: 13, fontWeight: '500' },

    // Section Header
    sectionHeader: { fontSize: 15, fontWeight: 'bold', color: '#333', marginTop: 15, marginBottom: 10 },

    // Order Card
    orderCard: { backgroundColor: '#F8F9FA', borderRadius: 8, padding: 12, marginBottom: 10 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    leftHeader: { alignItems: 'flex-start' },
    statusBadge: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#C8E6C9'
    },
    statusBadgeCancelled: { backgroundColor: '#FFEBEE', borderColor: '#FFCDD2' },
    statusText: { color: '#2E7D32', fontSize: 11, fontWeight: '600' },
    statusTextCancelled: { color: '#C62828' },
    orderId: { fontSize: 13, color: '#666' },

    rightHeader: { flexDirection: 'row', alignItems: 'center' },
    totalPrice: { fontWeight: 'bold', fontSize: 15, color: '#333' },

    // Card Details
    cardBody: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderColor: '#eee' },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    detailLabel: { color: '#666', fontSize: 13 },
    detailValue: { color: '#333', fontSize: 13, fontWeight: '500' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '85%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderColor: '#eee' },
    modalTitle: { fontWeight: 'bold', fontSize: 18, color: '#333' },

    // Info Section
    infoSection: { marginBottom: 10 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    infoLabel: { color: '#666', fontSize: 14 },
    infoValue: { color: '#333', fontSize: 14, fontWeight: '500' },

    divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },

    // Product List
    sectionTitle: { fontWeight: 'bold', fontSize: 15, marginBottom: 12, color: '#333' },
    productRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' },
    productName: { fontWeight: '500', fontSize: 14, color: '#333' },
    productDetail: { color: '#666', fontSize: 12, marginTop: 2 },
    productSubtotal: { fontWeight: 'bold', fontSize: 14, color: '#333' },

    // Total
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
    totalLabel: { fontWeight: 'bold', fontSize: 16, color: '#333' },
    totalValue: { fontWeight: 'bold', fontSize: 18, color: '#D32F2F' },

    // Actions
    actionRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
    actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 10, gap: 8 },
    actionBtnText: { fontWeight: 'bold', fontSize: 14 },

    // Refund Modal Styles
    refundItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#eee', marginBottom: 10, backgroundColor: '#FAFAFA' },
    refundItemActive: { borderColor: '#E53935', backgroundColor: '#FFEBEE' },
    qtyControl: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 4, overflow: 'hidden' },
    qtyBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
    qtyBtnText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    qtyValue: { width: 36, textAlign: 'center', fontSize: 14, fontWeight: 'bold' },
    confirmRefundBtn: { backgroundColor: '#D32F2F', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
    confirmRefundText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default OrderHistoryScreen;
