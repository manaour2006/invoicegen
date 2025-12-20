// API service - Connects to Firebase Firestore
import { db, auth } from './firebase';
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy
} from 'firebase/firestore';

// Helper to get current user ID
const getUserId = () => {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    return user.uid;
};

// ============= ANALYTICS =============

export const getAnalyticsStats = async () => {
    try {
        const uid = getUserId();
        const invoicesRef = collection(db, 'users', uid, 'invoices');
        const snapshot = await getDocs(invoicesRef);

        const invoices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const totalEarnings = invoices
            .filter(inv => inv.status === 'paid')
            .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);

        const pendingAmount = invoices
            .filter(inv => inv.status === 'pending' || inv.status === 'sent')
            .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);

        const overdueAmount = invoices
            .filter(inv => {
                if (inv.status === 'paid') return false;
                if (!inv.dueDate) return false;
                return new Date(inv.dueDate) < new Date();
            })
            .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);

        const paidInvoicesCount = invoices.filter(inv => inv.status === 'paid').length;

        // Calculate trends
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const prevMonthDate = new Date();
        prevMonthDate.setMonth(currentMonth - 1);
        const prevMonth = prevMonthDate.getMonth();

        const getMonthlyTotal = (statusFilter, month, year) => {
            return invoices
                .filter(inv => {
                    if (!inv.date) return false;
                    const d = new Date(inv.date);
                    return d.getMonth() === month && d.getFullYear() === year && statusFilter(inv);
                })
                .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
        };

        const getMonthlyCount = (statusFilter, month, year) => {
            return invoices
                .filter(inv => {
                    if (!inv.date) return false;
                    const d = new Date(inv.date);
                    return d.getMonth() === month && d.getFullYear() === year && statusFilter(inv);
                })
                .length;
        };

        const currentEarnings = getMonthlyTotal(inv => inv.status === 'paid', currentMonth, currentYear);
        const prevEarnings = getMonthlyTotal(inv => inv.status === 'paid', prevMonth, prevYear);
        const earningsTrend = prevEarnings === 0 ? null : Math.round(((currentEarnings - prevEarnings) / prevEarnings) * 100);

        const currentPending = getMonthlyTotal(inv => inv.status === 'pending' || inv.status === 'sent', currentMonth, currentYear);
        const prevPending = getMonthlyTotal(inv => inv.status === 'pending' || inv.status === 'sent', prevMonth, prevYear);
        const pendingTrend = prevPending === 0 ? null : Math.round(((currentPending - prevPending) / prevPending) * 100);

        const currentOverdue = getMonthlyTotal(inv => {
            if (inv.status === 'paid') return false;
            if (!inv.dueDate) return false;
            return new Date(inv.dueDate) < new Date();
        }, currentMonth, currentYear);
        const prevOverdue = getMonthlyTotal(inv => {
            if (inv.status === 'paid') return false;
            if (!inv.dueDate) return false;
            return new Date(inv.dueDate) < prevMonthDate;
        }, prevMonth, prevYear);
        const overdueTrend = prevOverdue === 0 ? null : Math.round(((currentOverdue - prevOverdue) / prevOverdue) * 100);

        const currentPaidCount = getMonthlyCount(inv => inv.status === 'paid', currentMonth, currentYear);
        const prevPaidCount = getMonthlyCount(inv => inv.status === 'paid', prevMonth, prevYear);
        const paidCountTrend = prevPaidCount === 0 ? null : Math.round(((currentPaidCount - prevPaidCount) / prevPaidCount) * 100);


        return {
            totalEarnings,
            pendingAmount,
            overdueAmount,
            paidInvoicesCount,
            trends: {
                earnings: earningsTrend,
                pending: pendingTrend,
                overdue: overdueTrend,
                paidCount: paidCountTrend
            }
        };
    } catch (error) {
        console.error('Error fetching analytics:', error);
        throw error;
    }
};

