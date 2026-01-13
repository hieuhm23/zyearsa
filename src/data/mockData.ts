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
