import React, { useState } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Alert, ScrollView
} from 'react-native';
import QRScanner from '../components/QRScanner';
import { PRODUCTS } from '../data/mockData';

const WarehouseScreen = ({ navigation }: any) => {
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
                        // Logic call API update kho ở đây
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
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>{'< Trở về'}</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>QUẢN LÝ KHO</Text>
                <View style={{ width: 60 }} />
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'import' && styles.activeTab]}
                    onPress={() => setActiveTab('import')}
                >
                    <Text style={[styles.tabText, activeTab === 'import' && styles.activeTabText]}>NHẬP KHO</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'transfer' && styles.activeTabTransfer]}
                    onPress={() => setActiveTab('transfer')}
                >
                    <Text style={[styles.tabText, activeTab === 'transfer' && styles.activeTabText]}>CHUYỂN KHO</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Action Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        {activeTab === 'import' ? '➕ FORM NHẬP HÀNG' : '📦 FORM CHUYỂN KHO'}
                    </Text>

                    {/* Product Section */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>SẢN PHẨM</Text>
                        {scannedProduct ? (
                            <View style={styles.productDisplay}>
                                <Text style={styles.productName}>{scannedProduct.name}</Text>
                                <Text style={styles.productCode}>Mã: {scannedProduct.id} | Tồn: {scannedProduct.stock}</Text>
                                <TouchableOpacity onPress={() => setScannedProduct(null)} style={styles.clearBtn}>
                                    <Text style={styles.clearText}>Xóa</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity style={styles.scanBtn} onPress={() => setShowScanner(true)}>
                                <Text style={styles.scanBtnText}>📷 QUÉT MÃ VẠCH (SCAN)</Text>
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
                            style={[styles.input, { height: 80, paddingTop: 15 }]}
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
                    </TouchableOpacity>

                </View>

            </ScrollView>

            <QRScanner
                visible={showScanner}
                onClose={() => setShowScanner(false)}
                onScan={handleScan}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
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
        padding: 5,
    },
    backText: {
        color: '#007AFF',
        fontSize: 16,
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
        borderRadius: 8,
        backgroundColor: '#1C1C1E',
        borderWidth: 1,
        borderColor: '#333',
    },
    activeTab: {
        backgroundColor: '#34C759', // Green for Import
        borderColor: '#34C759',
    },
    activeTabTransfer: {
        backgroundColor: '#FF9500', // Orange for Transfer
        borderColor: '#FF9500',
    },
    tabText: {
        color: '#888',
        fontWeight: 'bold',
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
        borderRadius: 12,
        padding: 20,
    },
    cardTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        color: '#888',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    scanBtn: {
        backgroundColor: '#333',
        height: 60,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#444',
        borderStyle: 'dashed',
    },
    scanBtnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    productDisplay: {
        backgroundColor: '#2C2C2E',
        padding: 15,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#007AFF',
    },
    productName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    productCode: {
        color: '#ccc',
        marginTop: 5,
    },
    clearBtn: {
        marginTop: 10,
        alignItems: 'flex-end',
    },
    clearText: {
        color: '#FF3B30',
        fontSize: 12,
    },
    input: {
        backgroundColor: '#2C2C2E',
        height: 50,
        borderRadius: 8,
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
