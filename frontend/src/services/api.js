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
    where,
    orderBy,
    query,
    limit
} from 'firebase/firestore';

// Helper to get current user ID
const getUserId = () => {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    return user.uid;
};

// ============= AUDIT LOGS =============

export const logActivity = async (action, entityType, entityId, details = '') => {
    try {
        const uid = getUserId();
        const logsRef = collection(db, 'users', uid, 'audit_logs');
        await addDoc(logsRef, {
            action,
            entityType,
            entityId,
            details,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
};

export const getAuditLogs = async (limitCount = 20) => {
    try {
        const uid = getUserId();
        const logsRef = collection(db, 'users', uid, 'audit_logs');
        const q = query(logsRef, orderBy('timestamp', 'desc'), limit(limitCount));
        const snapshot = await getDocs(q);
        return { logs: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) };
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        return { logs: [] };
    }
};

// ============= ANALYTICS =============

export const checkAndMarkOverdueInvoices = async () => {
    try {
        const uid = getUserId();
        const invoicesRef = collection(db, 'users', uid, 'invoices');
        const snapshot = await getDocs(invoicesRef);

        const now = new Date();
        const updates = [];

        snapshot.docs.forEach(docSnap => {
            const data = docSnap.data();
            const status = (data.status || 'draft').toLowerCase();

            // If pending/sent/draft AND due date is passed -> mark overdue
            if ((status === 'pending' || status === 'sent' || status === 'draft') && data.dueDate) {
                const dueDate = new Date(data.dueDate);
                // Compare dates (ignore time if needed, but simple comparison works)
                if (dueDate < now) {
                    updates.push(updateDoc(doc(db, 'users', uid, 'invoices', docSnap.id), {
                        status: 'overdue',
                        updatedAt: new Date().toISOString()
                    }));
                }
            }
        });

        if (updates.length > 0) {
            await Promise.all(updates);
            console.log(`Marked ${updates.length} invoices as overdue.`);
        }
    } catch (error) {
        console.error('Error checking overdue invoices:', error);
    }
};

export const getAnalyticsStats = async () => {
    try {
        const uid = getUserId();
        const invoicesRef = collection(db, 'users', uid, 'invoices');
        const snapshot = await getDocs(invoicesRef);

        const invoices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("DEBUG: Raw Invoices for Analytics", invoices);

        const normalizeStatus = (status) => (status || 'draft').toString().trim().toLowerCase();

        const totalEarnings = invoices
            .filter(inv => normalizeStatus(inv.status) === 'paid')
            .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);

        const pendingAmount = invoices
            .filter(inv => {
                const status = normalizeStatus(inv.status);
                return status === 'pending' || status === 'sent' || status === 'draft';
            })
            .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);

        const overdueAmount = invoices
            .filter(inv => {
                const status = normalizeStatus(inv.status);
                if (status === 'paid') return false;
                if (!inv.dueDate) return false;
                // Check if overdue
                return new Date(inv.dueDate) < new Date();
            })
            .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);

        const paidInvoicesCount = invoices.filter(inv => normalizeStatus(inv.status) === 'paid').length;

        console.log("DEBUG: Calculated Stats", { totalEarnings, pendingAmount, overdueAmount, paidInvoicesCount });

        // Calculate trends
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const prevMonthDate = new Date();
        prevMonthDate.setMonth(currentMonth - 1);
        const prevMonth = prevMonthDate.getMonth();
        // Handle year rollover if previous month was Dec
        const prevYear = prevMonth === 11 ? currentYear - 1 : currentYear;

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

        const currentEarnings = getMonthlyTotal(inv => normalizeStatus(inv.status) === 'paid', currentMonth, currentYear);
        const prevEarnings = getMonthlyTotal(inv => normalizeStatus(inv.status) === 'paid', prevMonth, prevYear);
        const earningsTrend = prevEarnings === 0 ? null : Math.round(((currentEarnings - prevEarnings) / prevEarnings) * 100);

        const currentPending = getMonthlyTotal(inv => ['pending', 'sent', 'draft'].includes(normalizeStatus(inv.status)), currentMonth, currentYear);
        const prevPending = getMonthlyTotal(inv => ['pending', 'sent', 'draft'].includes(normalizeStatus(inv.status)), prevMonth, prevYear);
        const pendingTrend = prevPending === 0 ? null : Math.round(((currentPending - prevPending) / prevPending) * 100);

        const currentOverdue = getMonthlyTotal(inv => {
            if (normalizeStatus(inv.status) === 'paid') return false;
            if (!inv.dueDate) return false;
            return new Date(inv.dueDate) < new Date();
        }, currentMonth, currentYear);

        const prevOverdue = getMonthlyTotal(inv => {
            if (normalizeStatus(inv.status) === 'paid') return false;
            if (!inv.dueDate) return false;
            return new Date(inv.dueDate) < prevMonthDate; // Approximate
        }, prevMonth, prevYear);

        const overdueTrend = prevOverdue === 0 ? null : Math.round(((currentOverdue - prevOverdue) / prevOverdue) * 100);

        const currentPaidCount = getMonthlyCount(inv => normalizeStatus(inv.status) === 'paid', currentMonth, currentYear);
        const prevPaidCount = getMonthlyCount(inv => normalizeStatus(inv.status) === 'paid', prevMonth, prevYear);
        const paidCountTrend = prevPaidCount === 0 ? null : Math.round(((currentPaidCount - prevPaidCount) / prevPaidCount) * 100);



        const distribution = { Paid: 0, Pending: 0, Overdue: 0 };
        invoices.forEach(inv => {
            const amount = Number(inv.total) || 0;
            const status = normalizeStatus(inv.status);

            if (status === 'paid') {
                distribution.Paid += amount;
            } else if (inv.dueDate && new Date(inv.dueDate) < new Date()) {
                // It's not paid, and it's past due -> Overdue
                distribution.Overdue += amount;
            } else {
                // Pending/Sent/Draft/Unknown
                distribution.Pending += amount;
            }
        });

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
            },
            invoiceDistribution: [
                { name: 'Paid', value: distribution.Paid },
                { name: 'Pending', value: distribution.Pending },
                { name: 'Overdue', value: distribution.Overdue }
            ]
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

        // Check for duplicate invoiceNumber
        if (invoiceData.invoiceNumber) {
            const q = query(invoicesRef, where('invoiceNumber', '==', invoiceData.invoiceNumber));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                throw new Error(`Invoice number ${invoiceData.invoiceNumber} already exists. Please use a unique number.`);
            }
        }

        const newInvoice = {
            ...invoiceData,
            createdAt: new Date().toISOString(),
            status: invoiceData.status || 'draft'
        };
        const docRef = await addDoc(invoicesRef, newInvoice);

        // Inventory Management: Deduct stock
        if (newInvoice.items && newInvoice.items.length > 0) {
            newInvoice.items.forEach(async (invItem) => {
                // If the item has an ID (it exists in inventory), deduct stock
                if (invItem.id || invItem.itemId) {
                    const itemId = invItem.id || invItem.itemId;
                    try {
                        const itemDocRef = doc(db, 'users', uid, 'items', itemId);
                        const itemSnap = await getDoc(itemDocRef);
                        if (itemSnap.exists()) {
                            const currentStock = Number(itemSnap.data().quantity) || 0;
                            const newStock = Math.max(0, currentStock - (Number(invItem.quantity) || 0));
                            await updateDoc(itemDocRef, { quantity: newStock });

                            // Check low stock
                            const threshold = Number(itemSnap.data().lowStockThreshold) || 0;
                            if (newStock <= threshold) {
                                logActivity('Low Stock Alert', 'Item', itemId, `Item "${invItem.description}" is low on stock (${newStock} remaining).`);
                            }
                        }
                    } catch (err) {
                        console.error(`Failed to update stock for item ${itemId}`, err);
                    }
                }
            });
        }

        await logActivity('Created', 'Invoice', docRef.id, `Invoice ${newInvoice.invoiceNumber} created.`);
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
        await logActivity('Updated Status', 'Invoice', id, `Status updated to ${status}`);
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
        await logActivity('Updated', 'Invoice', invoiceId, 'Invoice details updated.');
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
        await logActivity('Deleted', 'Invoice', invoiceId, 'Invoice deleted.');
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
        await logActivity('Paid', 'Invoice', invoiceId, `Invoice marked as paid on ${paymentDate}.`);
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
        await logActivity('Created', 'Client', docRef.id, `Client ${newClient.name} created.`);
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

        let productId = itemData.productId;

        // Auto-generate ID if not provided (Format: PROD-001)
        if (!productId) {
            const snapshot = await getDocs(itemsRef);
            const count = snapshot.size + 1;
            productId = `PROD-${String(count).padStart(3, '0')}`;
        }

        const newItem = {
            ...itemData,
            productId,
            costPrice: Number(itemData.costPrice) || 0,
            quantity: Number(itemData.quantity) || 0,
            lowStockThreshold: Number(itemData.lowStockThreshold) || 5,
            createdAt: new Date().toISOString()
        };

        const docRef = await addDoc(itemsRef, newItem);
        await logActivity('Created', 'Item', docRef.id, `Item ${newItem.name} created.`);
        return { item: { id: docRef.id, ...newItem } };
    } catch (error) {
        console.error('Error creating item:', error);
        throw error;
    }
};

export const updateItem = async (itemId, itemData) => {
    try {
        const uid = getUserId();
        const itemRef = doc(db, 'users', uid, 'items', itemId);
        await updateDoc(itemRef, {
            ...itemData,
            updatedAt: new Date().toISOString()
        });
        await logActivity('Updated', 'Item', itemId, `Item ${itemData.name || ''} updated.`);
        return { item: { id: itemId, ...itemData } };
    } catch (error) {
        console.error('Error updating item:', error);
        throw error;
    }
};

export const deleteItem = async (itemId) => {
    try {
        const uid = getUserId();
        const itemRef = doc(db, 'users', uid, 'items', itemId);
        await deleteDoc(itemRef);
        await logActivity('Deleted', 'Item', itemId, 'Item deleted.');
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


