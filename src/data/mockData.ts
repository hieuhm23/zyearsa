// Medical Theme Mock Data with Multi-Units
export const CATEGORIES = [
    { id: 'all', name: 'Tất cả thuốc' },
    { id: 'ks', name: 'Kháng sinh' },
    { id: 'gn', name: 'Giảm đau/Hạ sốt' },
    { id: 'tieuhoa', name: 'Tiêu hóa' },
    { id: 'vit', name: 'Vitamin & TPCN' },
    { id: 'yt', name: 'Vật tư Y tế' },
];

export const PRODUCTS = [
    {
        id: 'T001',
        barcode: '8934588063176',
        name: 'Panadol Extra (Đỏ)',
        desc: 'Paracetamol 500mg - Giảm đau hạ sốt',
        category: 'gn',
        isHot: true,
        isPrescription: false,
        image: 'https://placehold.co/200x200/E53935/FFFFFF?text=Panadol',
        stock: 2400,
        expiryDate: '2027-12-01',
        caution: '⚠️ Lưu ý: Không dùng quá 8 viên/ngày. Thận trọng với người suy gan.',
        origin: 'Việt Nam',
        usage: 'Uống sau khi ăn. Người lớn 1-2 viên/lần, cách nhau 4-6 giờ.',
        units: [
            { name: 'Viên', price: 1500 },
            { name: 'Vỉ (12v)', price: 18000 },
            { name: 'Hộp (10 vỉ)', price: 175000 }
        ]
    },
    {
        id: 'T002',
        name: 'Augmentin 625mg',
        desc: 'Amoxicillin + Clavulanic - Kháng sinh',
        category: 'ks',
        isHot: true,
        isPrescription: true,
        image: 'https://placehold.co/200x200/1976D2/FFFFFF?text=Augmentin',
        stock: 8, // Thấp
        expiryDate: '2026-06-15',
        caution: '⛔ TRÁNH DÙNG: Người dị ứng Penicillin. Gây tiêu chảy.',
        units: [
            { name: 'Viên', price: 12000 },
            { name: 'Vỉ (7v)', price: 80000 },
            { name: 'Hộp (2 vỉ)', price: 155000 }
        ]
    },
    {
        id: 'T003',
        name: 'Berberin Mộc Hương',
        desc: 'Trị tiêu chảy, đau bụng',
        category: 'tieuhoa',
        image: 'https://placehold.co/200x200/388E3C/FFFFFF?text=Berberin',
        stock: 120,
        expiryDate: '2027-10-01',
        caution: '🚫 Phụ nữ mang thai TUYỆT ĐỐI KHÔNG DÙNG.',
        units: [
            { name: 'Lọ 100v', price: 50000 }
        ]
    },
    {
        id: 'T004',
        name: 'Cefixim 200mg',
        desc: 'Kháng sinh thế hệ 3',
        category: 'ks',
        image: 'https://placehold.co/200x200/FFC107/FFFFFF?text=Cefixim',
        stock: 500,
        expiryDate: '2026-03-30', // Sắp hết hạn
        caution: '⚠️ Nguy hại thận. Cần uống nhiều nước.',
        units: [
            { name: 'Viên', price: 6000 },
            { name: 'Vỉ (10v)', price: 55000 }
        ]
    },
    {
        id: 'T005',
        name: 'Khẩu trang Y tế 4 lớp',
        desc: 'Hộp 50 chiếc - Kháng khuẩn',
        category: 'yt',
        image: 'https://placehold.co/200x200/00ACC1/FFFFFF?text=Khau+trang',
        stock: 80,
        expiryDate: '2028-01-01',
        caution: '',
        units: [
            { name: 'Chiếc', price: 1000 },
            { name: 'Hộp (50c)', price: 45000 }
        ]
    }
];

// Dữ liệu Chuẩn Quốc Gia (Giả lập) - Master Data
// Đây là danh mục thuốc chuẩn, giúp người dùng không phải gõ tay
export const GLOBAL_DRUG_DATABASE = [
    {
        id: '8934560000000', // Mã vạch giả định
        name: 'Efferalgan 500mg (Sủi)',
        activeIngredient: 'Paracetamol',
        concentration: '500mg',
        unit: 'Hộp',
        image: 'https://cdn.nhathuoclongchau.com.vn/unsafe/800x0/https://cms-prod.s3-sgn09.fptcloud.com/00000862_efferalgan_500mg_bristol_myers_squibb_16vien_sui_9029_60fd_large_1549646b14.jpg',
        manufacturer: 'UPSA (Pháp)'
    },
    {
        id: '8939998887776',
        name: 'Smecta (Thuốc bột pha)',
        activeIngredient: 'Diosmectite',
        concentration: '3g',
        unit: 'Hộp',
        image: 'https://cdn.nhathuoclongchau.com.vn/unsafe/800x0/https://cms-prod.s3-sgn09.fptcloud.com/00000857_smecta_3g_6970_62ce_large_79a78182b8.jpg',
        manufacturer: 'Ipsen (Pháp)'
    },
    {
        id: '8931234567890',
        name: 'Berocca Performance Mango',
        activeIngredient: 'Vitamin tổng hợp',
        concentration: '',
        unit: 'Tuýp',
        image: 'https://cdn.nhathuoclongchau.com.vn/unsafe/800x0/https://cms-prod.s3-sgn09.fptcloud.com/00017122_berocca_performance_mango_10v_8231_6071_large_0ec3c53018.jpg',
        manufacturer: 'Bayer'
    },
    {
        id: '8938887776665',
        barcode: '8938887776665',
        name: 'Dung dịch vệ sinh phụ nữ Dạ Hương',
        activeIngredient: 'Muối, Lô hội',
        concentration: '100ml',
        unit: 'Chai',
        image: 'https://cdn.nhathuoclongchau.com.vn/unsafe/800x0/https://cms-prod.s3-sgn09.fptcloud.com/00006248_da_huong_100ml_xanh_3489_615c_large_cb6d0794fd.jpg',
        manufacturer: 'Hoa Linh'
    }
];
