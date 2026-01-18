import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    TextInput
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Updates from 'expo-updates';
import { PRODUCTS } from '../data/mockData';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [expiryWarning, setExpiryWarning] = useState(0);
    const [lowStockWarning, setLowStockWarning] = useState(0);

    // Calculate Warnings on Load
    useEffect(() => {
        const today = new Date();
        const warningDate = new Date();
        warningDate.setDate(today.getDate() + 90); // 3 months warning

        let expCount = 0;
        let stockCount = 0;

        PRODUCTS.forEach(p => {
            if (p.stock < 10) stockCount++;

            if (p.expiryDate) {
                const exp = new Date(p.expiryDate);
                // Simple parsing for YYYY-MM-DD
                if (exp < warningDate) expCount++;
            }
        });

        setExpiryWarning(expCount);
        setLowStockWarning(stockCount);
    }, []);

    // Silent background OTA check (no UI display)
    useEffect(() => {
        async function checkUpdates() {
            try {
                const update = await Updates.checkForUpdateAsync();
                if (update.isAvailable) {
                    await Updates.fetchUpdateAsync();
                    // Update downloaded - will apply on next restart
                }
            } catch (e) {
                // Silent fail
            }
        }
        checkUpdates();
    }, []);

    const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
        sales: true,
        warehouse: true,
        operation: true
    });

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handlePress = (item: any) => {
        if (item.screen) {
            // Navigate directly if screen name is provided
            navigation.navigate(item.screen);
        }
    };

    const renderGridItem = (title: string, iconName: keyof typeof MaterialCommunityIcons.glyphMap, color: string, screen: string = '', badge?: string) => (
        <TouchableOpacity style={styles.gridItem} onPress={() => handlePress({ screen, title })}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                <MaterialCommunityIcons name={iconName} size={28} color={color} />
                {badge && (
                    <View style={{
                        position: 'absolute', top: -8, right: -8,
                        backgroundColor: '#FF3D00', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 2,
                        borderWidth: 2, borderColor: '#fff',
                        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41, elevation: 2
                    }}>
                        <Text style={{ color: '#fff', fontSize: 8, fontWeight: '900' }}>{badge}</Text>
                    </View>
                )}
            </View>
            <Text style={styles.gridTitle} numberOfLines={2}>{title}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0D47A1" />

            {/* 1. BLUE HEADER SECTION */}
            {/* Dynamic paddingTop based on Safe Area Insets */}
            <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
                <View style={styles.userInfoRow}>
                    <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>H</Text>
                        </View>
                        <View style={styles.userDetail}>
                            <Text style={styles.userName}>Dược sĩ: Hoàng Minh Hiếu</Text>
                            <Text style={styles.userAddress}>Nhà thuốc Zyea Pharmacy</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.refreshBtn}>
                        <Ionicons name="reload" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchBarRow}>
                    <View style={styles.searchBox}>
                        <Ionicons name="search" size={20} color="#999" />
                        <TextInput
                            placeholder="Tìm kiếm chức năng"
                            placeholderTextColor="#999"
                            style={styles.searchInput}
                        />
                    </View>
                    <View style={styles.notiBox}>
                        <MaterialCommunityIcons name="pill" size={24} color="#E53935" />
                        <View style={styles.redDot} />
                    </View>
                </View>
            </View>

            {/* 2. BODY CONTENT */}
            <View style={styles.bodyContainer}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                    {/* INVENTORY WARNING DASHBOARD */}
                    {(expiryWarning > 0 || lowStockWarning > 0) && (
                        <View style={{ marginBottom: 15 }}>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                {expiryWarning > 0 && (
                                    <TouchableOpacity
                                        style={{ flex: 1, backgroundColor: '#FFEBEE', padding: 10, borderRadius: 10, flexDirection: 'row', alignItems: 'center', borderColor: '#FFCDD2', borderWidth: 1 }}
                                        onPress={() => navigation.navigate('Warehouse')}
                                    >
                                        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#EF5350', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                                            <Ionicons name="alert-circle" size={20} color="#fff" />
                                        </View>
                                        <View>
                                            <Text style={{ color: '#B71C1C', fontWeight: 'bold' }}>{expiryWarning} Thuốc</Text>
                                            <Text style={{ color: '#C62828', fontSize: 11 }}>Sắp hết hạn</Text>
                                        </View>
                                    </TouchableOpacity>
                                )}

                                {lowStockWarning > 0 && (
                                    <TouchableOpacity
                                        style={{ flex: 1, backgroundColor: '#FFF3E0', padding: 10, borderRadius: 10, flexDirection: 'row', alignItems: 'center', borderColor: '#FFE0B2', borderWidth: 1 }}
                                        onPress={() => navigation.navigate('Warehouse')}
                                    >
                                        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#FF9800', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                                            <MaterialCommunityIcons name="package-variant" size={20} color="#fff" />
                                        </View>
                                        <View>
                                            <Text style={{ color: '#E65100', fontWeight: 'bold' }}>{lowStockWarning} Thuốc</Text>
                                            <Text style={{ color: '#EF6C00', fontSize: 11 }}>Tồn kho thấp</Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    )}

                    {/* Section: Bán hàng */}
                    <View style={styles.cardSection}>
                        <TouchableOpacity style={styles.cardHeader} onPress={() => toggleSection('sales')}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <MaterialCommunityIcons name="shopping" size={18} color="#D81B60" style={{ marginRight: 6 }} />
                                <Text style={styles.cardTitle}>Bán hàng</Text>
                            </View>
                            <Ionicons name={expandedSections['sales'] ? "chevron-up" : "chevron-down"} size={20} color="#999" />
                        </TouchableOpacity>

                        {expandedSections['sales'] && (
                            <View style={styles.gridContainer}>
                                {renderGridItem('Giỏ hàng', 'cart-outline', '#0288D1', 'Pos')}

                                {renderGridItem('Cắt liều', 'content-cut', '#F57C00', 'Dose')}
                                {renderGridItem('Trả hàng', 'backup-restore', '#D32F2F', 'OrderHistory', 'MỚI')}
                                {/* {renderGridItem('Tư vấn VX', 'needle', '#0097A7')} */}
                                {/* {renderGridItem('DS đơn VX', 'clipboard-list-outline', '#1976D2')} */}
                            </View>
                        )}
                    </View>

                    {/* Section: Nhập - Xuất */}
                    <View style={styles.cardSection}>
                        <TouchableOpacity style={styles.cardHeader} onPress={() => toggleSection('warehouse')}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <MaterialCommunityIcons name="package-variant-closed" size={18} color="#795548" style={{ marginRight: 6 }} />
                                <Text style={styles.cardTitle}>Nhập - xuất hàng</Text>
                            </View>
                            <Ionicons name={expandedSections['warehouse'] ? "chevron-up" : "chevron-down"} size={20} color="#999" />
                        </TouchableOpacity>

                        {expandedSections['warehouse'] && (
                            <View style={styles.gridContainer}>
                                {renderGridItem('Nhập kho', 'inbox-arrow-down', '#388E3C', 'Warehouse')}
                                {/* {renderGridItem('Chuyển kho', 'swap-horizontal', '#0288D1', 'Transfer')} */}
                                {renderGridItem('Kiểm kê kho', 'clipboard-check-outline', '#4CAF50', 'Audit')}
                                {renderGridItem('Xuất SD', 'export', '#FBC02D', 'Warehouse')}
                            </View>
                        )}
                    </View>

                    {/* Section: Vận hành */}
                    <View style={styles.cardSection}>
                        <TouchableOpacity style={styles.cardHeader} onPress={() => toggleSection('operation')}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <MaterialCommunityIcons name="cog" size={18} color="#607D8B" style={{ marginRight: 6 }} />
                                <Text style={styles.cardTitle}>Vận hành</Text>
                            </View>
                            <Ionicons name={expandedSections['operation'] ? "chevron-up" : "chevron-down"} size={20} color="#999" />
                        </TouchableOpacity>
                        {expandedSections['operation'] && (
                            <View style={styles.gridContainer}>
                                {renderGridItem('Báo cáo', 'chart-bar', '#4CAF50', 'Report')}
                                {renderGridItem('AI Dược sĩ', 'robot', '#009688', 'AIDoctor', 'HOT')}
                                {renderGridItem('Nhân viên', 'account-group', '#2196F3', 'Staff')}
                                {renderGridItem('Khách hàng', 'account-heart', '#E91E63', 'Customer')}
                            </View>
                        )}
                    </View>


                </ScrollView>
            </View >

            {/* 3. BOTTOM TAB NAVIGATION */}
            {/* Dynamic paddingBottom based on Safe Area Insets */}
            <View style={[styles.bottomTab, { paddingBottom: Math.max(insets.bottom, 10), height: 60 + Math.max(insets.bottom, 10) }]}>
                <TouchableOpacity style={styles.tabItemActive}>
                    <Ionicons name="home" size={24} color="#0D47A1" />
                    <Text style={styles.tabLabelActive}>Trang chủ</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('OrderHistory')}>
                    <Ionicons name="document-text-outline" size={24} color="#999" />
                    <Text style={styles.tabLabel}>Đơn hàng</Text>
                </TouchableOpacity>

                {/* Center SCAN Button */}
                <TouchableOpacity style={styles.scanWrapper} onPress={() => navigation.navigate('Pos')}>
                    <View style={styles.scanBtn}>
                        <Ionicons name="scan" size={28} color="#fff" />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.tabItem}>
                    <View>
                        <Ionicons name="notifications-outline" size={24} color="#999" />
                        <View style={styles.tabBadge}><Text style={styles.badgeText}>3</Text></View>
                    </View>
                    <Text style={styles.tabLabel}>Thông báo</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.tabItem}>
                    <Ionicons name="chatbubble-ellipses-outline" size={24} color="#999" />
                    <Text style={styles.tabLabel}>Hỗ trợ</Text>
                </TouchableOpacity>
            </View>

        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F2',
    },
    headerContainer: {
        backgroundColor: '#0D47A1',
        paddingBottom: 20,
        paddingHorizontal: 15,
        // paddingTop handled dynamically
    },
    userInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    avatar: {
        width: 45,
        height: 45,
        borderRadius: 25,
        backgroundColor: '#64B5F6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    avatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    userDetail: {
        flex: 1,
        marginLeft: 12,
    },
    userName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    userAddress: {
        color: '#BBDEFB',
        fontSize: 12,
        marginTop: 2,
    },
    refreshBtn: {
        padding: 5,
    },
    searchBarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    searchBox: {
        flex: 1,
        height: 45,
        backgroundColor: '#fff',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        marginLeft: 8,
        fontSize: 15,
        color: '#333',
    },
    notiBox: {
        width: 45,
        height: 45,
        backgroundColor: '#fff',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    redDot: {
        width: 10,
        height: 10,
        backgroundColor: 'red',
        borderRadius: 5,
        position: 'absolute',
        top: 8,
        right: 8,
        borderWidth: 1,
        borderColor: '#fff',
    },

    bodyContainer: {
        flex: 1,
        marginTop: -10,
        paddingHorizontal: 15,
        paddingTop: 15,
    },
    cardSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 15,
    },
    gridItem: {
        width: '25%', // 4 columns
        alignItems: 'center',
        marginBottom: 20,
    },
    iconContainer: {
        width: 54,
        height: 54,
        borderRadius: 20, // Modern Squircle
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        // Soft Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 1,
    },
    gridTitle: {
        fontSize: 12,
        color: '#444',
        textAlign: 'center',
        fontWeight: '600',
        lineHeight: 16,
    },
    footerBanner: {
        paddingVertical: 20,
        alignItems: 'center',
    },

    // Bottom Tab
    bottomTab: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        // height sẽ được set dynamic trong style inline
        borderTopWidth: 1,
        borderTopColor: '#eee',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        alignItems: 'flex-start', // Để icon nằm sát top padding
        paddingTop: 10
    },
    tabItem: {
        alignItems: 'center',
        flex: 1,
    },
    tabItemActive: {
        alignItems: 'center',
        flex: 1,
    },
    tabLabel: {
        fontSize: 10,
        color: '#999',
        marginTop: 3,
    },
    tabLabelActive: {
        fontSize: 10,
        color: '#0D47A1',
        fontWeight: 'bold',
        marginTop: 3,
    },
    tabBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#D32F2F',
        borderRadius: 10,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: 'bold',
    },
    // Center Scan Button
    scanWrapper: {
        top: -25, // Float up more to clear bottom padding
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    scanBtn: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFB300', // Yellow
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
    },
});

export default HomeScreen;
