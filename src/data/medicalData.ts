// Medical Knowledge Base for AI Assistant

export const SYMPTOMS = [
    { id: 's1', name: 'Sốt cao', keywords: ['sốt', 'nóng', 'nhiệt độ'] },
    { id: 's2', name: 'Đau đầu', keywords: ['nhức đầu', 'đau đầu'] },
    { id: 's3', name: 'Ho khan', keywords: ['ho', 'ngứa họng'] },
    { id: 's4', name: 'Ho có đờm', keywords: ['đờm', 'ho đờm'] },
    { id: 's5', name: 'Sổ mũi', keywords: ['chảy mũi', 'nghẹt mũi', 'sổ mũi'] },
    { id: 's6', name: 'Đau bụng', keywords: ['đau bụng', 'tiêu chảy', 'đi ngoài'] },
    { id: 's7', name: 'Đau dạ dày', keywords: ['bao tử', 'ợ chua', 'dạ dày'] },
    { id: 's8', name: 'Mất ngủ', keywords: ['khó ngủ', 'mất ngủ'] },
];

export const DISEASES_KNOWLEDGE = [
    {
        id: 'd1',
        name: 'Cảm Cúm Thông Thường',
        matchSymptoms: ['s1', 's2', 's5'], // Sốt, Đau đầu, Sổ mũi
        description: 'Do virus gây ra, thường tự khỏi sau 5-7 ngày.',
        advice: 'Uống nhiều nước, nghỉ ngơi, ăn dồ dễ tiêu.',
        prescription: [
            { id: 'T001', name: 'Panadol Extra', dose: 'Sáng 1, Tối 1', note: 'Hạ sốt giảm đau' },
            { id: 'T003', name: 'Vitamin C 500mg', dose: 'Sáng 1', note: 'Tăng đề kháng' },
            { id: 'T005', name: 'Decolgen', dose: 'Sáng 1, Tối 1', note: 'Giảm sổ mũi' }
        ]
    },
    {
        id: 'd2',
        name: 'Viêm Họng Cấp',
        matchSymptoms: ['s1', 's3'], // Sốt, Ho khan
        description: 'Viêm niêm mạc họng, thường kèm đau rát họng.',
        advice: 'Súc miệng nước muối 2h/lần, hạn chế đá lạnh.',
        prescription: [
            { id: 'K001', name: 'Augmentin 625mg', dose: 'Sáng 1, Chiều 1', note: 'Kháng sinh (cần kê đơn)' },
            { id: 'T001', name: 'Panadol', dose: 'Khi sốt > 38.5', note: 'Hạ sốt' },
            { id: 'S001', name: 'Siro Ho Bảo Thanh', dose: 'Sáng 10ml, Tối 10ml', note: 'Giảm ho' }
        ]
    },
    {
        id: 'd3',
        name: 'Rối Loạn Tiêu Hóa',
        matchSymptoms: ['s6'], // Đau bụng
        description: 'Do ăn uống không vệ sinh hoặc lạnh bụng.',
        advice: 'Ăn chín uống sôi, kiêng dầu mỡ, sữa.',
        prescription: [
            { id: 'T008', name: 'Men vi sinh Enterogermina', dose: 'Sáng 1 ống, Tối 1 ống', note: 'Cân bằng khuẩn ruột' },
            { id: 'T009', name: 'Smecta', dose: 'Pha 1 gói khi đau/tiêu chảy', note: 'Cầm tiêu chảy' }
        ]
    }
];

export const DRUG_INTERACTIONS = [
    {
        pair: ['T001', 'K001'], // Ví dụ tương tác giả định
        severity: 'LOW',
        warning: 'Uống cách nhau 2h để tránh giảm hấp thu.'
    },
    // Thêm các cặp tương tác thực tế sau
];
