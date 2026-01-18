import { supabase } from '../lib/supabase';

export const orderService = {
    // Tạo hóa đơn mới
    createOrder: async (orderData: {
        total_amount: number,
        discount: number,
        payment_method: string,
        staff_name?: string,
        items: any[]
    }) => {
        console.log('Creating order with data:', JSON.stringify(orderData));

        // 1. Lưu hóa đơn chính
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                total_amount: orderData.total_amount,
                discount: orderData.discount,
                payment_method: orderData.payment_method,
                staff_name: orderData.staff_name || 'Nhân viên'
            })
            .select()
            .single();

        if (orderError) {
            console.error('Order insert error:', orderError);
            throw new Error(`Lỗi tạo đơn: ${orderError.message}`);
        }

        console.log('Order created:', order);

        // 2. Lưu chi tiết hàng hóa và Trừ kho
        for (const item of orderData.items) {
            console.log('Processing item:', item);

            // Lưu chi tiết - SỬ DỤNG TÊN SẢN PHẨM
            const { error: itemError } = await supabase.from('order_items').insert({
                order_id: order.id,
                product_id: item.id,
                product_name: item.name || 'Sản phẩm', // LƯU TÊN SẢN PHẨM
                quantity: item.qty,
                unit_name: item.unit,
                price_at_sale: item.price
            });

            if (itemError) {
                console.error('Order item insert error:', itemError);
                // Continue anyway - don't fail the whole order
            }

            // Trừ kho - tính đúng số lượng theo đơn vị gốc
            const stockToDeduct = item.qty * (item.conversionRate || 1);
            const { data: prod, error: prodError } = await supabase.from('products').select('stock').eq('id', item.id).single();
            if (prodError) {
                console.error('Product fetch error:', prodError);
            }
            if (prod) {
                const newStock = prod.stock - stockToDeduct;
                console.log(`Updating stock for ${item.name}: ${prod.stock} -> ${newStock} (deducted ${stockToDeduct})`);
                await supabase.from('products').update({ stock: newStock }).eq('id', item.id);
            }
        }

        return order;
    },

    // Lấy lịch sử đơn hàng
    getOrders: async () => {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items(*)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }
};
