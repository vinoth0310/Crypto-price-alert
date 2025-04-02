/**
 * In-memory data store for the application
 * Provides basic CRUD operations for different collections
 */

// Initialize store with collections
const store = {
    coins: [],
    alerts: []
};

// Generic CRUD operations for a collection
const createCollection = (collectionName) => {
    return {
        // Get all items
        getAll: () => {
            return [...store[collectionName]];
        },
        
        // Get item by ID
        getById: (id) => {
            return store[collectionName].find(item => item.id === id);
        },
        
        // Add new item
        add: (item) => {
            // Ensure item has an ID
            if (!item.id) {
                item.id = Date.now().toString();
            }
            
            store[collectionName].push(item);
            return item;
        },
        
        // Update existing item
        update: (id, updatedItem) => {
            const index = store[collectionName].findIndex(item => item.id === id);
            
            if (index === -1) {
                return false;
            }
            
            store[collectionName][index] = updatedItem;
            return true;
        },
        
        // Remove item
        remove: (id) => {
            const initialLength = store[collectionName].length;
            store[collectionName] = store[collectionName].filter(item => item.id !== id);
            return store[collectionName].length < initialLength;
        },
        
        // Clear all items
        clear: () => {
            store[collectionName] = [];
            return true;
        }
    };
};

// Export collections
module.exports = {
    coins: createCollection('coins'),
    alerts: createCollection('alerts')
};
