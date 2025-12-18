// API service - Connects to backend API with localStorage fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Mock auth token (replace with real auth later)
const getMockToken = () => {
    return localStorage.getItem('auth_token') || 'dev-token-bypass';
};

// Helper to get headers
const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getMockToken()}`
});

// Helper for API calls with fallback
const apiCall = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                ...getHeaders(),
                ...options.headers
            }
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
};

// ============= ANALYTICS =============

export const getAnalyticsStats = async () => {
    try {
        return await apiCall('/analytics/stats');
    } catch (error) {
        console.warn('Using mock analytics data');
        return {
            totalEarnings: 124500,
            pendingAmount: 45200,
            overdueAmount: 12800,
            paidInvoicesCount: 142
        };
    }
};

export const getRevenueData = async (period = 'weekly') => {
    try {
        return await apiCall(`/analytics/revenue?period=${period}`);
    } catch (error) {
        console.warn('Using mock revenue data');
        if (period === 'weekly') {
            return {
                data: [
                    { name: 'Mon', revenue: 4000 },
                    { name: 'Tue', revenue: 3000 },
                    { name: 'Wed', revenue: 5000 },
                    { name: 'Thu', revenue: 2780 },
                    { name: 'Fri', revenue: 1890 },
                    { name: 'Sat', revenue: 2390 },
                    { name: 'Sun', revenue: 3490 },
                ],
                period
            };
        } else {
            return {
                data: [
                    { name: 'Jan', revenue: 12000 },
                    { name: 'Feb', revenue: 15000 },
                    { name: 'Mar', revenue: 18000 },
                    { name: 'Apr', revenue: 14000 },
                    { name: 'May', revenue: 22000 },
                    { name: 'Jun', revenue: 19000 },
                    { name: 'Jul', revenue: 25000 },
                    { name: 'Aug', revenue: 21000 },
                    { name: 'Sep', revenue: 23000 },
                    { name: 'Oct', revenue: 26000 },
                    { name: 'Nov', revenue: 24000 },
                    { name: 'Dec', revenue: 28000 },
                ],
                period
            };
        }
    }
};

export const getExpensesData = async () => {
    try {
        return await apiCall('/analytics/expenses');
    } catch (error) {
        console.warn('Using mock expenses data');
        return {
            data: [
                { name: 'Server', value: 5000 },
                { name: 'Design', value: 3000 },
                { name: 'Marketing', value: 4000 },
                { name: 'Services', value: 2000 },
            ]
        };
    }
};

// ============= INVOICES =============

export const getNextInvoiceNumber = async () => {
    try {
        return await apiCall('/invoices/next-number');
    } catch (error) {
        console.warn('Using localStorage for invoice number');
        const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
        let nextNumber = 1;

        if (invoices.length > 0) {
            const lastInvoice = invoices[invoices.length - 1];
            const match = lastInvoice.invoiceNumber.match(/INV-(\d+)/);
            if (match) {
                nextNumber = parseInt(match[1]) + 1;
            }
        }

        return { invoiceNumber: `INV-${String(nextNumber).padStart(3, '0')}` };
    }
};

export const createInvoice = async (invoiceData) => {
    try {
        return await apiCall('/invoices', {
            method: 'POST',
            body: JSON.stringify(invoiceData)
        });
    } catch (error) {
        console.warn('Saving to localStorage as fallback');
        const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
        const newInvoice = {
            ...invoiceData,
            id: Date.now().toString(),
            created_at: new Date().toISOString()
        };
        invoices.push(newInvoice);
        localStorage.setItem('invoices', JSON.stringify(invoices));
        return { invoice: newInvoice };
    }
};

export const updateInvoiceStatus = async (id, status) => {
    try {
        return await apiCall(`/invoices/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    } catch (error) {
        console.warn('Updating localStorage as fallback');
        const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
        const index = invoices.findIndex(inv => inv.id === id);
        if (index !== -1) {
            invoices[index].status = status;
            invoices[index].updated_at = new Date().toISOString();
            localStorage.setItem('invoices', JSON.stringify(invoices));
            return { invoice: invoices[index] };
        }
        throw new Error('Invoice not found');
    }
};

export const getInvoices = async () => {
    try {
        return await apiCall('/invoices');
    } catch (error) {
        console.warn('Using localStorage as fallback');
        const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
        return { invoices };
    }
};

// ============= CLIENTS =============

export const getClients = async () => {
    try {
        return await apiCall('/clients');
    } catch (error) {
        console.warn('Using localStorage as fallback');
        const clients = JSON.parse(localStorage.getItem('clients') || '[]');
        return { clients };
    }
};

export const createClient = async (clientData) => {
    try {
        return await apiCall('/clients', {
            method: 'POST',
            body: JSON.stringify(clientData)
        });
    } catch (error) {
        console.warn('Saving to localStorage as fallback');
        const clients = JSON.parse(localStorage.getItem('clients') || '[]');
        const newClient = {
            ...clientData,
            id: Date.now().toString(),
            created_at: new Date().toISOString()
        };
        clients.push(newClient);
        localStorage.setItem('clients', JSON.stringify(clients));
        return { client: newClient };
    }
};

// ============= ITEMS =============

export const getItems = async () => {
    try {
        return await apiCall('/items');
    } catch (error) {
        console.warn('Using localStorage as fallback');
        let items = JSON.parse(localStorage.getItem('items') || '[]');

        if (items.length === 0) {
            items = [
                { id: '1', name: 'Web Development', description: 'Hourly development rate', price: 2500, unit: 'hour' },
                { id: '2', name: 'UI/UX Design', description: 'Full project design package', price: 45000, unit: 'project' },
                { id: '3', name: 'Server Maintenance', description: 'Monthly server upkeep', price: 5000, unit: 'month' },
                { id: '4', name: 'SEO Optimization', description: 'Basic SEO audit and fix', price: 15000, unit: 'project' },
            ];
            localStorage.setItem('items', JSON.stringify(items));
        }

        return { items };
    }
};

export const createItem = async (itemData) => {
    try {
        return await apiCall('/items', {
            method: 'POST',
            body: JSON.stringify(itemData)
        });
    } catch (error) {
        console.warn('Saving to localStorage as fallback');
        const items = JSON.parse(localStorage.getItem('items') || '[]');
        const newItem = {
            ...itemData,
            id: Date.now().toString(),
            created_at: new Date().toISOString()
        };
        items.push(newItem);
        localStorage.setItem('items', JSON.stringify(items));
        return { item: newItem };
    }
};

// ============= EXPENSES =============

export const getExpenses = async () => {
    try {
        return await apiCall('/expenses');
    } catch (error) {
        console.warn('Using localStorage as fallback');
        const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        return { expenses };
    }
};

export const createExpense = async (expenseData) => {
    try {
        return await apiCall('/expenses', {
            method: 'POST',
            body: JSON.stringify(expenseData)
        });
    } catch (error) {
        console.warn('Saving to localStorage as fallback');
        const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        const newExpense = {
            ...expenseData,
            id: Date.now().toString(),
            created_at: new Date().toISOString()
        };
        expenses.push(newExpense);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        return { expense: newExpense };
    }
};
