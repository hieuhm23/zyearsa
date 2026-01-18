import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    Alert,
    StatusBar,
    ScrollView,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Updates from 'expo-updates';

const SettingsScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [faceIdEnabled, setFaceIdEnabled] = useState(false);
    const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

    const handleCheckUpdate = async () => {
        setIsCheckingUpdate(true);
        try {
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
                Alert.alert(
                    'Cập nhật mới!',
                    'Có phiên bản mới. Bạn có muốn cập nhật ngay?',
                    [
                        { text: 'Để sau', style: 'cancel' },
                        {
                            text: 'Cập nhật',
                            onPress: async () => {
                                await Updates.fetchUpdateAsync();
                                await Updates.reloadAsync();
                            },
                        },
                    ]
                );
            } else {
                Alert.alert('Đã cập nhật', 'Ứng dụng đang ở phiên bản mới nhất!');
            }
        } catch (e: any) {
            Alert.alert('Lỗi', 'Không thể kiểm tra cập nhật: ' + e.message);
        }
        setIsCheckingUpdate(false);
    };

    const handleLogout = () => {
        Alert.alert(
            'Đăng xuất',
            'Bạn có chắc muốn đăng xuất?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Đăng xuất',
                    style: 'destructive',
                    onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }),
                },
            ]
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="light-content" backgroundColor="#0D47A1" />

            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>

                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <MaterialCommunityIcons name="robot-happy" size={50} color="#fff" />
                    </View>
                    <Text style={styles.userName}>Hoàng Minh Hiếu - 65680</Text>
                    <Text style={styles.userAddress}>LC HN1 15 Hoàng Như Tiếp, P. Bồ Đề</Text>
                </View>
            </View>

            {/* CONTENT */}
            <ScrollView style={styles.content}>
                {/* System Settings */}
                <Text style={styles.sectionTitle}>Cài đặt hệ thống</Text>

                {/* Face ID */}
                <View style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
                            <MaterialCommunityIcons name="face-recognition" size={24} color="#1565C0" />
                        </View>
                        <Text style={styles.settingText}>Đăng nhập với Face ID</Text>
                    </View>
                    <Switch
                        value={faceIdEnabled}
                        onValueChange={setFaceIdEnabled}
                        trackColor={{ false: '#ddd', true: '#0288D1' }}
                        thumbColor={faceIdEnabled ? '#fff' : '#f4f3f4'}
                    />
                </View>

                {/* Update App */}
                <TouchableOpacity style={styles.settingItem} onPress={handleCheckUpdate} disabled={isCheckingUpdate}>
                    <View style={styles.settingLeft}>
                        <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
                            <MaterialCommunityIcons name="update" size={24} color="#2E7D32" />
                        </View>
                        <View>
                            <Text style={styles.settingText}>Cập nhật ứng dụng</Text>
                            <Text style={styles.settingSubText}>
                                {isCheckingUpdate ? 'Đang kiểm tra...' : 'Phiên bản: 1.0.1'}
                            </Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>

                {/* Logout */}
                <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
                    <View style={styles.settingLeft}>
                        <View style={[styles.iconBox, { backgroundColor: '#FFEBEE' }]}>
                            <MaterialCommunityIcons name="logout" size={24} color="#D32F2F" />
                        </View>
                        <Text style={[styles.settingText, { color: '#D32F2F' }]}>Đăng xuất</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0D47A1' },

    // Header
    header: {
        backgroundColor: '#0D47A1',
        paddingBottom: 30,
        alignItems: 'center',
    },
    backBtn: {
        position: 'absolute',
        left: 15,
        top: 10,
        padding: 5,
    },
    profileSection: {
        alignItems: 'center',
        marginTop: 20,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    userAddress: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
    },

    // Content
    content: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingTop: 20,
    },
    sectionTitle: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
        marginHorizontal: 20,
        marginBottom: 10,
        marginTop: 10,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        paddingVertical: 14,
        paddingHorizontal: 20,
        marginHorizontal: 15,
        marginBottom: 8,
        borderRadius: 12,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingText: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
    settingSubText: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
});

export default SettingsScreen;