export const getRevenueData = async (period = 'weekly') => {
    try {
        const uid = getUserId();
        const invoicesRef = collection(db, 'users', uid, 'invoices');
        const snapshot = await getDocs(invoicesRef);
        const invoices = snapshot.docs.map(doc => doc.data());

        const data = [];
        const today = new Date();

        if (period === 'weekly') {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                const dayName = days[date.getDay()];

                const revenue = invoices
                    .filter(inv => {
                        if (!inv.date) return false;
                        const invDate = new Date(inv.date);
                        return invDate.toDateString() === date.toDateString();
                    })
                    .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);

                data.push({ name: dayName, revenue });
            }
        } else if (period === 'month') {
            const year = today.getFullYear();
            const month = today.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            for (let i = 1; i <= daysInMonth; i++) {
                const revenue = invoices
                    .filter(inv => {
                        if (!inv.date) return false;
                        const invDate = new Date(inv.date);
                        return invDate.getDate() === i && invDate.getMonth() === month && invDate.getFullYear() === year;
                    })
                    .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);

                data.push({ name: `${i}`, revenue });
            }
        } else {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const year = today.getFullYear();

            months.forEach((month, index) => {
                const revenue = invoices
                    .filter(inv => {
                        if (!inv.date) return false;
                        const invDate = new Date(inv.date);
                        return invDate.getMonth() === index && invDate.getFullYear() === year;
                    })
                    .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);

                data.push({ name: month, revenue });
            });
        }

        return { data, period };
    } catch (error) {
        console.error('Error fetching revenue:', error);
        throw error;
    }
};

export const getExpensesData = async () => {
    try {
        const uid = getUserId();
        const expensesRef = collection(db, 'users', uid, 'expenses');
        const snapshot = await getDocs(expensesRef);
        // If no expenses implemented, return mock or empty
        if (snapshot.empty) {
            return {
                data: [
                    { name: 'Server', value: 0 },
                    { name: 'Design', value: 0 },
                    { name: 'Marketing', value: 0 },
                    { name: 'Services', value: 0 },
                ]
            };
        }
        // Transform real expenses here if we had them
        return {
            data: [
                { name: 'Server', value: 0 },
                { name: 'Design', value: 0 },
                { name: 'Marketing', value: 0 },
                { name: 'Services', value: 0 },
            ]
        };
    } catch (error) {
        return { data: [] };
    }
};

// ============= INVOICES =============

export const getNextInvoiceNumber = async () => {
    try {
        const uid = getUserId();
        const invoicesRef = collection(db, 'users', uid, 'invoices');
        const q = query(invoicesRef, orderBy('createdAt', 'desc')); // Assuming we add createdAt
        const snapshot = await getDocs(q);

        let nextNumber = 1;
        if (!snapshot.empty) {
            // Find highest number
            const numbers = snapshot.docs.map(doc => {
                const match = doc.data().invoiceNumber?.match(/INV-(\d+)/);
                return match ? parseInt(match[1]) : 0;
            });
            nextNumber = Math.max(...numbers, 0) + 1;
        }
        return { invoiceNumber: `INV-${String(nextNumber).padStart(3, '0')}` };
    } catch (error) {
        console.error(error);
        return { invoiceNumber: 'INV-001' };
    }
};

export const createInvoice = async (invoiceData) => {
    try {
        const uid = getUserId();
        const invoicesRef = collection(db, 'users', uid, 'invoices');
        const newInvoice = {
            ...invoiceData,
            createdAt: new Date().toISOString(),
            status: invoiceData.status || 'draft'
        };
        const docRef = await addDoc(invoicesRef, newInvoice);
        return { invoice: { id: docRef.id, ...newInvoice } };
    } catch (error) {
        console.error('Error creating invoice:', error);
        throw error;
    }
};

export const updateInvoiceStatus = async (id, status) => {
    try {
        const uid = getUserId();
        const invoiceRef = doc(db, 'users', uid, 'invoices', id);
        await updateDoc(invoiceRef, {
            status,
            updatedAt: new Date().toISOString()
        });
        return { invoice: { id, status } };
    } catch (error) {
        console.error('Error updating invoice status:', error);
        throw error;
    }
};

