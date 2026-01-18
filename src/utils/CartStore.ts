import { DeviceEventEmitter } from 'react-native';

class CartStore {
    private static instance: CartStore;
    private items: any[] = [];
    private listeners: Function[] = [];

    private constructor() { }

    public static getInstance(): CartStore {
        if (!CartStore.instance) {
            CartStore.instance = new CartStore();
        }
        return CartStore.instance;
    }

    public addItem(item: any) {
        // Deep copy safely
        try {
            const safeItem = JSON.parse(JSON.stringify(item));
            this.items.push(safeItem);
            this.notifyListeners();
            console.log('CartStore: Item added', safeItem.comboName || safeItem.name);
        } catch (e) {
            console.error('CartStore Error:', e);
        }
    }

    public getItems(): any[] {
        return [...this.items];
    }

    public clear() {
        this.items = [];
        this.notifyListeners();
    }

    public subscribe(listener: Function) {
        this.listeners.push(listener);
        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notifyListeners() {
        this.listeners.forEach(listener => listener(this.items));
        // Also emit event safely
        DeviceEventEmitter.emit('CART_UPDATED', this.items);
    }
}

export default CartStore;
