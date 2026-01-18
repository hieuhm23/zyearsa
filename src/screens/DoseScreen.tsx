import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Modal, TextInput, FlatList, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Mock data for diseases/conditions
const DISEASE_LIST = [
    { id: 'd1', name: 'CẢM - HO KHAN KHÔNG NHIỄM KHUẨN (+)' },
    { id: 'd2', name: 'RỐI LOẠN TIỀN ĐÌNH (+)' },
    { id: 'd3', name: 'NHIỆT MIỆNG (+)' },
    { id: 'd4', name: 'SAY TÀU XE (+)' },
    { id: 'd5', name: 'RỐI LOẠN TIÊU HÓA (+)' },
    { id: 'd6', name: 'TIÊU CHẢY (+)' },
    { id: 'd7', name: 'ĐAU NHỨC XƯƠNG KHỚP (+)' },
    { id: 'd8', name: 'TRĨ - TIÊU RA MÁU (+)' },
    { id: 'd9', name: 'NHIỄM TRÙNG TIỂU (+)' },
    { id: 'd10', name: 'VẾT THƯƠNG NGOÀI DA (+)' },
    { id: 'd11', name: 'MỤN NHỌT (+)' },
    { id: 'd12', name: 'DỊ ỨNG DA (+)' },
    { id: 'd13', name: 'VIÊM HONG THÔNG THƯỜNG (+)' },
    { id: 'd14', name: 'VIÊM MŨI DỊ ỨNG (+)' },
];

// Mock questions for each disease
const DISEASE_QUESTIONS: { [key: string]: string[] } = {
    'd1': [
        'Anh chị có hắt hơi sổ mũi gì không a?',
        'Anh/Chị ho nhiều không?',
        'Anh/Chị có thấy sốt hay đau đầu không a?'
    ],
    'd2': [
        'Anh/Chị có bị chóng mặt không?',
        'Có buồn nôn hay nôn không?',
        'Có ù tai không a?'
    ],
    // Default questions for other diseases
    'default': [
        'Triệu chứng bắt đầu từ khi nào?',
        'Có đang dùng thuốc gì khác không?',
        'Có tiền sử dị ứng thuốc không?'
    ]
};

// Mock dose items for each disease
const DISEASE_DOSES: { [key: string]: any } = {
    'd1': {
        name: 'CẢM - HO KHAN KHÔNG NHIỄM KHUẨN (+)',
        ageGroup: 'Người lớn plus',
        totalStock: 994,
        items: [
            {
                id: 'T001',
                name: 'GLOTADOL 650 ABBOTT 200V',
                code: '00018235',
                origin: 'Việt Nam',
                ageNote: 'Trên 6 tuổi',
                dosage: { morning: 1, afternoon: 0, evening: 1 },
                unit: 'Viên',
                price: 1500,
                stock: 2838
            },
            {
                id: 'T002',
                name: 'DEXTROMETHORPHAN 15MG',
                code: '00023456',
                origin: 'Việt Nam',
                ageNote: 'Trên 12 tuổi',
                dosage: { morning: 1, afternoon: 1, evening: 1 },
                unit: 'Viên',
                price: 2000,
                stock: 1500
            }
        ]
    },
    'd6': {
        name: 'TIÊU CHẢY (+)',
        ageGroup: 'Người lớn',
        totalStock: 800,
        items: [
            {
                id: 'T003',
                name: 'BERBERIN MỘC HƯƠNG',
                code: '00056789',
                origin: 'Việt Nam',
                ageNote: 'Trên 6 tuổi',
                dosage: { morning: 2, afternoon: 2, evening: 2 },
                unit: 'Viên',
                price: 500,
                stock: 5000
            }
        ]
    }
};

type ScreenStep = 'select' | 'detail';

const DoseScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();

    // Screen state
    const [currentStep, setCurrentStep] = useState<ScreenStep>('select');

    // Step 1: Selection state
    const [selectedTarget, setSelectedTarget] = useState<'adult' | 'child'>('adult');
    const [selectedDisease, setSelectedDisease] = useState<any>(DISEASE_LIST[0]);
    const [customDose, setCustomDose] = useState('');

    // Modal states
    const [diseaseModalVisible, setDiseaseModalVisible] = useState(false);
    const [questionModalVisible, setQuestionModalVisible] = useState(false);
    const [diseaseSearch, setDiseaseSearch] = useState('');

    // Step 2: Detail state
    const [doseCount, setDoseCount] = useState(1);
    const [doseInputText, setDoseInputText] = useState('1');

    // Filter diseases based on search
    const filteredDiseases = DISEASE_LIST.filter(d =>
        d.name.toLowerCase().includes(diseaseSearch.toLowerCase())
    );

    // Get questions for selected disease
    const getQuestions = () => {
        return DISEASE_QUESTIONS[selectedDisease?.id] || DISEASE_QUESTIONS['default'];
    };

    // Get dose data for selected disease
    const getDoseData = () => {
        return DISEASE_DOSES[selectedDisease?.id] || DISEASE_DOSES['d1'];
    };

    // Handle confirm from step 1
    const handleConfirm = () => {
        setQuestionModalVisible(true);
    };

    // Handle next from questions
    const handleQuestionsNext = () => {
        setQuestionModalVisible(false);
        setCurrentStep('detail');
    };

    // Handle add to cart
    const handleAddToCart = () => {
        const doseData = getDoseData();

        // Validate doseData
        if (!doseData || !doseData.items) {
            Alert.alert('Lỗi', 'Không có dữ liệu thuốc');
            return;
        }

        // Calculate total
        let totalPrice = 0;
        let itemsList = '';

        for (let i = 0; i < doseData.items.length; i++) {
            const item = doseData.items[i];
            const morning = item.dosage?.morning || 0;
            const afternoon = item.dosage?.afternoon || 0;
            const evening = item.dosage?.evening || 0;
            const qty = (morning + afternoon + evening) * doseCount;
            const price = (item.price || 0) * qty;
            totalPrice += price;
            itemsList += `• ${item.name}: ${qty} ${item.unit}\n`;
        }

        // Show summary and navigate
        Alert.alert(
            '✅ Cắt liều thành công',
            `${doseData.name}\nTổng tiền: ${totalPrice.toLocaleString()}đ\n\nBạn có muốn thêm vào giỏ hàng ngay?`,
            [
                {
                    text: 'Hủy',
                    style: 'cancel'
                },
                {
                    text: 'Thêm vào giỏ',
                    onPress: () => {
                        try {
                            // Prepare simple data items - CLEAN DATA
                            const simpleItems = doseData.items.map((item: any) => ({
                                id: String(item.id),
                                name: String(item.name),
                                unit: String(item.unit || 'Viên'),
                                price: Number(item.price) || 0,
                                quantity: ((Number(item.dosage?.morning) || 0) + (Number(item.dosage?.afternoon) || 0) + (Number(item.dosage?.evening) || 0)) * doseCount
                            }));

                            const comboItem = {
                                isCombo: true,
                                comboId: String(selectedDisease?.id || 'combo'),
                                comboName: String(doseData.name || 'Combo thuốc'),
                                ageGroup: String(doseData.ageGroup || 'Người lớn'),
                                doseCount: Number(doseCount),
                                items: simpleItems,
                                totalPrice: totalPrice
                            };

                            // Sanitize data to remove any weird refs
                            const cleanData = JSON.parse(JSON.stringify(comboItem));

                            // Use Global State (Simplest way)
                            const { setPendingDoseCombo } = require('../utils/DoseState');
                            setPendingDoseCombo(cleanData);

                            console.log('Dose set to global state, navigating in 100ms...');

                            // Navigate safely
                            setTimeout(() => {
                                navigation.navigate('Pos' as never);
                            }, 100);

                        } catch (error) {
                            console.error("Error adding to cart:", error);
                            Alert.alert("Lỗi", "Không thể thêm vào giỏ hàng: " + String(error));
                        }
                    }
                }
            ]
        );
    };

    // Render Step 1: Selection Screen
    const renderSelectionScreen = () => (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0D47A1" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tôi muốn</Text>
                <TouchableOpacity style={styles.helpBtn}>
                    <Ionicons name="help-circle-outline" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {/* Cắt liều Card */}
                <View style={styles.optionCard}>
                    <View style={styles.optionRow}>
                        <Text style={styles.optionLabel}>Cắt liều</Text>
                        <View style={styles.checkCircle}>
                            <Ionicons name="checkmark" size={16} color="#fff" />
                        </View>
                    </View>
                </View>

                {/* Đối tượng */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionLabel}>Đối tượng</Text>
                    <View style={styles.radioRow}>
                        <TouchableOpacity
                            style={styles.radioOption}
                            onPress={() => setSelectedTarget('adult')}
                        >
                            <View style={[styles.radioCircle, selectedTarget === 'adult' && styles.radioCircleActive]}>
                                {selectedTarget === 'adult' && <View style={styles.radioInner} />}
                            </View>
                            <Text style={styles.radioLabel}>Người Lớn PLUS</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.radioOption}
                            onPress={() => setSelectedTarget('child')}
                        >
                            <View style={[styles.radioCircle, selectedTarget === 'child' && styles.radioCircleActive]}>
                                {selectedTarget === 'child' && <View style={styles.radioInner} />}
                            </View>
                            <Text style={styles.radioLabel}>Trẻ em trên 2 tuổi</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Disease Dropdown */}
                    <TouchableOpacity
                        style={styles.dropdown}
                        onPress={() => setDiseaseModalVisible(true)}
                    >
                        <Text style={styles.dropdownText} numberOfLines={1}>
                            {selectedDisease?.name || 'Chọn bệnh'}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#666" />
                    </TouchableOpacity>

                    {/* Custom Input */}
                    <View style={styles.customInputContainer}>
                        <TextInput
                            style={styles.customInput}
                            placeholder="Tự cắt"
                            placeholderTextColor="#999"
                            value={customDose}
                            onChangeText={setCustomDose}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Confirm Button */}
            <View style={[styles.bottomAction, { paddingBottom: insets.bottom + 15 }]}>
                <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                    <Text style={styles.confirmBtnText}>Xác nhận</Text>
                </TouchableOpacity>
            </View>

            {/* Disease Selection Modal */}
            <Modal visible={diseaseModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { paddingTop: insets.top }]}>
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setDiseaseModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>Chọn bệnh</Text>
                            <View style={{ width: 24 }} />
                        </View>

                        {/* Search */}
                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={18} color="#999" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Tìm kiếm bệnh"
                                placeholderTextColor="#999"
                                value={diseaseSearch}
                                onChangeText={setDiseaseSearch}
                            />
                        </View>

                        {/* Disease List */}
                        <FlatList
                            data={filteredDiseases}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.diseaseItem}
                                    onPress={() => {
                                        setSelectedDisease(item);
                                        setDiseaseModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.diseaseItemText}>{item.name}</Text>
                                    {selectedDisease?.id === item.id && (
                                        <Ionicons name="checkmark" size={20} color="#2E7D32" />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            {/* Questions Modal */}
            <Modal visible={questionModalVisible} animationType="slide" transparent>
                <View style={styles.questionOverlay}>
                    <View style={[styles.questionSheet, { paddingBottom: insets.bottom + 15 }]}>
                        {/* Sheet Header */}
                        <View style={styles.questionHeader}>
                            <TouchableOpacity onPress={() => setQuestionModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                            <Text style={styles.questionTitle}>Gợi ý hỏi bệnh</Text>
                            <TouchableOpacity onPress={handleQuestionsNext}>
                                <Text style={styles.questionNext}>Tiếp</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Questions List */}
                        <View style={styles.questionList}>
                            {getQuestions().map((q, idx) => (
                                <View key={idx} style={styles.questionItem}>
                                    <Text style={styles.questionNumber}>{idx + 1}</Text>
                                    <Text style={styles.questionText}>{q}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );

    // Render Step 2: Detail Screen
    const renderDetailScreen = () => {
        const doseData = getDoseData();

        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#0D47A1" />

                {/* Header */}
                <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                    <TouchableOpacity onPress={() => setCurrentStep('select')} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Cắt liều</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Disease Info Card */}
                    <View style={styles.doseInfoCard}>
                        <Text style={styles.doseTitle}>{doseData.name}</Text>
                        <Text style={styles.doseAgeGroup}>{doseData.ageGroup}</Text>

                        {/* Dose Count */}
                        <View style={styles.doseCountRow}>
                            <Text style={styles.doseCountLabel}>Số liều uống</Text>
                            <View style={styles.doseCountControls}>
                                <TouchableOpacity
                                    style={styles.doseBtn}
                                    onPress={() => {
                                        const newVal = Math.max(1, doseCount - 1);
                                        setDoseCount(newVal);
                                        setDoseInputText(String(newVal));
                                    }}
                                >
                                    <Ionicons name="remove" size={18} color="#333" />
                                </TouchableOpacity>
                                <TextInput
                                    style={styles.doseCountInput}
                                    value={doseInputText}
                                    onFocus={() => setDoseInputText('')}
                                    onChangeText={(text) => setDoseInputText(text.replace(/[^0-9]/g, ''))}
                                    onBlur={() => {
                                        const num = parseInt(doseInputText) || 1;
                                        const finalValue = Math.max(1, num);
                                        setDoseCount(finalValue);
                                        setDoseInputText(String(finalValue));
                                    }}
                                    keyboardType="number-pad"
                                    maxLength={3}
                                />
                                <TouchableOpacity
                                    style={[styles.doseBtn, styles.doseBtnPlus]}
                                    onPress={() => {
                                        const newVal = doseCount + 1;
                                        setDoseCount(newVal);
                                        setDoseInputText(String(newVal));
                                    }}
                                >
                                    <Ionicons name="add" size={18} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Drug Items */}
                    {doseData.items.map((item: any) => {
                        const totalPerDay = item.dosage.morning + item.dosage.afternoon + item.dosage.evening;
                        const totalQty = totalPerDay * doseCount;

                        return (
                            <View key={item.id} style={styles.drugCard}>
                                {/* Drug Header */}
                                <View style={styles.drugHeader}>
                                    <Text style={styles.drugName}>{item.name}</Text>
                                    <TouchableOpacity>
                                        <Text style={styles.editLink}>Đổi</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Drug Code */}
                                <View style={styles.drugInfoRow}>
                                    <MaterialCommunityIcons name="barcode" size={14} color="#666" />
                                    <Text style={styles.drugInfoText}>{item.code}</Text>
                                </View>

                                {/* Origin */}
                                <View style={styles.drugInfoRow}>
                                    <MaterialCommunityIcons name="earth" size={14} color="#2E7D32" />
                                    <Text style={[styles.drugInfoText, { color: '#2E7D32' }]}>{item.origin}</Text>
                                </View>

                                {/* Age Note */}
                                <View style={styles.drugInfoRow}>
                                    <MaterialCommunityIcons name="account-child" size={14} color="#1976D2" />
                                    <Text style={[styles.drugInfoText, { color: '#1976D2' }]}>Độ tuổi sử dụng: {item.ageNote}</Text>
                                </View>

                                {/* Dosage */}
                                <View style={styles.dosageRow}>
                                    <View style={styles.dosageInfo}>
                                        <Text style={styles.dosageLabel}>Sau ăn</Text>
                                        <Text style={styles.dosageDetail}>
                                            {item.dosage.morning > 0 ? `Sáng ${item.dosage.morning} ${item.unit}` : ''}
                                            {item.dosage.afternoon > 0 ? ` | Chiều ${item.dosage.afternoon} ${item.unit}` : ''}
                                            {item.dosage.evening > 0 ? ` | Tối ${item.dosage.evening} ${item.unit}` : ''}
                                        </Text>
                                    </View>
                                    <View style={styles.dosageBadge}>
                                        <Text style={styles.dosageBadgeNumber}>{totalQty}</Text>
                                        <Text style={styles.dosageBadgeUnit}>{item.unit}</Text>
                                    </View>
                                </View>

                                {/* Drug Stock */}
                                <View style={styles.drugStockRow}>
                                    <Text style={styles.drugStockText}>
                                        <Text style={styles.drugStockNumber}>{item.stock.toLocaleString()}</Text>{item.unit} có sẵn
                                    </Text>
                                    <View style={styles.stockBadge}>
                                        <Ionicons name="checkmark-circle" size={14} color="#2E7D32" />
                                        <Text style={styles.stockBadgeText}>Soạn đủ: {doseCount}/{doseCount}</Text>
                                    </View>
                                </View>

                                {/* Type Row */}
                                <View style={styles.drugTypeRow}>
                                    <Text style={styles.typeInfoText}>Hàng thường</Text>
                                    <Text style={styles.typeInfoQty}>x{totalQty}</Text>
                                </View>

                                {/* Restock */}
                                <TouchableOpacity style={styles.restockBtn}>
                                    <Text style={styles.restockBtnText}>Soạn lại hàng</Text>
                                    <Ionicons name="add" size={16} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        );
                    })}

                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* Add to Cart Button */}
                <View style={[styles.bottomAction, { paddingBottom: insets.bottom + 15 }]}>
                    <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
                        <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return currentStep === 'select' ? renderSelectionScreen() : renderDetailScreen();
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },

    // Header
    header: {
        backgroundColor: '#0D47A1',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingBottom: 15
    },
    backBtn: { padding: 5 },
    helpBtn: { padding: 5 },
    headerTitle: { flex: 1, textAlign: 'center', color: '#fff', fontSize: 17, fontWeight: 'bold' },

    // Content
    content: { flex: 1, padding: 15 },

    // Option Card
    optionCard: { backgroundColor: '#fff', borderRadius: 8, padding: 15, marginBottom: 15 },
    optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    optionLabel: { fontSize: 15, color: '#333', fontWeight: '500' },
    checkCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center' },

    // Section Card
    sectionCard: { backgroundColor: '#fff', borderRadius: 8, padding: 15 },
    sectionLabel: { fontSize: 14, color: '#333', fontWeight: '600', marginBottom: 15 },

    // Radio
    radioRow: { flexDirection: 'row', gap: 25, marginBottom: 15 },
    radioOption: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center' },
    radioCircleActive: { borderColor: '#0288D1' },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#0288D1' },
    radioLabel: { fontSize: 14, color: '#333' },

    // Dropdown
    dropdown: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#0288D1', borderRadius: 6, padding: 12, marginBottom: 15 },
    dropdownText: { flex: 1, fontSize: 14, color: '#333' },

    // Custom Input
    customInputContainer: { borderBottomWidth: 1, borderColor: '#eee' },
    customInput: { fontSize: 14, paddingVertical: 12, color: '#333' },

    // Bottom Action
    bottomAction: { backgroundColor: '#fff', paddingHorizontal: 15, paddingTop: 15, borderTopWidth: 1, borderColor: '#eee' },
    confirmBtn: { backgroundColor: '#0288D1', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
    confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
    modalContent: { flex: 1, backgroundColor: '#fff' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
    modalTitle: { fontSize: 17, fontWeight: 'bold', color: '#333' },

    // Search
    searchContainer: { flexDirection: 'row', alignItems: 'center', margin: 15, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#F5F5F5', borderRadius: 8, gap: 8 },
    searchInput: { flex: 1, fontSize: 14, color: '#333' },

    // Disease Item
    diseaseItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 15, borderBottomWidth: 1, borderColor: '#f0f0f0' },
    diseaseItemText: { fontSize: 14, color: '#333', flex: 1 },

    // Question Modal
    questionOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' },
    questionSheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
    questionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    questionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    questionNext: { fontSize: 15, color: '#0288D1', fontWeight: '600' },
    questionList: { gap: 15 },
    questionItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    questionNumber: { fontSize: 14, color: '#0288D1', fontWeight: 'bold' },
    questionText: { flex: 1, fontSize: 14, color: '#333', lineHeight: 20 },

    // Dose Info Card
    doseInfoCard: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15 },
    doseTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 4 },
    doseAgeGroup: { fontSize: 13, color: '#666', marginBottom: 15 },

    doseCountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee' },
    doseCountLabel: { fontSize: 14, color: '#333' },
    doseCountControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    doseBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    doseBtnPlus: { backgroundColor: '#0288D1', borderColor: '#0288D1' },
    doseCountText: { fontSize: 16, fontWeight: 'bold', minWidth: 30, textAlign: 'center' },
    doseCountInput: { fontSize: 16, fontWeight: 'bold', minWidth: 40, textAlign: 'center', paddingVertical: 4, paddingHorizontal: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, backgroundColor: '#fff' },

    stockInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
    stockInfoText: { color: '#666', fontSize: 13 },
    stockInfoNumber: { color: '#0288D1', fontWeight: 'bold' },
    stockBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    stockBadgeText: { color: '#2E7D32', fontSize: 12, fontWeight: '500' },

    typeInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8F9FA', padding: 10, borderRadius: 6, marginBottom: 10 },
    typeInfoText: { color: '#666', fontSize: 13 },
    typeInfoQty: { color: '#333', fontSize: 13, fontWeight: '500' },

    restockBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0288D1', paddingVertical: 10, borderRadius: 6, gap: 5 },
    restockBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

    // Drug Card
    drugCard: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15 },
    drugHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    drugName: { fontSize: 14, fontWeight: 'bold', color: '#333', flex: 1 },
    editLink: { color: '#0288D1', fontSize: 13, fontWeight: '500' },

    drugInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
    drugInfoText: { color: '#666', fontSize: 12 },

    dosageRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8F9FA', padding: 12, borderRadius: 8, marginVertical: 10 },
    dosageInfo: { flex: 1 },
    dosageLabel: { fontSize: 11, color: '#666', marginBottom: 2 },
    dosageDetail: { fontSize: 13, color: '#333', fontWeight: '500' },
    dosageBadge: { backgroundColor: '#0288D1', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
    dosageBadgeNumber: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    dosageBadgeUnit: { color: '#fff', fontSize: 10 },

    drugStockRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
    drugStockText: { color: '#666', fontSize: 13 },
    drugStockNumber: { color: '#0288D1', fontWeight: 'bold' },

    drugTypeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8F9FA', padding: 10, borderRadius: 6, marginBottom: 10 },

    // Add to Cart
    addToCartBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#0288D1', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
    addToCartText: { color: '#0288D1', fontSize: 15, fontWeight: 'bold' }
});

export default DoseScreen;
