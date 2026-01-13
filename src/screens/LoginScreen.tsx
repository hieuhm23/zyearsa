import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Image
} from 'react-native';

const LoginScreen = ({ navigation }: any) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        navigation.replace('Home');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.logoContainer}>
                    {/* Medical Cross Icon Symbol */}
                    <View style={styles.logoIcon}>
                        <Text style={{ fontSize: 50 }}>⚕️</Text>
                    </View>
                    <Text style={styles.logoText}>ZYEA PHARMA</Text>
                    <Text style={styles.subLogoText}>Hệ thống bán lẻ thuốc chuẩn GPP</Text>
                </View>

                <View style={styles.formCard}>
                    <Text style={styles.welcomeText}>Đăng nhập Dược sĩ</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>MÃ DƯỢC SĨ</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập mã nhân viên..."
                            placeholderTextColor="#999"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="characters"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>MẬT KHẨU</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="******"
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                        <Text style={styles.loginButtonText}>VÀO CA LÀM VIỆC</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>© 2026 Zyea Tech Medical System</Text>
                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA', // Màu nền xám xanh nhạt rất dịu
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 25,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoIcon: {
        width: 100,
        height: 100,
        backgroundColor: '#E1F5FE',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    logoText: {
        fontSize: 32,
        fontWeight: '800',
        color: '#0277BD', // Xanh y tế đậm
        letterSpacing: 1,
    },
    subLogoText: {
        fontSize: 14,
        color: '#555',
        marginTop: 5,
    },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
    },
    welcomeText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 25,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        color: '#0277BD',
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#F0F4F8',
        height: 50,
        borderRadius: 10,
        paddingHorizontal: 15,
        color: '#333',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E1E8ED',
    },
    loginButton: {
        backgroundColor: '#0288D1', // Brand color
        height: 55,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
        shadowColor: '#0288D1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        width: '100%',
        alignSelf: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: '#999',
        fontSize: 12
    }
});

export default LoginScreen;
