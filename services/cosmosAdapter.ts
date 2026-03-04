/**
 * Generic service to interact with Cosmos DB via Azure Static Web Apps Data API.
 */

// Azure Static Web Apps with Functions uses /api/data
const API_BASE_URL = '/api/data';

export const cosmosService = {
    async getAll<T>(entity: string): Promise<T[]> {
        try {
            console.log(`[CosmosAdapter] Fetching all ${entity} from ${API_BASE_URL}`);
            // Add cache-buster to ensure we get fresh data
            const response = await fetch(`${API_BASE_URL}/${entity}?cb=${Date.now()}`);
            
            // Check if we got HTML instead of JSON (common when hitting a 404 fallback)
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                console.error(`[CosmosAdapter] Error: Received HTML instead of JSON from ${API_BASE_URL}/${entity}. This usually means the API route is not found.`);
                return [];
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                console.error(`Error fetching ${entity}:`, error);
                return [];
            }
            const data = await response.json();
            // DAB and our Express server both return data in the 'value' property
            return data.value || [];
        } catch (error) {
            console.error(`Network error fetching ${entity}:`, error);
            return [];
        }
    },

    async getById<T>(entity: string, id: string | number): Promise<T | null> {
        try {
            const idStr = String(id);
            const response = await fetch(`${API_BASE_URL}/${entity}/id/${encodeURIComponent(idStr)}`);
            if (!response.ok) return null;
            const data = await response.json();
            return data.value?.[0] || null;
        } catch (error) {
            console.error(`Error fetching ${entity} by id:`, error);
            return null;
        }
    },

    async create<T>(entity: string, item: T): Promise<T | null> {
        try {
            console.log(`[CosmosAdapter] Creating ${entity}`, item);
            const response = await fetch(`${API_BASE_URL}/${entity}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
            });
            if (!response.ok) {
                const error = await response.json();
                console.error(`Error creating ${entity}:`, error);
                return null;
            }
            const data = await response.json();
            return data.value?.[0] || null;
        } catch (error) {
            console.error(`Network error creating ${entity}:`, error);
            return null;
        }
    },

    async update<T>(entity: string, id: string | number, item: Partial<T>): Promise<T | null> {
        try {
            const idStr = String(id);
            console.log(`[CosmosAdapter] Updating ${entity} ID: ${idStr}`, item);
            const response = await fetch(`${API_BASE_URL}/${entity}/id/${encodeURIComponent(idStr)}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
            });
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                console.error(`Error updating ${entity} (ID: ${idStr}):`, error);
                return null;
            }
            const data = await response.json();
            return data.value?.[0] || null;
        } catch (error) {
            console.error(`Network error updating ${entity}:`, error);
            return null;
        }
    },

    async delete(entity: string, id: string | number): Promise<boolean> {
        try {
            // Ensure id is a string for the URL
            const idStr = String(id);
            console.log(`[CosmosAdapter] Deleting ${entity} with ID: ${idStr}`);
            const response = await fetch(`${API_BASE_URL}/${entity}/id/${encodeURIComponent(idStr)}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const errorText = await response.text().catch(() => 'No body');
                console.error(`[CosmosAdapter] Error deleting ${entity} (ID: ${idStr}). Status: ${response.status}. Body: ${errorText}`);
                return false;
            }
            
            console.log(`[CosmosAdapter] Successfully deleted ${entity} with ID: ${idStr}`);
            return true;
        } catch (error) {
            console.error(`[CosmosAdapter] Network error deleting ${entity}:`, error);
            return false;
        }
    }
};
