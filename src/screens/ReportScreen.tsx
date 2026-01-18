import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// Mock Data for Reports
const DAILY_STATS = {
    revenue: 12500000,
    profit: 3850000,
    orders: 45,
    avgOrder: 277000
};

const WEEKLY_CHART = [
    { day: 'T2', value: 8500000, height: 120 },
    { day: 'T3', value: 9200000, height: 140 },
    { day: 'T4', value: 7800000, height: 110 },
    { day: 'T5', value: 11500000, height: 180 },
    { day: 'T6', value: 10200000, height: 160 },
    { day: 'T7', value: 14500000, height: 210 },
    { day: 'CN', value: 12500000, height: 170 }, // Today
];

const TOP_PRODUCTS = [
    { id: 1, name: 'Panadol Extra', qty: 120, unit: 'Vỉ', revenue: 1800000 },
    { id: 2, name: 'Berberin', qty: 85, unit: 'Lọ', revenue: 1275000 },
    { id: 3, name: 'Khẩu trang 4D', qty: 50, unit: 'Hộp', revenue: 1500000 },
    { id: 4, name: 'Vitamin C 500mg', qty: 42, unit: 'Lọ', revenue: 3360000 },
    { id: 5, name: 'Dung dịch sát khuẩn', qty: 30, unit: 'Chai', revenue: 900000 },
];

const ReportScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Báo cáo kinh doanh</Text>
                    <TouchableOpacity style={styles.calendarBtn}>
                        <Ionicons name="calendar-outline" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Period Selector */}
                <View style={styles.periodSelector}>
                    <TouchableOpacity
                        style={[styles.periodBtn, period === 'day' && styles.periodBtnActive]}
                        onPress={() => setPeriod('day')}
                    >
                        <Text style={[styles.periodText, period === 'day' && styles.periodTextActive]}>Hôm nay</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.periodBtn, period === 'week' && styles.periodBtnActive]}
                        onPress={() => setPeriod('week')}
                    >
                        <Text style={[styles.periodText, period === 'week' && styles.periodTextActive]}>Tuần này</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.periodBtn, period === 'month' && styles.periodBtnActive]}
                        onPress={() => setPeriod('month')}
                    >
                        <Text style={[styles.periodText, period === 'month' && styles.periodTextActive]}>Tháng này</Text>
                    </TouchableOpacity>
                </View>

                {/* Main Big Stat */}
                <View style={styles.bigStatBox}>
                    <Text style={styles.bigStatLabel}>Tổng doanh thu</Text>
                    <Text style={styles.bigStatValue}>{DAILY_STATS.revenue.toLocaleString()}đ</Text>
                    <View style={styles.trendRow}>
                        <Ionicons name="trending-up" size={16} color="#4CAF50" />
                        <Text style={styles.trendText}>+12.5% so với hôm qua</Text>
                    </View>
                </View>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
                            <MaterialCommunityIcons name="finance" size={24} color="#1976D2" />
                        </View>
                        <Text style={styles.statLabel}>Lợi nhuận gộp</Text>
                        <Text style={[styles.statValue, { color: '#1976D2' }]}>{DAILY_STATS.profit.toLocaleString()}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
                            <MaterialCommunityIcons name="receipt" size={24} color="#388E3C" />
                        </View>
                        <Text style={styles.statLabel}>Số đơn hàng</Text>
                        <Text style={[styles.statValue, { color: '#388E3C' }]}>{DAILY_STATS.orders}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.iconBox, { backgroundColor: '#FFF3E0' }]}>
                            <MaterialCommunityIcons name="basket-outline" size={24} color="#F57C00" />
                        </View>
                        <Text style={styles.statLabel}>TB đơn hàng</Text>
                        <Text style={[styles.statValue, { color: '#F57C00' }]}>{DAILY_STATS.avgOrder.toLocaleString()}</Text>
                    </View>
                </View>

                {/* Chart Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Biểu đồ doanh thu (7 ngày)</Text>
                    <View style={styles.chartContainer}>
                        {WEEKLY_CHART.map((item, index) => (
                            <View key={index} style={styles.chartColWrapper}>
                                <Text style={styles.chartValue}>{item.value / 1000000}M</Text>
                                <View style={[
                                    styles.chartBar,
                                    { height: item.height },
                                    index === WEEKLY_CHART.length - 1 && { backgroundColor: '#1976D2' } // Highlight Today
                                ]} />
                                <Text style={[
                                    styles.chartLabel,
                                    index === WEEKLY_CHART.length - 1 && { fontWeight: 'bold', color: '#1976D2' }
                                ]}>{item.day}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Top Products */}
                <View style={styles.section}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                        <Text style={styles.sectionTitle}>Top sản phẩm bán chạy</Text>
                        <TouchableOpacity>
                            <Text style={{ color: '#1976D2', fontWeight: '600', fontSize: 13 }}>Xem tất cả</Text>
                        </TouchableOpacity>
                    </View>

                    {TOP_PRODUCTS.map((prod, index) => (
                        <View key={prod.id} style={styles.productRow}>
                            <View style={[styles.rankBadge, index === 0 && { backgroundColor: '#FFD700' }, index === 1 && { backgroundColor: '#C0C0C0' }, index === 2 && { backgroundColor: '#CD7F32' }]}>
                                <Text style={[styles.rankText, index < 3 && { color: '#fff' }]}>{index + 1}</Text>
                            </View>
                            <View style={{ flex: 1, paddingHorizontal: 10 }}>
                                <Text style={styles.prodName}>{prod.name}</Text>
                                <Text style={styles.prodDetail}>{prod.qty} {prod.unit}</Text>
                            </View>
                            <Text style={styles.prodRev}>{prod.revenue.toLocaleString()}đ</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        backgroundColor: '#1976D2',
        paddingHorizontal: 20,
        paddingBottom: 60, // Extend background for stats overlap
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    backBtn: {
        padding: 5,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    calendarBtn: {
        padding: 5,
    },
    periodSelector: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },
    periodBtn: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    periodBtnActive: {
        backgroundColor: '#fff',
    },
    periodText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
        fontWeight: '600',
    },
    periodTextActive: {
        color: '#1976D2',
        fontWeight: 'bold',
    },
    bigStatBox: {
        alignItems: 'center',
    },
    bigStatLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        marginBottom: 5,
    },
    bigStatValue: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    trendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    trendText: {
        color: '#4CAF50',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    content: {
        flex: 1,
        marginTop: -40, // Pull up to overlap header
        paddingHorizontal: 15,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statCard: {
        width: '31%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statLabel: {
        color: '#757575',
        fontSize: 11,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 220,
    },
    chartColWrapper: {
        alignItems: 'center',
        flex: 1,
    },
    chartValue: {
        fontSize: 10,
        color: '#999',
        marginBottom: 4,
    },
    chartBar: {
        width: 8,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        marginBottom: 8,
    },
    chartLabel: {
        fontSize: 12,
        color: '#757575',
    },
    productRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    rankBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rankText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#666',
    },
    prodName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    prodDetail: {
        fontSize: 12,
        color: '#999',
    },
    prodRev: {
        fontWeight: 'bold',
        color: '#1976D2',
    },
});

export default ReportScreen;
