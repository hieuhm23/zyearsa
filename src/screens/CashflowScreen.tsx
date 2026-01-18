import React from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CashflowScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    // Mock Data
    const todaySales = 28500000;
    const yesterdaySales = 25100000;
    const expense = 1200000;
    const profit = todaySales - expense;

    const formatCurrency = (val: number) => val.toLocaleString() + 'đ';

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Báo cáo doanh thu 📊</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: 15 }}>
                {/* Date Filter */}
                <View style={styles.filterRow}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>Hôm nay, 18/01</Text>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ color: '#4CAF50', fontWeight: 'bold' }}>Chọn ngày</Text>
                        <Ionicons name="calendar-outline" size={18} color="#4CAF50" style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                </View>

                {/* Main Cards */}
                <View style={[styles.card, { backgroundColor: '#4CAF50' }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Doanh thu hôm nay</Text>
                        <MaterialCommunityIcons name="trending-up" size={24} color="#fff" />
                    </View>
                    <Text style={{ color: '#fff', fontSize: 32, fontWeight: 'bold', marginVertical: 10 }}>
                        {formatCurrency(todaySales)}
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
                        So với hôm qua: <Text style={{ fontWeight: 'bold' }}>+12%</Text> 🚀
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 15, marginTop: 15 }}>
                    <View style={[styles.smallCard, { backgroundColor: '#fff' }]}>
                        <MaterialCommunityIcons name="cash-fast" size={24} color="#E91E63" />
                        <Text style={styles.smallLabel}>Chi phí</Text>
                        <Text style={[styles.smallValue, { color: '#E91E63' }]}>{formatCurrency(expense)}</Text>
                    </View>
                    <View style={[styles.smallCard, { backgroundColor: '#fff' }]}>
                        <MaterialCommunityIcons name="piggy-bank-outline" size={24} color="#2196F3" />
                        <Text style={styles.smallLabel}>Lợi nhuận</Text>
                        <Text style={[styles.smallValue, { color: '#2196F3' }]}>{formatCurrency(profit)}</Text>
                    </View>
                </View>

                {/* Details List */}
                <Text style={styles.sectionTitle}>Chi tiết giao dịch</Text>
                <View style={styles.transList}>
                    <View style={styles.transItem}>
                        <View style={styles.iconBoxIn}>
                            <Ionicons name="arrow-down" size={16} color="#4CAF50" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.transTitle}>Bán lẻ thuốc (24 đơn)</Text>
                            <Text style={styles.transTime}>10:30 AM</Text>
                        </View>
                        <Text style={styles.transAmount}>+{formatCurrency(12500000)}</Text>
                    </View>

                    <View style={styles.transItem}>
                        <View style={styles.iconBoxIn}>
                            <Ionicons name="arrow-down" size={16} color="#4CAF50" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.transTitle}>Bán sỉ (3 đơn)</Text>
                            <Text style={styles.transTime}>09:15 AM</Text>
                        </View>
                        <Text style={styles.transAmount}>+{formatCurrency(8000000)}</Text>
                    </View>

                    <View style={styles.transItem}>
                        <View style={styles.iconBoxOut}>
                            <Ionicons name="arrow-up" size={16} color="#E91E63" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.transTitle}>Nhập hàng Hapulico</Text>
                            <Text style={styles.transTime}>08:00 AM</Text>
                        </View>
                        <Text style={[styles.transAmount, { color: '#E91E63' }]}>-{formatCurrency(4500000)}</Text>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    header: { backgroundColor: '#4CAF50', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 15, paddingHorizontal: 15, elevation: 4 },
    backBtn: { padding: 5 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

    filterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },

    card: { padding: 20, borderRadius: 16, elevation: 4, shadowColor: '#4CAF50', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },

    smallCard: { flex: 1, padding: 15, borderRadius: 12, elevation: 2, alignItems: 'center' },
    smallLabel: { color: '#666', marginTop: 8, fontSize: 13 },
    smallValue: { fontWeight: 'bold', fontSize: 16, marginTop: 4 },

    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 25, marginBottom: 10 },

    transList: { backgroundColor: '#fff', borderRadius: 12, padding: 5 },
    transItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderColor: '#f0f0f0' },
    iconBoxIn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
    iconBoxOut: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FCE4EC', justifyContent: 'center', alignItems: 'center' },
    transTitle: { fontSize: 15, fontWeight: 'bold', color: '#333' },
    transTime: { fontSize: 12, color: '#999', marginTop: 2 },
    transAmount: { fontSize: 15, fontWeight: '600', color: '#4CAF50' },
});

export default CashflowScreen;
