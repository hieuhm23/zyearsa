import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList,
    KeyboardAvoidingView, Platform, Image, ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AIDoctorScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<any[]>([
        { id: '1', type: 'bot', text: 'Xin chào! Tôi là AI Dược sĩ. Tôi có thể giúp gì cho bạn hôm nay?\n(Tra cứu thuốc, tương tác thuốc, gợi ý đơn...)' }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const handleSend = () => {
        if (!message.trim()) return;

        const userMsg = { id: Date.now().toString(), type: 'user', text: message };
        setChatHistory(prev => [...prev, userMsg]);
        setMessage('');
        setIsTyping(true);

        // Fake AI response
        setTimeout(() => {
            const botResponse = generateFakeResponse(userMsg.text);
            setChatHistory(prev => [...prev, { id: (Date.now() + 1).toString(), type: 'bot', text: botResponse }]);
            setIsTyping(false);
        }, 1500);
    };

    const generateFakeResponse = (text: string) => {
        const lower = text.toLowerCase();
        if (lower.includes('đau đầu') || lower.includes('sốt')) {
            return "Với triệu chứng sốt và đau đầu, bạn có thể kê:\n\n1. Paracetamol 500mg: 1 viên x 3 lần/ngày.\n2. Bổ sung Vitamin C để tăng đề kháng.\n\n⚠️ Lưu ý: Nếu sốt trên 3 ngày không giảm, cần khuyến cáo khách đi viện.";
        }
        if (lower.includes('đau bụng')) {
            return "Khách đau bụng vùng nào ạ?\n- Nếu đau thượng vị: Có thể do dạ dày (Gợi ý: Phosphalugel, Omeprazol).\n- Nếu đau quặn, đi ngoài: Có thể rối loạn tiêu hóa (Gợi ý: Berberin, Smecta).\n\nBạn hãy hỏi thêm khách về thói quen ăn uống gần đây nhé.";
        }
        if (lower.includes('xin chào') || lower.includes('hello')) {
            return "Chào bạn! Chúc bạn một ngày làm việc hiệu quả. Cần tra cứu gì cứ hỏi mình nhé! 💊";
        }
        return "Xin lỗi, tôi chưa hiểu rõ câu hỏi. Bạn có thể hỏi cụ thể hơn về triệu chứng hoặc tên thuốc không?";
    };

    const renderItem = ({ item }: { item: any }) => {
        const isBot = item.type === 'bot';
        return (
            <View style={[styles.msgRow, isBot ? styles.msgRowBot : styles.msgRowUser]}>
                {isBot && (
                    <View style={styles.botAvatar}>
                        <MaterialCommunityIcons name="robot" size={24} color="#fff" />
                    </View>
                )}
                <View style={[styles.msgBubble, isBot ? styles.msgBubbleBot : styles.msgBubbleUser]}>
                    <Text style={[styles.msgText, isBot ? styles.msgTextBot : styles.msgTextUser]}>{item.text}</Text>
                </View>
            </View>
        );
    };

    useEffect(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
    }, [chatHistory, isTyping]);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} color="#fff" />
                </TouchableOpacity>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={styles.headerTitle}>AI Dược Sĩ 🤖</Text>
                    <Text style={styles.headerSubtitle}>Trợ lý ảo thông minh 24/7</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {/* Chat Content */}
            <FlatList
                ref={flatListRef}
                data={chatHistory}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 15, paddingBottom: 20 }}
                ListFooterComponent={isTyping ? (
                    <View style={styles.msgRowBot}>
                        <View style={styles.botAvatar}>
                            <MaterialCommunityIcons name="robot" size={24} color="#fff" />
                        </View>
                        <View style={[styles.msgBubbleBot, { width: 60, alignItems: 'center' }]}>
                            <ActivityIndicator size="small" color="#009688" />
                        </View>
                    </View>
                ) : null}
            />

            {/* Input Area */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
                <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 10 }]}>
                    <TextInput
                        style={styles.input}
                        placeholder="Nhập triệu chứng hoặc tên thuốc..."
                        value={message}
                        onChangeText={setMessage}
                        multiline
                    />
                    <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                        <Ionicons name="send" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#E0F2F1' },
    header: { backgroundColor: '#009688', flexDirection: 'row', alignItems: 'center', paddingBottom: 15, paddingHorizontal: 15, elevation: 4 },
    backBtn: { padding: 5 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    headerSubtitle: { color: '#E0F2F1', fontSize: 12 },

    msgRow: { flexDirection: 'row', marginBottom: 15 },
    msgRowBot: { justifyContent: 'flex-start' },
    msgRowUser: { justifyContent: 'flex-end' },

    botAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#00796B', justifyContent: 'center', alignItems: 'center', marginRight: 8, marginTop: 2 },

    msgBubble: { maxWidth: '75%', padding: 12, borderRadius: 16 },
    msgBubbleBot: { backgroundColor: '#fff', borderTopLeftRadius: 4 },
    msgBubbleUser: { backgroundColor: '#009688', borderTopRightRadius: 4 },

    msgText: { fontSize: 15, lineHeight: 22 },
    msgTextBot: { color: '#333' },
    msgTextUser: { color: '#fff' },

    inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee', alignItems: 'flex-end' },
    input: { flex: 1, backgroundColor: '#F5F5F5', borderRadius: 20, paddingHorizontal: 15, paddingTop: 10, paddingBottom: 10, maxHeight: 100, fontSize: 15 },
    sendBtn: { width: 44, height: 44, backgroundColor: '#009688', borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
});

export default AIDoctorScreen;
