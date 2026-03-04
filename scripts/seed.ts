import { CosmosClient } from '@azure/cosmos';
import * as dotenv from 'dotenv';
import { initialStock } from '../data/wines';
import { users as initialUsers } from '../data/users';
import { quintas as initialQuintas } from '../data/quintas';
import { initialTransfers } from '../data/transfers';

dotenv.config();

const connectionString = process.env.COSMOSDB_CONNECTION_STRING;
const databaseName = 'VinhoStockDB';

const entityToContainer: { [key: string]: string } = {
    'StockItem': 'stock',
    'TransferLog': 'transfers',
    'User': 'users',
    'Quinta': 'quintas'
};

async function seed() {
    if (!connectionString) {
        console.error('ERROR: COSMOSDB_CONNECTION_STRING not found in environment variables.');
        process.exit(1);
    }

    const client = new CosmosClient(connectionString);
    
    try {
        console.log(`[SEED] Ensuring database "${databaseName}" exists...`);
        const { database } = await client.databases.createIfNotExists({ id: databaseName });
        console.log(`[SEED] Database "${databaseName}" is ready.`);
        
        const containers = Object.values(entityToContainer);
        for (const containerId of containers) {
            console.log(`[SEED] Ensuring container "${containerId}" exists...`);
            await database.containers.createIfNotExists({ 
                id: containerId, 
                partitionKey: { paths: ['/id'] } 
            });
            console.log(`[SEED] Container "${containerId}" is ready.`);
        }
        
        // Seed Quintas
        const quintasContainer = database.container('quintas');
        const { resources: existingQuintas } = await quintasContainer.items.readAll().fetchAll();
        if (existingQuintas.length === 0) {
            console.log('[SEED] Seeding initial quintas...');
            for (const q of initialQuintas) {
                await quintasContainer.items.create(q);
            }
        }

        // Seed Users
        const usersContainer = database.container('users');
        const { resources: existingUsers } = await usersContainer.items.readAll().fetchAll();
        if (existingUsers.length === 0) {
            console.log('[SEED] Seeding initial users...');
            for (const u of initialUsers) {
                const userToCreate = { ...u, id: u.id.toString() };
                await usersContainer.items.create(userToCreate);
            }
        }

        // Seed Stock
        const stockContainer = database.container('stock');
        const { resources: existingStock } = await stockContainer.items.readAll().fetchAll();
        if (existingStock.length === 0) {
            console.log('[SEED] Seeding initial stock catalog...');
            for (const item of initialStock) {
                await stockContainer.items.create(item);
            }
            // Add the specific stock item requested by the user
            const extraStockItem = {
                brand: "ALTANO",
                wineName: "Branco 2021",
                wineType: "Branco",
                quantity: 10,
                quintaName: "Quinta do Bomfim",
                lowStockAlert: true,
                id: "1d8ab51d-3297-4a32-b0da-401f3481b40c"
            };
            await stockContainer.items.create(extraStockItem);
        }

        // Seed Transfers
        const transfersContainer = database.container('transfers');
        const { resources: existingTransfers } = await transfersContainer.items.readAll().fetchAll();
        if (existingTransfers.length === 0) {
            console.log('[SEED] Seeding initial transfer history...');
            for (const t of initialTransfers) {
                await transfersContainer.items.create(t);
            }
        }

        console.log('[SEED] Database seeding complete.');
    } catch (error) {
        console.error('[SEED] Fatal error during seeding:', error);
        process.exit(1);
    }
}

seed();
