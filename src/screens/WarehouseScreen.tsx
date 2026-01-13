import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, StatusBar
} from 'react-native';
import QRScanner from '../components/QRScanner';
import { PRODUCTS } from '../data/mockData';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const WarehouseScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState<'import' | 'transfer'>('import');
    const [scannedProduct, setScannedProduct] = useState<any>(null);
    const [quantity, setQuantity] = useState('');
    const [showScanner, setShowScanner] = useState(false);
    const [note, setNote] = useState('');

    const handleScan = (code: string) => {
        const product = PRODUCTS.find(p => p.id === code);
        if (product) {
            setScannedProduct(product);
            setShowScanner(false);
        } else {
            Alert.alert('Lỗi', 'Không tìm thấy sản phẩm này trong hệ thống');
            setShowScanner(false);
        }
    };

    const handleSubmit = () => {
        if (!scannedProduct || !quantity) {
            Alert.alert('Thiếu thông tin', 'Vui lòng quét sản phẩm và nhập số lượng');
            return;
        }

        const actionText = activeTab === 'import' ? 'NHẬP KHO' : 'CHUYỂN KHO';
        Alert.alert(
            'Xác nhận',
            `Bạn chắc chắn muốn ${actionText}?\nSan phẩm: ${scannedProduct.name}\nSố lượng: ${quantity}`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Đồng ý',
                    onPress: () => {
                        Alert.alert('Thành công', `Đã ${actionText} thành công!`);
                        setScannedProduct(null);
                        setQuantity('');
                        setNote('');
                    }
                }
            ]
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <StatusBar barStyle="light-content" backgroundColor="#1C1C1E" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#007AFF" />
                    <Text style={styles.backText}>Trở về</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>QUẢN LÝ KHO</Text>
                <View style={{ width: 70 }} />
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'import' && styles.activeTab]}
                    onPress={() => setActiveTab('import')}
                >
                    <MaterialCommunityIcons name="import" size={20} color={activeTab === 'import' ? '#fff' : '#888'} style={{ marginBottom: 4 }} />
                    <Text style={[styles.tabText, activeTab === 'import' && styles.activeTabText]}>NHẬP KHO</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'transfer' && styles.activeTabTransfer]}
                    onPress={() => setActiveTab('transfer')}
                >
                    <MaterialCommunityIcons name="transfer" size={20} color={activeTab === 'transfer' ? '#fff' : '#888'} style={{ marginBottom: 4 }} />
                    <Text style={[styles.tabText, activeTab === 'transfer' && styles.activeTabText]}>CHUYỂN KHO</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                        <MaterialCommunityIcons
                            name={activeTab === 'import' ? "package-down" : "truck-delivery"}
                            size={24}
                            color={activeTab === 'import' ? "#34C759" : "#FF9500"}
                        />
                        <Text style={styles.cardTitle}>
                            {activeTab === 'import' ? 'FORM NHẬP HÀNG' : 'FORM CHUYỂN KHO'}
                        </Text>
                    </View>

                    {/* Product Section */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>SẢN PHẨM</Text>
                        {scannedProduct ? (
                            <View style={styles.productDisplay}>
                                <View>
                                    <Text style={styles.productName}>{scannedProduct.name}</Text>
                                    <Text style={styles.productCode}>Mã: {scannedProduct.id} | Tồn: {scannedProduct.stock}</Text>
                                </View>
                                <TouchableOpacity onPress={() => setScannedProduct(null)} style={styles.clearBtn}>
                                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity style={styles.scanBtn} onPress={() => setShowScanner(true)}>
                                <MaterialCommunityIcons name="barcode-scan" size={28} color="#fff" style={{ marginRight: 10 }} />
                                <Text style={styles.scanBtnText}>QUÉT MÃ VẠCH (SCAN)</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Quantity Section */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>SỐ LƯỢNG</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor="#666"
                                value={quantity}
                                onChangeText={setQuantity}
                            />
                        </View>

                        {activeTab === 'transfer' && (
                            <View style={[styles.inputGroup, { flex: 1, marginLeft: 15 }]}>
                                <Text style={styles.label}>KHO ĐÍCH</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Chọn kho..."
                                    placeholderTextColor="#666"
                                />
                            </View>
                        )}
                    </View>

                    {/* Note Section */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>GHI CHÚ</Text>
                        <TextInput
                            style={[styles.input, { height: 80, paddingTop: 15, textAlignVertical: 'top' }]}
                            multiline
                            placeholder="Nhập ghi chú nhập/xuất..."
                            placeholderTextColor="#666"
                            value={note}
                            onChangeText={setNote}
                        />
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitBtn, activeTab === 'transfer' && styles.submitBtnTransfer]}
                        onPress={handleSubmit}
                    >
                        <Text style={styles.submitText}>
                            {activeTab === 'import' ? 'XÁC NHẬN NHẬP KHO' : 'XÁC NHẬN CHUYỂN'}
                        </Text>
                        <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>

                </View>
            </ScrollView>

            <QRScanner
                visible={showScanner}
                onClose={() => setShowScanner(false)}
                onScan={handleScan}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000', // Dark Theme for Warehouse
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    backButton: {
        flexDirection: 'row', alignItems: 'center'
    },
    backText: {
        color: '#007AFF',
        fontSize: 16,
        marginLeft: 5
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    tabContainer: {
        flexDirection: 'row',
        padding: 15,
        gap: 15,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: '#1C1C1E',
        borderWidth: 1,
        borderColor: '#333',
    },
    activeTab: {
        backgroundColor: 'rgba(52, 199, 89, 0.2)', // Green Tint
        borderColor: '#34C759',
    },
    activeTabTransfer: {
        backgroundColor: 'rgba(255, 149, 0, 0.2)', // Orange Tint
        borderColor: '#FF9500',
    },
    tabText: {
        color: '#888',
        fontWeight: 'bold',
        fontSize: 12
    },
    activeTabText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    content: {
        padding: 15,
    },
    card: {
        backgroundColor: '#1C1C1E',
        borderRadius: 16,
        padding: 20,
    },
    cardHeaderRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20
    },
    cardTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        color: '#888',
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 8,
    },
    scanBtn: {
        backgroundColor: '#2C2C2E',
        height: 60,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#444',
        borderStyle: 'dashed',
        flexDirection: 'row'
    },
    scanBtnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    productDisplay: {
        backgroundColor: '#2C2C2E',
        padding: 15,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#007AFF',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    productName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    productCode: {
        color: '#aaa',
        marginTop: 5,
        fontSize: 13
    },
    clearBtn: {
        padding: 5,
    },
    input: {
        backgroundColor: '#2C2C2E',
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 15,
        color: '#fff',
        fontSize: 16,
    },
    row: {
        flexDirection: 'row',
    },
    submitBtn: {
        backgroundColor: '#34C759',
        height: 55,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        flexDirection: 'row'
    },
    submitBtnTransfer: {
        backgroundColor: '#FF9500',
    },
    submitText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default WarehouseScreen;
