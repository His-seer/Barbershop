'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DollarSign,
    Receipt,
    Users,
    TrendingUp,
    TrendingDown,
    Wallet,
    Filter,
    Download,
    Plus,
    Loader2,
    Calendar,
    Building2,
    ShoppingBag,
    Zap,
    MoreHorizontal,
    CheckCircle,
    Clock,
    XCircle,
    Trash2,
    Edit,
    X
} from 'lucide-react';
import {
    getTransactions,
    getPayrollRecords,
    getExpenses,
    getFinancialSummary,
    createExpense,
    deleteExpense,
    createPayrollRecord,
    updatePayrollRecord,
    deletePayrollRecord,
    getStaff
} from '@/utils/supabase/queries';
import type { StaffPayroll, Expense, ExpenseCategory, Staff } from '@/types/database';

interface TransactionRecord {
    id: string;
    customer_name: string;
    customer_email?: string | null;
    booking_date: string;
    staff?: { id: string; name: string } | { id: string; name: string }[] | null;
    total_price: number;
    payment_status: 'paid' | 'pending' | 'failed' | string;
}

type TabId = 'overview' | 'transactions' | 'payroll' | 'expenses';

const TABS = [
    { id: 'overview' as TabId, label: 'Overview', icon: TrendingUp },
    { id: 'transactions' as TabId, label: 'Transactions', icon: Receipt },
    { id: 'payroll' as TabId, label: 'Payroll', icon: Users },
    { id: 'expenses' as TabId, label: 'Expenses', icon: Wallet },
];

const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string; icon: typeof Building2 }[] = [
    { value: 'rent', label: 'Rent', icon: Building2 },
    { value: 'supplies', label: 'Supplies', icon: ShoppingBag },
    { value: 'utilities', label: 'Utilities', icon: Zap },
    { value: 'equipment', label: 'Equipment', icon: MoreHorizontal },
    { value: 'marketing', label: 'Marketing', icon: TrendingUp },
    { value: 'other', label: 'Other', icon: MoreHorizontal },
];

export default function FinancePage() {
    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
    });

    // Data states
    const [summary, setSummary] = useState({ revenue: 0, expenses: 0, payroll: 0, profit: 0, bookingCount: 0 });
    const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
    const [payrollRecords, setPayrollRecords] = useState<StaffPayroll[]>([]);
    const [expenseRecords, setExpenses] = useState<Expense[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);

    // Modals
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showPayrollModal, setShowPayrollModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, [dateRange]);

    async function fetchData() {
        setIsLoading(true);
        try {
            const [summaryData, txData, payrollData, expenseData, staffData] = await Promise.all([
                getFinancialSummary(dateRange.start, dateRange.end),
                getTransactions({ startDate: dateRange.start, endDate: dateRange.end }),
                getPayrollRecords({ startDate: dateRange.start, endDate: dateRange.end }),
                getExpenses({ startDate: dateRange.start, endDate: dateRange.end }),
                getStaff(),
            ]);
            setSummary(summaryData);
            setTransactions(txData);
            setPayrollRecords(payrollData);
            setExpenses(expenseData);
            setStaff(staffData);
        } catch (error) {
            console.error('Error fetching financial data:', error);
        } finally {
            setIsLoading(false);
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Financial Management</h1>
                    <p className="text-white/40 text-sm mt-1">Track revenue, expenses, and payroll</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-richblack-800 border border-white/10 rounded-xl px-3 py-2">
                        <Calendar className="w-4 h-4 text-white/40" />
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="bg-transparent text-white text-sm border-none outline-none"
                        />
                        <span className="text-white/40">to</span>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="bg-transparent text-white text-sm border-none outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-richblack-800 p-1 rounded-xl border border-white/5 overflow-x-auto">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-gold-500 text-richblack-900'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
                </div>
            ) : (
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <OverviewTab
                            key="overview"
                            summary={summary}
                            formatCurrency={formatCurrency}
                            transactions={transactions}
                        />
                    )}
                    {activeTab === 'transactions' && (
                        <TransactionsTab
                            key="transactions"
                            transactions={transactions}
                            formatCurrency={formatCurrency}
                        />
                    )}
                    {activeTab === 'payroll' && (
                        <PayrollTab
                            key="payroll"
                            records={payrollRecords}
                            staff={staff}
                            formatCurrency={formatCurrency}
                            onAdd={() => setShowPayrollModal(true)}
                            onRefresh={fetchData}
                        />
                    )}
                    {activeTab === 'expenses' && (
                        <ExpensesTab
                            key="expenses"
                            expenses={expenseRecords}
                            formatCurrency={formatCurrency}
                            onAdd={() => setShowExpenseModal(true)}
                            onRefresh={fetchData}
                        />
                    )}
                </AnimatePresence>
            )}

            {/* Add Expense Modal */}
            <ExpenseModal
                isOpen={showExpenseModal}
                onClose={() => setShowExpenseModal(false)}
                onSuccess={fetchData}
            />

            {/* Add Payroll Modal */}
            <PayrollModal
                isOpen={showPayrollModal}
                onClose={() => setShowPayrollModal(false)}
                onSuccess={fetchData}
                staff={staff}
            />
        </div>
    );
}

