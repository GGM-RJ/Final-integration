/**
 * Generates a unique ID (string).
 * In a real Cosmos DB scenario, the DB generates this, but for optimistic UI updates
 * or local simulation, we generate a UUID-like string.
 */
export const generateId = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for older environments
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};