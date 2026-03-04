
import { TransferLog } from '../types';
import { cosmosService } from './cosmosAdapter';
import { generateId } from '../utils/idGenerator';

const ENTITY = 'TransferLog';

const getTransferHistory = async (): Promise<TransferLog[]> => {
    const history = await cosmosService.getAll<TransferLog>(ENTITY);
    // Ensure dates are actual Date objects
    return history.map(h => ({...h, date: new Date(h.date)}));
};

const addTransfer = async (newLog: TransferLog): Promise<void> => {
    const logWithId = {
        ...newLog,
        id: newLog.id || generateId()
    };
    await cosmosService.create<TransferLog>(ENTITY, logWithId);
};

const updateTransfer = async (updatedLog: TransferLog): Promise<void> => {
    await cosmosService.update<TransferLog>(ENTITY, updatedLog.id, updatedLog);
}

export const transferService = {
    getTransferHistory,
    addTransfer,
    updateTransfer,
};