// =====================================================
// OVERVIEW TAB
// =====================================================
function OverviewTab({ summary, formatCurrency, transactions }: {
    summary: { revenue: number; expenses: number; payroll: number; profit: number; bookingCount: number };
    formatCurrency: (n: number) => string;
    transactions: TransactionRecord[];
}) {
    const cards = [
        { label: 'Revenue', value: summary.revenue, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
        { label: 'Expenses', value: summary.expenses, icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-500/10' },
        { label: 'Payroll', value: summary.payroll, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Profit', value: summary.profit, icon: DollarSign, color: summary.profit >= 0 ? 'text-gold-500' : 'text-red-500', bg: summary.profit >= 0 ? 'bg-gold-500/10' : 'bg-red-500/10' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
        >
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.label}
                            className="bg-richblack-800 border border-white/5 rounded-2xl p-5"
                        >
                            <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
                                <Icon className={`w-5 h-5 ${card.color}`} />
                            </div>
                            <p className="text-white/40 text-xs uppercase tracking-wider">{card.label}</p>
                            <p className={`text-2xl font-bold ${card.color} mt-1`}>
                                {formatCurrency(card.value)}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Quick Stats */}
            <div className="bg-richblack-800 border border-white/5 rounded-2xl p-6">
                <h3 className="text-white font-bold mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <p className="text-white/40 text-sm">Total Bookings</p>
                        <p className="text-2xl font-bold text-white">{summary.bookingCount}</p>
                    </div>
                    <div>
                        <p className="text-white/40 text-sm">Avg. Booking Value</p>
                        <p className="text-2xl font-bold text-white">
                            {formatCurrency(summary.bookingCount > 0 ? summary.revenue / summary.bookingCount : 0)}
                        </p>
                    </div>
                    <div>
                        <p className="text-white/40 text-sm">Paid Transactions</p>
                        <p className="text-2xl font-bold text-green-500">
                            {transactions.filter(t => t.payment_status === 'paid').length}
                        </p>
                    </div>
                    <div>
                        <p className="text-white/40 text-sm">Pending Payments</p>
                        <p className="text-2xl font-bold text-yellow-500">
                            {transactions.filter(t => t.payment_status === 'pending').length}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// =====================================================
// TRANSACTIONS TAB
// =====================================================
function TransactionsTab({ transactions, formatCurrency }: {
    transactions: TransactionRecord[];
    formatCurrency: (n: number) => string;
}) {
    const statusConfig: Record<string, { color: string; icon: typeof CheckCircle }> = {
        paid: { color: 'text-green-500 bg-green-500/10', icon: CheckCircle },
        pending: { color: 'text-yellow-500 bg-yellow-500/10', icon: Clock },
        failed: { color: 'text-red-500 bg-red-500/10', icon: XCircle },
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-richblack-800 border border-white/5 rounded-2xl overflow-hidden"
        >
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-white font-bold">All Transactions</h3>
                <span className="text-white/40 text-sm">{transactions.length} records</span>
            </div>

            {transactions.length === 0 ? (
                <div className="p-12 text-center">
                    <Receipt className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/40">No transactions in this period</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white/5 text-white/40 text-xs uppercase">
                                <th className="text-left px-4 py-3">Customer</th>
                                <th className="text-left px-4 py-3">Date</th>
                                <th className="text-left px-4 py-3">Staff</th>
                                <th className="text-right px-4 py-3">Amount</th>
                                <th className="text-center px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx) => {
                                const status = statusConfig[tx.payment_status] || statusConfig.pending;
                                const StatusIcon = status.icon;
                                return (
                                    <tr key={tx.id} className="border-t border-white/5 hover:bg-white/5">
                                        <td className="px-4 py-3">
                                            <p className="text-white font-medium">{tx.customer_name}</p>
                                            <p className="text-white/40 text-xs">{tx.customer_email}</p>
                                        </td>
                                        <td className="px-4 py-3 text-white/60 text-sm">
                                            {new Date(tx.booking_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-white/60 text-sm">
                                            {(Array.isArray(tx.staff) ? tx.staff[0]?.name : tx.staff?.name) || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono text-white">
                                            {formatCurrency(tx.total_price)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {tx.payment_status}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </motion.div>
    );
}

// =====================================================
// PAYROLL TAB
// =====================================================
function PayrollTab({ records, staff, formatCurrency, onAdd, onRefresh }: {
    records: StaffPayroll[];
    staff: Staff[];
    formatCurrency: (n: number) => string;
    onAdd: () => void;
    onRefresh: () => void;
}) {
    const handleDelete = async (id: string) => {
        if (!confirm('Delete this payroll record?')) return;
        await deletePayrollRecord(id);
        onRefresh();
    };

    const handleMarkPaid = async (id: string) => {
        await updatePayrollRecord(id, { status: 'paid', paid_at: new Date().toISOString() });
        onRefresh();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
        >
            <div className="flex items-center justify-between">
                <h3 className="text-white font-bold">Payroll Records</h3>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-richblack-900 rounded-xl font-medium text-sm hover:bg-gold-400 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Payroll
                </button>
            </div>

            {records.length === 0 ? (
                <div className="bg-richblack-800 border border-white/5 rounded-2xl p-12 text-center">
                    <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/40">No payroll records in this period</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {records.map((record) => (
                        <div
                            key={record.id}
                            className="bg-richblack-800 border border-white/5 rounded-2xl p-5"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gold-500/10 rounded-full flex items-center justify-center">
                                        <Users className="w-5 h-5 text-gold-500" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{record.staff?.name || 'Staff'}</p>
                                        <p className="text-white/40 text-xs">
                                            {new Date(record.pay_period_start).toLocaleDateString()} - {new Date(record.pay_period_end).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${record.status === 'paid' ? 'bg-green-500/10 text-green-500' :
                                        record.status === 'approved' ? 'bg-blue-500/10 text-blue-500' :
                                            'bg-yellow-500/10 text-yellow-500'
                                    }`}>
                                    {record.status}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                                <div>
                                    <p className="text-white/40">Base Salary</p>
                                    <p className="text-white font-mono">{formatCurrency(record.base_salary)}</p>
                                </div>
                                <div>
                                    <p className="text-white/40">Commission</p>
                                    <p className="text-green-500 font-mono">{formatCurrency(record.commission_earned)}</p>
                                </div>
                                <div>
                                    <p className="text-white/40">Bonus</p>
                                    <p className="text-gold-500 font-mono">{formatCurrency(record.bonus)}</p>
                                </div>
                                <div>
                                    <p className="text-white/40">Deductions</p>
                                    <p className="text-red-500 font-mono">-{formatCurrency(record.deductions)}</p>
                                </div>
                                <div>
                                    <p className="text-white/40">Total Pay</p>
                                    <p className="text-white font-bold font-mono">{formatCurrency(record.total_pay)}</p>
                                </div>
                            </div>

                            {record.status !== 'paid' && (
                                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                                    <button
                                        onClick={() => handleMarkPaid(record.id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-500 rounded-lg text-xs font-medium hover:bg-green-500/20 transition-colors"
                                    >
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        Mark as Paid
                                    </button>
                                    <button
                                        onClick={() => handleDelete(record.id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}

// =====================================================
// EXPENSES TAB
// =====================================================
function ExpensesTab({ expenses, formatCurrency, onAdd, onRefresh }: {
    expenses: Expense[];
    formatCurrency: (n: number) => string;
    onAdd: () => void;
    onRefresh: () => void;
}) {
    const handleDelete = async (id: string) => {
        if (!confirm('Delete this expense?')) return;
        await deleteExpense(id);
        onRefresh();
    };

    const getCategoryIcon = (category: string) => {
        const cat = EXPENSE_CATEGORIES.find(c => c.value === category);
        return cat?.icon || MoreHorizontal;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
        >
            <div className="flex items-center justify-between">
                <h3 className="text-white font-bold">Expenses</h3>
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-richblack-900 rounded-xl font-medium text-sm hover:bg-gold-400 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Expense
                </button>
            </div>

            {expenses.length === 0 ? (
                <div className="bg-richblack-800 border border-white/5 rounded-2xl p-12 text-center">
                    <Wallet className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/40">No expenses recorded in this period</p>
                </div>
            ) : (
                <div className="bg-richblack-800 border border-white/5 rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white/5 text-white/40 text-xs uppercase">
                                <th className="text-left px-4 py-3">Category</th>
                                <th className="text-left px-4 py-3">Description</th>
                                <th className="text-left px-4 py-3">Date</th>
                                <th className="text-right px-4 py-3">Amount</th>
                                <th className="text-center px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map((expense) => {
                                const Icon = getCategoryIcon(expense.category);
                                return (
                                    <tr key={expense.id} className="border-t border-white/5 hover:bg-white/5">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
                                                    <Icon className="w-4 h-4 text-red-500" />
                                                </div>
                                                <span className="text-white capitalize">{expense.category}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-white/60 text-sm">
                                            {expense.description || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-white/60 text-sm">
                                            {new Date(expense.expense_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono text-red-500">
                                            -{formatCurrency(expense.amount)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleDelete(expense.id)}
                                                className="p-1.5 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </motion.div>
    );
}

// =====================================================
// EXPENSE MODAL
// =====================================================
function ExpenseModal({ isOpen, onClose, onSuccess }: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        category: 'supplies' as ExpenseCategory,
        amount: '',
        description: '',
        expense_date: new Date().toISOString().split('T')[0],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.amount) return;

        setIsSubmitting(true);
        const result = await createExpense({
            category: form.category,
            amount: parseFloat(form.amount),
            description: form.description,
            expense_date: form.expense_date,
        });

        if (result.success) {
            onSuccess();
            onClose();
            setForm({ category: 'supplies', amount: '', description: '', expense_date: new Date().toISOString().split('T')[0] });
        }
        setIsSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-richblack-800 border border-white/10 rounded-2xl p-6 w-full max-w-md"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Add Expense</h2>
                    <button onClick={onClose} className="text-white/40 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-white/40 text-xs uppercase mb-2">Category</label>
                        <select
                            value={form.category}
                            onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value as ExpenseCategory }))}
                            className="w-full bg-richblack-900 border border-white/10 rounded-xl px-4 py-3 text-white"
                        >
                            {EXPENSE_CATEGORIES.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-white/40 text-xs uppercase mb-2">Amount (GHS)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={form.amount}
                            onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                            className="w-full bg-richblack-900 border border-white/10 rounded-xl px-4 py-3 text-white"
                            placeholder="0.00"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-white/40 text-xs uppercase mb-2">Description</label>
                        <input
                            type="text"
                            value={form.description}
                            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full bg-richblack-900 border border-white/10 rounded-xl px-4 py-3 text-white"
                            placeholder="Optional description"
                        />
                    </div>

                    <div>
                        <label className="block text-white/40 text-xs uppercase mb-2">Date</label>
                        <input
                            type="date"
                            value={form.expense_date}
                            onChange={(e) => setForm(prev => ({ ...prev, expense_date: e.target.value }))}
                            className="w-full bg-richblack-900 border border-white/10 rounded-xl px-4 py-3 text-white"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-white/10 rounded-xl text-white hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-3 bg-gold-500 text-richblack-900 rounded-xl font-medium hover:bg-gold-400 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Save Expense'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

// =====================================================
// PAYROLL MODAL
// =====================================================
function PayrollModal({ isOpen, onClose, onSuccess, staff }: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    staff: Staff[];
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    const [form, setForm] = useState({
        staff_id: '',
        pay_period_start: firstOfMonth,
        pay_period_end: lastOfMonth,
        base_salary: '',
        commission_earned: '',
        bonus: '',
        deductions: '',
        notes: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.staff_id || !form.base_salary) return;

        setIsSubmitting(true);
        const result = await createPayrollRecord({
            staff_id: form.staff_id,
            pay_period_start: form.pay_period_start,
            pay_period_end: form.pay_period_end,
            base_salary: parseFloat(form.base_salary) || 0,
            commission_earned: parseFloat(form.commission_earned) || 0,
            bonus: parseFloat(form.bonus) || 0,
            deductions: parseFloat(form.deductions) || 0,
            notes: form.notes,
        });

        if (result.success) {
            onSuccess();
            onClose();
            setForm({
                staff_id: '',
                pay_period_start: firstOfMonth,
                pay_period_end: lastOfMonth,
                base_salary: '',
                commission_earned: '',
                bonus: '',
                deductions: '',
                notes: '',
            });
        }
        setIsSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-richblack-800 border border-white/10 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Add Payroll</h2>
                    <button onClick={onClose} className="text-white/40 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-white/40 text-xs uppercase mb-2">Staff Member</label>
                        <select
                            value={form.staff_id}
                            onChange={(e) => setForm(prev => ({ ...prev, staff_id: e.target.value }))}
                            className="w-full bg-richblack-900 border border-white/10 rounded-xl px-4 py-3 text-white"
                            required
                        >
                            <option value="">Select staff...</option>
                            {staff.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-white/40 text-xs uppercase mb-2">Period Start</label>
                            <input
                                type="date"
                                value={form.pay_period_start}
                                onChange={(e) => setForm(prev => ({ ...prev, pay_period_start: e.target.value }))}
                                className="w-full bg-richblack-900 border border-white/10 rounded-xl px-4 py-3 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-white/40 text-xs uppercase mb-2">Period End</label>
                            <input
                                type="date"
                                value={form.pay_period_end}
                                onChange={(e) => setForm(prev => ({ ...prev, pay_period_end: e.target.value }))}
                                className="w-full bg-richblack-900 border border-white/10 rounded-xl px-4 py-3 text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-white/40 text-xs uppercase mb-2">Base Salary (GHS)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={form.base_salary}
                            onChange={(e) => setForm(prev => ({ ...prev, base_salary: e.target.value }))}
                            className="w-full bg-richblack-900 border border-white/10 rounded-xl px-4 py-3 text-white"
                            placeholder="0.00"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-white/40 text-xs uppercase mb-2">Commission</label>
                            <input
                                type="number"
                                step="0.01"
                                value={form.commission_earned}
                                onChange={(e) => setForm(prev => ({ ...prev, commission_earned: e.target.value }))}
                                className="w-full bg-richblack-900 border border-white/10 rounded-xl px-3 py-3 text-white text-sm"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-white/40 text-xs uppercase mb-2">Bonus</label>
                            <input
                                type="number"
                                step="0.01"
                                value={form.bonus}
                                onChange={(e) => setForm(prev => ({ ...prev, bonus: e.target.value }))}
                                className="w-full bg-richblack-900 border border-white/10 rounded-xl px-3 py-3 text-white text-sm"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-white/40 text-xs uppercase mb-2">Deductions</label>
                            <input
                                type="number"
                                step="0.01"
                                value={form.deductions}
                                onChange={(e) => setForm(prev => ({ ...prev, deductions: e.target.value }))}
                                className="w-full bg-richblack-900 border border-white/10 rounded-xl px-3 py-3 text-white text-sm"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-white/40 text-xs uppercase mb-2">Notes</label>
                        <textarea
                            value={form.notes}
                            onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                            className="w-full bg-richblack-900 border border-white/10 rounded-xl px-4 py-3 text-white resize-none"
                            rows={2}
                            placeholder="Optional notes..."
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-white/10 rounded-xl text-white hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-3 bg-gold-500 text-richblack-900 rounded-xl font-medium hover:bg-gold-400 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Save Payroll'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
