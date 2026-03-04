
import { CosmosClient } from '@azure/cosmos';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.COSMOSDB_CONNECTION_STRING;
const databaseName = 'VinhoStockDB';

async function checkDb() {
    if (!connectionString) {
        console.log('ERROR: COSMOSDB_CONNECTION_STRING is missing');
        return;
    }

    const client = new CosmosClient(connectionString);
    try {
        const { database } = await client.database(databaseName).read();
        console.log(`Database ${databaseName} exists.`);

        const containers = ['stock', 'transfers', 'users', 'quintas'];
        for (const c of containers) {
            const container = client.database(databaseName).container(c);
            const { resources } = await container.items.readAll().fetchAll();
            console.log(`Container ${c}: ${resources.length} items found.`);
        }
    } catch (e: any) {
        console.log('Error checking DB:', e.message);
    }
}

checkDb();
