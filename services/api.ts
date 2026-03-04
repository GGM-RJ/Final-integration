
import { StockItem, TransferLog, User, ID } from '../types';

// DESATIVADO: A aplicação agora funciona 100% localmente via localStorage
export const USE_CLOUD_DB = false;

// Mantido apenas para evitar erros de importação, mas não será utilizado
export const apiService = {
    getStock: () => Promise.resolve([] as StockItem[]),
    addWine: (wine: StockItem) => Promise.resolve(wine),
    updateStockItem: (item: StockItem) => Promise.resolve(item),
    deleteWine: (id: ID) => Promise.resolve(),
    getTransfers: () => Promise.resolve([] as TransferLog[]),
    addTransfer: (transfer: TransferLog) => Promise.resolve(transfer),
    updateTransfer: (transfer: TransferLog) => Promise.resolve(transfer),
    getUsers: () => Promise.resolve([] as User[]),
    saveUser: (user: User) => Promise.resolve(user),
    updateUser: (user: User) => Promise.resolve(user),
    deleteUser: (id: ID) => Promise.resolve(),
};
