
import { StockItem, ID } from '../types';
import { cosmosService } from './cosmosAdapter';
import { generateId } from '../utils/idGenerator';

const ENTITY = 'StockItem';

const getStock = async (): Promise<StockItem[]> => {
    return await cosmosService.getAll<StockItem>(ENTITY);
};

const addWine = async (newWine: Omit<StockItem, 'id'>): Promise<StockItem> => {
    const newStockItem: StockItem = {
        ...newWine,
        id: generateId(),
    };
    const created = await cosmosService.create<StockItem>(ENTITY, newStockItem);
    return created || newStockItem;
};

const updateItem = async (item: StockItem): Promise<void> => {
    await cosmosService.update<StockItem>(ENTITY, item.id, item);
};

const updateStock = async (updatedStock: StockItem[]): Promise<void> => {
    // SWA Data API doesn't support bulk update easily in one call via REST
    // For now, we update individually or just assume this is used sparingly
    for (const item of updatedStock) {
        await updateItem(item);
    }
};

const deleteWine = async (id: ID): Promise<void> => {
    await cosmosService.delete(ENTITY, id);
};

const addStockQuantity = async (id: ID, quantityToAdd: number): Promise<void> => {
    const item = await cosmosService.getById<StockItem>(ENTITY, id);
    if (item) {
        await cosmosService.update<StockItem>(ENTITY, id, { quantity: item.quantity + quantityToAdd });
    }
};

const removeStockQuantity = async (id: ID, quantityToRemove: number): Promise<void> => {
    const item = await cosmosService.getById<StockItem>(ENTITY, id);
    if (item) {
        const newQuantity = Math.max(0, item.quantity - quantityToRemove);
        await cosmosService.update<StockItem>(ENTITY, id, { quantity: newQuantity });
    }
};

const toggleLowStockAlert = async (id: ID, status: boolean): Promise<void> => {
    await cosmosService.update<StockItem>(ENTITY, id, { lowStockAlert: status });
};

export const stockService = {
    getStock,
    addWine,
    updateItem,
    updateStock,
    deleteWine,
    addStockQuantity,
    removeStockQuantity,
    toggleLowStockAlert,
};
