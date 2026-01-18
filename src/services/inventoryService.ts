import { supabase } from '../lib/supabase';

export type ProductUnit = {
    id: string;
    unit_name: string;
    price: number;
    conversion_rate: number;
    is_base_unit: boolean;
};

export type Product = {
    id: string;
    barcode: string;
    name: string;
    brand: string;
    category: string;
    stock: number;
    image_url: string;
    units?: ProductUnit[];
};

export const inventoryService = {
    // Lấy danh sách thuốc (kèm đơn vị tính)
    getProducts: async (searchQuery: string = '') => {
        let query = supabase
            .from('products')
            .select(`
                *,
                units:product_units(*)
            `)
            .order('name', { ascending: true });

        if (searchQuery) {
            query = query.or(`name.ilike.%${searchQuery}%,barcode.ilike.%${searchQuery}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as Product[];
    },

    // Thêm hoặc cập nhật thuốc
    upsertProduct: async (product: Partial<Product>, units: Partial<ProductUnit>[]) => {
        // 1. Lưu thông tin thuốc
        const { data: prodData, error: prodError } = await supabase
            .from('products')
            .upsert(product)
            .select()
            .single();

        if (prodError) throw prodError;

        // 2. Nếu là cập nhật, xóa các đơn vị cũ trước để tránh rác SQL
        if (product.id) {
            await supabase.from('product_units').delete().eq('product_id', product.id);
        }

        // 3. Lưu các đơn vị tính mới
        if (units && units.length > 0) {
            const unitsWithProdId = units.map(u => {
                const { id, ...unitData } = u; // Loại bỏ id cũ để tạo mới hoặc để DB tự quản lý
                return { ...unitData, product_id: prodData.id };
            });
            const { error: unitError } = await supabase
                .from('product_units')
                .insert(unitsWithProdId);

            if (unitError) throw unitError;
        }

        return prodData;
    },

    // Xóa thuốc (Xóa triệt để cả ở bảng products và bảng units liên quan)
    deleteProduct: async (id: string) => {
        // Xóa units trước (đề phòng DB không tự động cascade)
        const { error: unitError } = await supabase.from('product_units').delete().eq('product_id', id);
        if (unitError) console.warn('Lỗi xóa units:', unitError);

        // Xóa sản phẩm chính
        const { error: prodError } = await supabase.from('products').delete().eq('id', id);
        if (prodError) throw prodError;
    }
};
