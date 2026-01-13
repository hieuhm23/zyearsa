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
        name: 'Panadol Extra (Đỏ)',
        desc: 'Paracetamol 500mg',
        category: 'gn',
        image: 'https://cdn.nhathuoclongchau.com.vn/unsafe/375x0/filters:quality(90)/httpscms-prod.s3-sgn09.fptcloud.com/DSCF_5852_4057881075.jpg',
        stock: 2400, // Tổng số viên
        expDate: '12/2026',
        // Cấu hình nhiều đơn vị tính
        units: [
            { name: 'Viên', price: 1500 },
            { name: 'Vỉ (12v)', price: 18000 },
            { name: 'Hộp (10 vỉ)', price: 175000 }
        ]
    },
    {
        id: 'T002',
        name: 'Augmentin 625mg',
        desc: 'Amoxicillin + Clavulanic',
        category: 'ks',
        image: 'https://cdn.nhathuoclongchau.com.vn/unsafe/375x0/filters:quality(90)/httpscms-prod.s3-sgn09.fptcloud.com/DSCF_0428_e409605786.jpg',
        stock: 50,
        expDate: '05/2025',
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
        image: 'https://thuocdantoc.org/wp-content/uploads/2019/10/berberin-moc-huong-l.jpg',
        stock: 120,
        expDate: '10/2027',
        units: [
            { name: 'Lọ 100v', price: 50000 },
            { name: 'Lọ 50v', price: 30000 }
        ]
    },
    {
        id: 'T004',
        name: 'Vitamin C Enervon',
        desc: 'Tăng sức đề kháng',
        category: 'vit',
        image: 'https://nhathuoclongchau.com.vn/images/product/2020/09/enervon-c-100v-dhg-2139-6184_large.jpg',
        stock: 500,
        expDate: '01/2026',
        units: [
            { name: 'Viên', price: 3500 },
            { name: 'Vỉ (10v)', price: 32000 },
            { name: 'Hộp (100v)', price: 300000 }
        ]
    },
    {
        id: 'T005',
        name: 'Khẩu trang Y tế 4 lớp',
        desc: 'Hộp 50 chiếc - Kháng khuẩn',
        category: 'yt',
        image: 'https://cdn.tgdd.vn/Products/Images/10202/235787/khau-trang-y-te-famapro-vn95-hop-10-cai-thumb-600x600.jpg',
        stock: 80,
        expDate: 'N/A',
        units: [
            { name: 'Chiếc', price: 1000 },
            { name: 'Hộp (50c)', price: 45000 }
        ]
    },
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
        name: 'Dung dịch vệ sinh phụ nữ Dạ Hương',
        activeIngredient: 'Muối, Lô hội',
        concentration: '100ml',
        unit: 'Chai',
        image: 'https://cdn.nhathuoclongchau.com.vn/unsafe/800x0/https://cms-prod.s3-sgn09.fptcloud.com/00006248_da_huong_100ml_xanh_3489_615c_large_cb6d0794fd.jpg',
        manufacturer: 'Hoa Linh'
    }
];
