import React, { useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, Image
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const INITIAL_STAFF = [
    { id: '1', name: 'Hoàng Minh Hiếu', role: 'Chủ cửa hàng', sales: 15400000, shift: 'Sáng', avatar: 'https://i.pravatar.cc/150?img=68' },
    { id: '2', name: 'Nguyễn Thu Hà', role: 'Dược sĩ', sales: 8200000, shift: 'Chiều', avatar: 'https://i.pravatar.cc/150?img=43' },
    { id: '3', name: 'Lê Tuấn Anh', role: 'Nhân viên bán hàng', sales: 4500000, shift: 'Tối', avatar: 'https://i.pravatar.cc/150?img=12' },
];

const StaffScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    const formatCurrency = (val: number) => val.toLocaleString() + 'đ';

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={styles.name}>{item.name}</Text>
                    <View style={[styles.badge, item.role === 'Chủ cửa hàng' ? { backgroundColor: '#E3F2FD' } : { backgroundColor: '#F5F5F5' }]}>
                        <Text style={[styles.badgeText, item.role === 'Chủ cửa hàng' ? { color: '#1976D2' } : { color: '#666' }]}>{item.role}</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 15 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialCommunityIcons name="clock-outline" size={14} color="#666" />
                        <Text style={{ fontSize: 13, color: '#666', marginLeft: 4 }}>Ca: {item.shift}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialCommunityIcons name="finance" size={14} color="#4CAF50" />
                        <Text style={{ fontSize: 13, color: '#4CAF50', fontWeight: 'bold', marginLeft: 4 }}>
                            {formatCurrency(item.sales)}
                        </Text>
                    </View>
                </View>
            </View>
            <TouchableOpacity style={{ padding: 10 }}>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Nhân Viên 👥</Text>
                <TouchableOpacity style={styles.addBtn}>
                    <Ionicons name="person-add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Stats Summary */}
            <View style={styles.summaryContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Tổng nhân sự</Text>
                    <Text style={styles.statValue}>{INITIAL_STAFF.length}</Text>
                </View>
                <View style={[styles.statItem, { borderLeftWidth: 1, borderLeftColor: '#eee' }]}>
                    <Text style={styles.statLabel}>Đang làm việc</Text>
                    <Text style={[styles.statValue, { color: '#4CAF50' }]}>2</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Danh sách nhân viên</Text>

            <FlatList
                data={INITIAL_STAFF}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 15 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    header: { backgroundColor: '#2196F3', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 15, paddingHorizontal: 15, elevation: 4 },
    backBtn: { padding: 5 },
    addBtn: { padding: 5 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

    summaryContainer: { flexDirection: 'row', backgroundColor: '#fff', margin: 15, padding: 15, borderRadius: 12, elevation: 2 },
    statItem: { flex: 1, alignItems: 'center' },
    statLabel: { color: '#666', fontSize: 13, marginBottom: 4 },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#333' },

    sectionTitle: { marginLeft: 15, marginBottom: 10, fontSize: 16, fontWeight: 'bold', color: '#333' },

    card: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, alignItems: 'center', elevation: 1, marginHorizontal: 15 },
    avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#eee' },
    name: { fontWeight: 'bold', fontSize: 16, color: '#333' },
    badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    badgeText: { fontSize: 11, fontWeight: 'bold' },
});

export default StaffScreen;
