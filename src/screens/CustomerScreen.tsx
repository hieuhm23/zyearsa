import React, { useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Mock Customers
const INITIAL_CUSTOMERS = [
    { id: '1', name: 'Nguyễn Văn A', phone: '0912345678', points: 150, lastVisit: '18/01/2026' },
    { id: '2', name: 'Trần Thị B', phone: '0987654321', points: 340, lastVisit: '15/01/2026' },
    { id: '3', name: 'Lê Văn C', phone: '0909090909', points: 50, lastVisit: '10/01/2026' },
];

const CustomerScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    // New Customer Form
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');

    const filteredList = customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery)
    );

    const handleAddCustomer = () => {
        if (!newName || !newPhone) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên và số điện thoại');
            return;
        }
        const newCus = {
            id: Date.now().toString(),
            name: newName,
            phone: newPhone,
            points: 0,
            lastVisit: 'Chưa ghé'
        };
        setCustomers([newCus, ...customers]);
        setModalVisible(false);
        setNewName('');
        setNewPhone('');
        Alert.alert('Thành công', 'Đã thêm khách hàng mới');
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.phone}><Ionicons name="call-outline" size={12} /> {item.phone}</Text>
                <Text style={styles.lastVisit}>Ghé thăm: {item.lastVisit}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <View style={styles.pointBadge}>
                    <Text style={styles.pointText}>{item.points} điểm</Text>
                </View>
                <TouchableOpacity style={{ marginTop: 8 }}>
                    <Ionicons name="ellipsis-horizontal" size={20} color="#999" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Khách Hàng ❤️</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm tên hoặc số điện thoại..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* List */}
            <FlatList
                data={filteredList}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 15 }}
                ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 50, color: '#999' }}>Không tìm thấy khách hàng</Text>}
            />

            {/* Add Modal */}
            <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Thêm Khách Hàng</Text>

                        <Text style={styles.label}>Tên khách hàng</Text>
                        <TextInput style={styles.input} value={newName} onChangeText={setNewName} placeholder="Nhập tên..." />

                        <Text style={styles.label}>Số điện thoại</Text>
                        <TextInput style={styles.input} value={newPhone} onChangeText={setNewPhone} placeholder="Nhập SĐT..." keyboardType="phone-pad" />

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleAddCustomer}>
                                <Text style={styles.saveText}>Lưu</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    header: { backgroundColor: '#E91E63', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 15, paddingHorizontal: 15, elevation: 4 },
    backBtn: { padding: 5 },
    addBtn: { padding: 5 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 15, paddingHorizontal: 15, borderRadius: 10, height: 45, elevation: 2 },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },

    card: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, alignItems: 'center', elevation: 2 },
    avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FCE4EC', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#E91E63', fontWeight: 'bold', fontSize: 20 },
    name: { fontWeight: 'bold', fontSize: 16, color: '#333' },
    phone: { color: '#666', fontSize: 13, marginTop: 2 },
    lastVisit: { color: '#999', fontSize: 12, marginTop: 2 },
    pointBadge: { backgroundColor: '#FFF8E1', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: '#FFC107' },
    pointText: { color: '#F57C00', fontSize: 12, fontWeight: 'bold' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 15, padding: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#E91E63' },
    label: { fontWeight: '600', marginBottom: 5, color: '#333' },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 15, fontSize: 16 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 10 },
    cancelBtn: { padding: 10 },
    cancelText: { color: '#666' },
    saveBtn: { backgroundColor: '#E91E63', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    saveText: { color: '#fff', fontWeight: 'bold' },
});

export default CustomerScreen;
