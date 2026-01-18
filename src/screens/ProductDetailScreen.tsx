import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, StatusBar, SafeAreaView, Vibration
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ProductDetailScreen = ({ route, navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { product } = route.params || { product: { name: 'Sản phẩm demo', price: 300000, units: [{ unit_name: 'Tuýp', price: 300000, stock: 8 }] } };
    const [activeTab, setActiveTab] = useState('noi');

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0D47A1" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
                    <Ionicons name="arrow-back" size={26} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
                <TouchableOpacity style={styles.headerIcon}>
                    <Ionicons name="cart-outline" size={26} color="#fff" />
                    <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>1</Text></View>
                </TouchableOpacity>
            </View>

            <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Product Summary */}
                <View style={styles.summarySection}>
                    <View style={styles.summaryTop}>
                        <View style={styles.imgPlaceholder}>
                            <MaterialCommunityIcons name="pill" size={40} color="#0D47A1" />
                        </View>
                        <View style={styles.summaryRight}>
                            <View style={styles.tagWrap}>
                                <View style={styles.prescriptionTag}><Text style={styles.prescriptionText}>Thuốc kê toa</Text></View>
                                <Text style={styles.productName}>{product.name}</Text>
                            </View>
                            <Text style={styles.priceStockText}>
                                <Text style={styles.priceText}>{product.units?.[0]?.price.toLocaleString()}đ</Text>
                                <Text style={styles.stockLabel}> • Còn hàng </Text>
                                <Text style={styles.stockVal}>{product.units?.[0]?.stock || 0}</Text>
                            </Text>

                            {/* Unit Selector */}
                            <TouchableOpacity style={styles.unitSelector}>
                                <View style={styles.radioActive}><View style={styles.radioInner} /></View>
                                <Text style={styles.unitLabel}>{product.units?.[0]?.unit_name || 'Tuýp'}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.transferLink}>
                                <Text style={styles.transferText}>Luân chuyển nội bộ</Text>
                                <Ionicons name="chevron-forward" size={14} color="#0D47A1" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Basic Info Grid */}
                    <View style={styles.infoGrid}>
                        <View style={styles.infoCol}>
                            <Text style={styles.infoLabel}>Mã sản phẩm</Text>
                            <View style={styles.codeRow}>
                                <Text style={styles.infoValue}>00002195</Text>
                                <MaterialCommunityIcons name="content-copy" size={14} color="#0EA5E9" />
                            </View>
                        </View>
                        <View style={styles.infoCol}>
                            <Text style={styles.infoLabel}>Vị trí</Text>
                            <Text style={styles.infoValue}>-</Text>
                        </View>
                        <View style={styles.infoCol}>
                            <Text style={styles.infoLabel}>Kho</Text>
                            <Text style={styles.infoValue}>L1362-Kho hàng thường</Text>
                        </View>
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabsRow}>
                    <TouchableOpacity
                        style={[styles.tabBtn, activeTab === 'noi' && styles.tabBtnActive]}
                        onPress={() => setActiveTab('noi')}
                    >
                        <Text style={[styles.tabText, activeTab === 'noi' && styles.tabTextActive]}>Hàng nội  2</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabBtn, activeTab === 'ngoai' && styles.tabBtnActive]}
                        onPress={() => setActiveTab('ngoai')}
                    >
                        <Text style={[styles.tabText, activeTab === 'ngoai' && styles.tabTextActive]}>Hàng ngoại  0</Text>
                    </TouchableOpacity>
                </View>

                {/* Related Cards */}
                <View style={styles.cardContainer}>
                    <TouchableOpacity style={styles.subCard}>
                        <View style={styles.cardInfo}>
                            <Text style={styles.cardName}>TROZIMED-B DAVIPHARM 30G</Text>
                            <Text style={styles.cardPrice}>220.000đ <Text style={styles.cardUnit}>/Hộp</Text></Text>
                        </View>
                        <TouchableOpacity style={styles.addSmallBtn}>
                            <Ionicons name="add" size={20} color="#fff" />
                        </TouchableOpacity>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.subCard}>
                        <View style={styles.cardInfo}>
                            <Text style={styles.cardName}>POTRIOLAC TRUNG ƯƠNG 2 15G</Text>
                            <Text style={styles.cardPrice}>190.000đ <Text style={styles.cardUnit}>/Hộp</Text></Text>
                        </View>
                        <TouchableOpacity style={styles.addSmallBtn}>
                            <Ionicons name="add" size={20} color="#fff" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                </View>

                {/* Details Section */}
                <View style={styles.detailsSection}>
                    <Text style={styles.sectionTitle}>Thành phần và hàm lượng</Text>
                    <View style={styles.ingredientRow}>
                        <Text style={styles.ingredientName}>Betamethasone</Text>
                        <Text style={styles.ingredientVal}>0.5mg</Text>
                    </View>
                    <View style={styles.ingredientRow}>
                        <Text style={styles.ingredientName}>Calcipotriol</Text>
                        <Text style={styles.ingredientVal}>50mcg</Text>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Bảo quản</Text>
                    <Text style={styles.storageText}>HÀNG THƯỜNG</Text>
                </View>
            </ScrollView>

            {/* Sticky Footer */}
            <View style={[styles.stickyFooter, { paddingBottom: insets.bottom + 15 }]}>
                <TouchableOpacity style={styles.addToCartBtn} onPress={() => {
                    Vibration.vibrate(10);
                    navigation.goBack();
                }}>
                    <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F7F9' },
    header: { backgroundColor: '#0D47A1', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingBottom: 15 },
    headerIcon: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    cartBadge: { position: 'absolute', top: 5, right: 5, backgroundColor: '#FF4D4F', borderRadius: 10, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center' },
    cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

    summarySection: { backgroundColor: '#fff', padding: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
    summaryTop: { flexDirection: 'row' },
    imgPlaceholder: { width: 80, height: 80, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EEE', borderRadius: 5, justifyContent: 'center', alignItems: 'center' },
    summaryRight: { flex: 1, marginLeft: 15 },
    tagWrap: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
    prescriptionTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, borderWidth: 1, borderColor: '#722ED1', backgroundColor: '#F9F0FF' },
    prescriptionText: { color: '#722ED1', fontSize: 10, fontWeight: 'bold' },
    productName: { fontSize: 15, fontWeight: 'bold', color: '#1E293B' },
    priceStockText: { marginTop: 6, fontSize: 14 },
    priceText: { color: '#0D47A1', fontWeight: 'bold' },
    stockLabel: { color: '#64748B' },
    stockVal: { fontWeight: 'bold', color: '#333' },
    unitSelector: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 },
    radioActive: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#0D47A1', justifyContent: 'center', alignItems: 'center' },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#0D47A1' },
    unitLabel: { fontSize: 14, color: '#1E293B', fontWeight: '500' },
    transferLink: { flexDirection: 'row', alignItems: 'center', marginTop: 15, gap: 4 },
    transferText: { color: '#0D47A1', fontSize: 13, fontWeight: '600' },

    infoGrid: { flexDirection: 'row', marginTop: 25, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 15 },
    infoCol: { flex: 1 },
    infoLabel: { fontSize: 12, color: '#94A3B8', marginBottom: 4 },
    infoValue: { fontSize: 13, fontWeight: '600', color: '#1E293B' },
    codeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },

    tabsRow: { flexDirection: 'row', backgroundColor: '#F8FAFC', height: 48, marginTop: 10 },
    tabBtn: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    tabBtnActive: { borderBottomWidth: 2, borderBottomColor: '#0D47A1', backgroundColor: '#fff' },
    tabText: { fontSize: 14, color: '#64748B' },
    tabTextActive: { color: '#0D47A1', fontWeight: 'bold' },

    cardContainer: { padding: 15, gap: 12 },
    subCard: { backgroundColor: '#E6F7FF', borderRadius: 10, padding: 15, flexDirection: 'row', alignItems: 'center' },
    cardInfo: { flex: 1 },
    cardName: { fontSize: 13, fontWeight: 'bold', color: '#333', marginBottom: 8 },
    cardPrice: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    cardUnit: { fontWeight: '300', color: '#999' },
    addSmallBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#0D47A1', justifyContent: 'center', alignItems: 'center' },

    detailsSection: { backgroundColor: '#fff', padding: 20, marginTop: 10 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E293B', marginBottom: 15 },
    ingredientRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    ingredientName: { color: '#64748B', fontSize: 13 },
    ingredientVal: { color: '#1E293B', fontSize: 13, fontWeight: '500' },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 20 },
    storageText: { color: '#1E293B', fontSize: 13, fontWeight: '600' },

    stickyFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 15, borderTopWidth: 1, borderTopColor: '#EEE' },
    addToCartBtn: { backgroundColor: '#0D47A1', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    addToCartText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default ProductDetailScreen;
