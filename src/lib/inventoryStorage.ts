'use client';

import { InventoryItem, Expense, InventoryTransaction } from './types';
import { inventory as initialInventory, getDishById } from './data';
import { addExpense } from './accountingStorage';

// Storage keys
const STORAGE_KEYS = {
    inventory: 'caterpro_inventory',
    inventory_initialized: 'caterpro_inventory_initialized',
    inventory_transactions: 'caterpro_inventory_transactions',
};

// Check if we're in browser
const isBrowser = typeof window !== 'undefined';

// Initialize storage
export const initializeInventoryStorage = (): void => {
    if (!isBrowser) return;

    const isInitialized = localStorage.getItem(STORAGE_KEYS.inventory_initialized);
    if (!isInitialized) {
        localStorage.setItem(STORAGE_KEYS.inventory, JSON.stringify(initialInventory));
        localStorage.setItem(STORAGE_KEYS.inventory_transactions, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.inventory_initialized, 'true');
    }
};

export const loadInventory = (): InventoryItem[] => {
    if (!isBrowser) return initialInventory;
    initializeInventoryStorage();
    const data = localStorage.getItem(STORAGE_KEYS.inventory);
    return data ? JSON.parse(data) : initialInventory;
};

export const loadInventoryTransactions = (): InventoryTransaction[] => {
    if (!isBrowser) return [];
    initializeInventoryStorage();
    const data = localStorage.getItem(STORAGE_KEYS.inventory_transactions);
    return data ? JSON.parse(data) : [];
};

export const saveInventory = (items: InventoryItem[]): void => {
    if (!isBrowser) return;
    localStorage.setItem(STORAGE_KEYS.inventory, JSON.stringify(items));
};

export const saveInventoryTransactions = (transactions: InventoryTransaction[]): void => {
    if (!isBrowser) return;
    localStorage.setItem(STORAGE_KEYS.inventory_transactions, JSON.stringify(transactions));
};

export const getInventoryItem = (id: string): InventoryItem | undefined => {
    const items = loadInventory();
    return items.find((i) => i.id === id);
};

export const logInventoryTransaction = (transaction: Omit<InventoryTransaction, 'id'>): InventoryTransaction => {
    const transactions = loadInventoryTransactions();
    const newTransaction: InventoryTransaction = {
        ...transaction,
        id: `inv-txn-${Date.now()}`,
    };
    transactions.unshift(newTransaction); // Add to beginning
    saveInventoryTransactions(transactions);
    return newTransaction;
};

export const updateStock = (id: string, quantityChange: number, reason: string): InventoryItem | null => {
    const items = loadInventory();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return null;

    const item = items[index];
    const newQuantity = item.quantity + quantityChange;

    items[index] = {
        ...item,
        quantity: newQuantity,
        lastUpdated: new Date().toISOString().split('T')[0],
    };

    saveInventory(items);
    return items[index];
};

export const updateInventoryItem = (id: string, updates: Partial<InventoryItem>): InventoryItem | null => {
    const items = loadInventory();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return null;

    items[index] = {
        ...items[index],
        ...updates,
        lastUpdated: new Date().toISOString().split('T')[0],
    };

    saveInventory(items);
    return items[index];
};

export const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'lastUpdated'>): InventoryItem => {
    const items = loadInventory();
    const newItem: InventoryItem = {
        ...item,
        id: `inv-${Date.now()}`,
        lastUpdated: new Date().toISOString().split('T')[0],
    };
    items.push(newItem);
    saveInventory(items);
    return newItem;
};

export const purchaseStock = (
    itemId: string,
    quantity: number,
    cost: number,
    vendorId?: string,
    createExpense: boolean = true
): InventoryItem | null => {
    const updatedItem = updateStock(itemId, quantity, 'purchase');

    if (updatedItem) {
        // Log Transaction
        logInventoryTransaction({
            itemId,
            itemName: updatedItem.name,
            type: 'purchase',
            quantity,
            unit: updatedItem.unit,
            date: new Date().toISOString().split('T')[0],
            cost,
        });

        if (createExpense) {
            addExpense({
                category: 'food_costs',
                description: `Purchase: ${updatedItem.name} (${quantity} ${updatedItem.unit})`,
                amount: cost,
                date: new Date().toISOString().split('T')[0],
                paymentMethod: 'cash', // Default
                vendor: 'Market Purchase', // Should Ideally come from vendorId
                isRecurring: false,
                tags: ['inventory', 'purchase'],
            });
        }
    }

    return updatedItem;
};

// Reset function for demo purposes
export const resetInventory = (): void => {
    if (!isBrowser) return;
    localStorage.removeItem(STORAGE_KEYS.inventory_initialized);
    initializeInventoryStorage();
};

export const deductStockForEvent = (eventId: string, eventName: string, dishQuantities: Record<string, number>): void => {
    // We iterate through dishes and ingredients to deduct stock
    Object.entries(dishQuantities).forEach(([dishId, quantity]) => {
        const dish = getDishById(dishId);
        if (!dish) return;

        dish.ingredients.forEach((ing) => {
            const item = getInventoryItem(ing.inventoryItemId);
            if (!item) return;

            // Calculate deduction quantity in item's unit
            let deduction = ing.quantity * quantity;

            // Simple unit conversion handling
            if (item.unit === 'kg' && ing.unit === 'g') deduction /= 1000;
            else if (item.unit === 'liters' && ing.unit === 'ml') deduction /= 1000;
            // Add other conversions if needed

            if (deduction > 0) {
                // Update Stock
                // We use -deduction to subtract
                updateStock(item.id, -deduction, `Event: ${eventName}`);

                // Log Transaction
                logInventoryTransaction({
                    itemId: item.id,
                    itemName: item.name,
                    type: 'usage',
                    quantity: deduction,
                    unit: item.unit,
                    date: new Date().toISOString().split('T')[0],
                    eventId,
                    reason: `Used in ${dish.name} for ${eventName}`,
                });
            }
        });
    });
};
