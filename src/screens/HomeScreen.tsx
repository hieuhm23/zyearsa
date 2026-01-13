import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    TextInput,
    ImageBackground
} from 'react-native';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }: any) => {
    const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
        sales: true,
        warehouse: true,
        operation: false
    });

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handlePress = (item: any) => {
        if (item.screen) {
            if (item.screen === 'Pos' || item.screen === 'Warehouse') {
                navigation.navigate(item.screen);
            } else {
                console.log('Coming soon: ' + item.title);
            }
        }
    };

    const renderGridItem = (title: string, icon: string, screen: string = '', color: string = '#0288D1', customIcon?: boolean) => (
        <TouchableOpacity style={styles.gridItem} onPress={() => handlePress({ screen, title })}>
            <View style={[styles.iconContainer, { backgroundColor: '#E3F2FD' }]}>
                <Text style={[styles.iconText, { color: color }]}>{icon}</Text>
            </View>
            <Text style={styles.gridTitle} numberOfLines={2}>{title}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0D47A1" />

            {/* 1. BLUE HEADER SECTION */}
            <View style={styles.headerContainer}>
                <SafeAreaView>
                    <View style={styles.userInfoRow}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>H</Text>
                        </View>
                        <View style={styles.userDetail}>
                            <Text style={styles.userName}>Hoàng Minh Hiếu - 65680</Text>
                            <Text style={styles.userAddress}>81362 - LC HNI 15 Hoàng Như Tiếp, P. Bồ Đề</Text>
                        </View>
                        <TouchableOpacity style={styles.refreshBtn}>
                            <Text style={{ color: '#fff', fontSize: 18 }}>↻</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    <View style={styles.searchBarRow}>
                        <View style={styles.searchBox}>
                            <Text style={{ fontSize: 16 }}>🔍</Text>
                            <TextInput
                                placeholder="Tìm kiếm chức năng"
                                placeholderTextColor="#999"
                                style={styles.searchInput}
                            />
                        </View>
                        <View style={styles.notiBox}>
                            <Text style={{ fontSize: 20 }}>💊</Text>
                            <View style={styles.redDot} />
                        </View>
                    </View>
                </SafeAreaView>
            </View>

            {/* 2. BODY CONTENT */}
            <View style={styles.bodyContainer}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                    {/* Section: Bán hàng */}
                    <View style={styles.cardSection}>
                        <TouchableOpacity style={styles.cardHeader} onPress={() => toggleSection('sales')}>
                            <Text style={styles.cardTitle}>🛍 Bán hàng</Text>
                            <Text style={styles.arrowIcon}>{expandedSections['sales'] ? '▲' : '▼'}</Text>
                        </TouchableOpacity>

                        {expandedSections['sales'] && (
                            <View style={styles.gridContainer}>
                                {renderGridItem('Giỏ hàng', '🛒', 'Pos', '#0288D1')}
                                {renderGridItem('Cắt liều', '✂️', '', '#F57C00')}
                                {renderGridItem('Trả hàng', '↩️', '', '#D32F2F')}
                                {renderGridItem('Tư vấn VX', '💉', '', '#0097A7')}
                                {renderGridItem('DS đơn VX', '📋', '', '#1976D2')}
                            </View>
                        )}
                    </View>

                    {/* Section: Nhập - Xuất */}
                    <View style={styles.cardSection}>
                        <TouchableOpacity style={styles.cardHeader} onPress={() => toggleSection('warehouse')}>
                            <Text style={styles.cardTitle}>📦 Nhập - xuất hàng</Text>
                            <Text style={styles.arrowIcon}>{expandedSections['warehouse'] ? '▲' : '▼'}</Text>
                        </TouchableOpacity>

                        {expandedSections['warehouse'] && (
                            <View style={styles.gridContainer}>
                                {renderGridItem('Xuất SD', '📤', 'Warehouse', '#FBC02D')}
                                {renderGridItem('Báo cáo', '📊', 'Report', '#388E3C')}
                            </View>
                        )}
                    </View>

                    {/* Section: Vận hành */}
                    <View style={styles.cardSection}>
                        <TouchableOpacity style={styles.cardHeader} onPress={() => toggleSection('operation')}>
                            <Text style={styles.cardTitle}>⚙️ Vận hành shop</Text>
                            <Text style={styles.arrowIcon}>{expandedSections['operation'] ? '▲' : '▼'}</Text>
                        </TouchableOpacity>
                        {expandedSections['operation'] && (
                            <View style={styles.gridContainer}>
                                {renderGridItem('Chấm công', '📅')}
                                {renderGridItem('KPI', '📈')}
                            </View>
                        )}
                    </View>

                    {/* Footer Image */}
                    <View style={styles.footerBanner}>
                        {/* Placeholder for Christmas banner */}
                        <Text style={{ color: '#999', fontSize: 12, textAlign: 'center' }}>Zyea Pharma System v2.0</Text>
                    </View>

                </ScrollView>
            </View>

            {/* 3. BOTTOM TAB NAVIGATION */}
            <View style={styles.bottomTab}>
                <TouchableOpacity style={styles.tabItemActive}>
                    <Text style={styles.tabIcon}>🏠</Text>
                    <Text style={styles.tabLabelActive}>Trang chủ</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.tabItem}>
                    <Text style={styles.tabIcon}>📄</Text>
                    <Text style={styles.tabLabel}>Đơn hàng</Text>
                </TouchableOpacity>

                {/* Center SCAN Button */}
                <TouchableOpacity style={styles.scanWrapper} onPress={() => navigation.navigate('Pos')}>
                    <View style={styles.scanBtn}>
                        <Text style={styles.scanBtnIcon}>📷</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.tabItem}>
                    <View>
                        <Text style={styles.tabIcon}>🔔</Text>
                        <View style={styles.tabBadge}><Text style={styles.badgeText}>3</Text></View>
                    </View>
                    <Text style={styles.tabLabel}>Thông báo</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.tabItem}>
                    <Text style={styles.tabIcon}>💬</Text>
                    <Text style={styles.tabLabel}>Hỗ trợ</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F2',
    },
    headerContainer: {
        backgroundColor: '#0D47A1', // Deep Blue Long Chau Style
        paddingBottom: 20,
        paddingHorizontal: 15,
        paddingTop: 10,
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
        marginTop: -10, // Overlap effect if wanted, but keep flat for now
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
    arrowIcon: {
        color: '#999',
        fontSize: 12,
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
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    iconText: {
        fontSize: 24,
    },
    gridTitle: {
        fontSize: 12,
        color: '#333',
        textAlign: 'center',
        fontWeight: '500',
    },
    footerBanner: {
        paddingVertical: 20,
        alignItems: 'center',
    },

    // Bottom Tab
    bottomTab: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        height: 65,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        alignItems: 'center',
    },
    tabItem: {
        alignItems: 'center',
        flex: 1,
    },
    tabItemActive: {
        alignItems: 'center',
        flex: 1,
    },
    tabIcon: {
        fontSize: 22,
        color: '#999',
        marginBottom: 3,
    },
    tabLabel: {
        fontSize: 10,
        color: '#999',
    },
    tabLabelActive: {
        fontSize: 10,
        color: '#0D47A1',
        fontWeight: 'bold',
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
        top: -20, // Float up
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
    scanBtnIcon: {
        fontSize: 28,
    }

});

export default HomeScreen;
