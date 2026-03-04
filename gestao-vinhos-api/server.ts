import express, { Request, Response } from 'express';
import cors from 'cors';
import { CosmosClient } from '@azure/cosmos';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const connectionString = process.env.COSMOS_CONNECTION_STRING;
const databaseName = 'VinhoStockDB';

app.use(cors());
app.use(express.json());

let client: CosmosClient | null = null;

const getContainer = (containerId: string) => {
    if (!client && connectionString) {
        client = new CosmosClient(connectionString);
    }
    if (!client) throw new Error("Cosmos Connection String is missing");
    return client.database(databaseName).container(containerId);
};

// --- Endpoints ---

app.get('/', (req: Request, res: Response) => {
    res.send('API Symvinhos funcionando');
});

app.get('/quintas', async (req: Request, res: Response) => {
    try {
        const { resources } = await getContainer('quintas').items.readAll().fetchAll();
        res.json(resources);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/stock', async (req: Request, res: Response) => {
    try {
        const { resources } = await getContainer('stock').items.readAll().fetchAll();
        res.json(resources);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/transfers', async (req: Request, res: Response) => {
    try {
        const { resources } = await getContainer('transfers').items.readAll().fetchAll();
        res.json(resources);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/users', async (req: Request, res: Response) => {
    try {
        const { resources } = await getContainer('users').items.readAll().fetchAll();
        res.json(resources);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/stock', async (req: Request, res: Response) => {
    try {
        const item = req.body;
        if (!item.id) item.id = Date.now().toString();
        const { resource } = await getContainer('stock').items.create(item);
        res.status(201).json(resource);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/transfers', async (req: Request, res: Response) => {
    try {
        const item = req.body;
        if (!item.id) item.id = Date.now().toString();
        const { resource } = await getContainer('transfers').items.create(item);
        res.status(201).json(resource);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/stock/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const container = getContainer('stock');
        const { resource: existing } = await container.item(id, id).read();
        if (!existing) return res.status(404).json({ error: 'Item não encontrado' });
        
        const { resource } = await container.item(id, id).replace({ ...existing, ...updates });
        res.json(resource);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
