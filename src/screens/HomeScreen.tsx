import React, { useState } from 'react';
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

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();

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
                // console.log('Coming soon: ' + item.title);
            }
        }
    };

    const renderGridItem = (title: string, iconName: keyof typeof MaterialCommunityIcons.glyphMap, color: string, screen: string = '') => (
        <TouchableOpacity style={styles.gridItem} onPress={() => handlePress({ screen, title })}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                <MaterialCommunityIcons name={iconName} size={28} color={color} />
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
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>H</Text>
                    </View>
                    <View style={styles.userDetail}>
                        <Text style={styles.userName}>Hoàng Minh Hiếu - 65680</Text>
                        <Text style={styles.userAddress}>81362 - LC HNI 15 Hoàng Như Tiếp, P. Bồ Đề</Text>
                    </View>
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
                            { renderGridItem('Giỏ hàng', 'cart-outline', '#0288D1', 'Pos')}
                        {renderGridItem('Cắt liều', 'content-cut', '#F57C00')}
                        {renderGridItem('Trả hàng', 'keyboard-return', '#D32F2F')}
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
                        {renderGridItem('Xuất SD', 'export', '#FBC02D', 'Warehouse')}
                        {renderGridItem('Báo cáo', 'chart-bar', '#388E3C', 'Report')}
                    </View>
                )}
            </View>

            {/* Section: Vận hành */}
            <View style={styles.cardSection}>
                <TouchableOpacity style={styles.cardHeader} onPress={() => toggleSection('operation')}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialCommunityIcons name="cog" size={18} color="#607D8B" style={{ marginRight: 6 }} />
                        <Text style={styles.cardTitle}>Vận hành shop</Text>
                    </View>
                    <Ionicons name={expandedSections['operation'] ? "chevron-up" : "chevron-down"} size={20} color="#999" />
                </TouchableOpacity>
                {expandedSections['operation'] && (
                    <View style={styles.gridContainer}>
                        {renderGridItem('Chấm công', 'calendar-clock', '#5C6BC0')}
                        {renderGridItem('KPI', 'target', '#EC407A')}
                    </View>
                )}
            </View>

            {/* Footer Image */}
            <View style={styles.footerBanner}>
                <Text style={{ color: '#999', fontSize: 12, textAlign: 'center' }}>Zyea Pharma System v2.0</Text>
            </View>

        </ScrollView>
            </View >

    {/* 3. BOTTOM TAB NAVIGATION */ }
{/* Dynamic paddingBottom based on Safe Area Insets */ }
<View style={[styles.bottomTab, { paddingBottom: Math.max(insets.bottom, 10), height: 60 + Math.max(insets.bottom, 10) }]}>
    <TouchableOpacity style={styles.tabItemActive}>
        <Ionicons name="home" size={24} color="#0D47A1" />
        <Text style={styles.tabLabelActive}>Trang chủ</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.tabItem}>
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
        width: 50,
        height: 50,
        borderRadius: 16, // Bo góc mềm hơn chút (Squircle)
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
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