export const getInvoices = async () => {
    try {
        const uid = getUserId();
        const invoicesRef = collection(db, 'users', uid, 'invoices');
        const q = query(invoicesRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const invoices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { invoices };
    } catch (error) {
        console.error('Error getting invoices:', error);
        throw error;
    }
};

export const getInvoice = async (invoiceId) => {
    try {
        const uid = getUserId();
        const invoiceRef = doc(db, 'users', uid, 'invoices', invoiceId);
        const snapshot = await getDoc(invoiceRef);
        if (!snapshot.exists()) {
            throw new Error('Invoice not found');
        }
        return { invoice: { id: snapshot.id, ...snapshot.data() } };
    } catch (error) {
        console.error('Error getting invoice:', error);
        throw error;
    }
};

export const updateInvoice = async (invoiceId, invoiceData) => {
    try {
        const uid = getUserId();
        const invoiceRef = doc(db, 'users', uid, 'invoices', invoiceId);
        await updateDoc(invoiceRef, {
            ...invoiceData,
            updatedAt: new Date().toISOString()
        });
        return { invoice: { id: invoiceId, ...invoiceData } };
    } catch (error) {
        console.error('Error updating invoice:', error);
        throw error;
    }
};

export const deleteInvoice = async (invoiceId) => {
    try {
        const uid = getUserId();
        const invoiceRef = doc(db, 'users', uid, 'invoices', invoiceId);
        await deleteDoc(invoiceRef);
        return { invoiceId };
    } catch (error) {
        console.error('Error deleting invoice:', error);
        throw error;
    }
};

export const markInvoiceAsPaid = async (invoiceId, paymentDate = new Date().toISOString()) => {
    try {
        const uid = getUserId();
        const invoiceRef = doc(db, 'users', uid, 'invoices', invoiceId);
        await updateDoc(invoiceRef, {
            status: 'paid',
            paymentDate,
            updatedAt: new Date().toISOString()
        });
        return { invoice: { id: invoiceId, status: 'paid', paymentDate } };
    } catch (error) {
        console.error('Error marking invoice as paid:', error);
        throw error;
    }
};

// ============= CLIENTS =============

export const getClients = async () => {
    try {
        const uid = getUserId();
        const clientsRef = collection(db, 'users', uid, 'clients');
        const snapshot = await getDocs(clientsRef);
        const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { clients };
    } catch (error) {
        console.error('Error getting clients:', error);
        throw error;
    }
};

export const createClient = async (clientData) => {
    try {
        const uid = getUserId();
        const clientsRef = collection(db, 'users', uid, 'clients');
        const newClient = { ...clientData, createdAt: new Date().toISOString() };
        const docRef = await addDoc(clientsRef, newClient);
        return { client: { id: docRef.id, ...newClient } };
    } catch (error) {
        console.error('Error creating client:', error);
        throw error;
    }
};

export const deleteClient = async (clientId) => {
    try {
        const uid = getUserId();
        const clientRef = doc(db, 'users', uid, 'clients', clientId);
        await deleteDoc(clientRef);
        return { clientId };
    } catch (error) {
        console.error('Error deleting client:', error);
        throw error;
    }
};

export const updateClient = async (clientId, clientData) => {
    try {
        const uid = getUserId();
        const clientRef = doc(db, 'users', uid, 'clients', clientId);
        await updateDoc(clientRef, {
            ...clientData,
            updatedAt: new Date().toISOString()
        });
        return { client: { id: clientId, ...clientData } };
    } catch (error) {
        console.error('Error updating client:', error);
        throw error;
    }
};

// ============= ITEMS =============

export const getItems = async () => {
    try {
        const uid = getUserId();
        const itemsRef = collection(db, 'users', uid, 'items');
        const snapshot = await getDocs(itemsRef);
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { items };
    } catch (error) {
        console.error('Error getting items:', error);
        throw error;
    }
};

export const createItem = async (itemData) => {
    try {
        const uid = getUserId();
        const itemsRef = collection(db, 'users', uid, 'items');
        const newItem = { ...itemData, createdAt: new Date().toISOString() };
        const docRef = await addDoc(itemsRef, newItem);
        return { item: { id: docRef.id, ...newItem } };
    } catch (error) {
        console.error('Error creating item:', error);
        throw error;
    }
};

export const deleteItem = async (itemId) => {
    try {
        const uid = getUserId();
        const itemRef = doc(db, 'users', uid, 'items', itemId);
        await deleteDoc(itemRef);
        return { itemId };
    } catch (error) {
        console.error('Error deleting item:', error);
        throw error;
    }
};

// ============= EXPENSES =============

export const getExpenses = async () => {
    // Placeholder for now
    return { expenses: [] };
};

export const createExpense = async (expenseData) => {
    try {
        const uid = getUserId();
        const expensesRef = collection(db, 'users', uid, 'expenses');
        const newExpense = { ...expenseData, createdAt: new Date().toISOString() };
        const docRef = await addDoc(expensesRef, newExpense);
        return { expense: { id: docRef.id, ...newExpense } };
    } catch (error) {
        console.error('Error creating expense:', error);
        throw error;
    }
};


