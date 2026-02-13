"use client";
import { useState } from "react";
import { Receipt, Download, Eye, Plus, Trash2 } from "lucide-react";
type RHLanguage = 'fr' | 'en' | 'ar' | 'es';
type ExpenseCategory = 'transport' | 'meals' | 'accommodation' | 'supplies' | 'communication' | 'other';
interface ExpenseItem { date: string; description: string; category: ExpenseCategory; amount: number; hasReceipt: boolean; }

export default function NoteDeFraisPage() {
  const [lang, setLang] = useState<RHLanguage>('fr');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    refNumber: `NF-${new Date().getFullYear()}/001`,
    employeeFullName: '',
    department: '',
    periodStart: '',
    periodEnd: '',
    advanceReceived: 0,
    approvedBy: '',
    issueDate: new Date().toISOString().split('T')[0],
  });
  const [expenses, setExpenses] = useState<ExpenseItem[]>([{ date: new Date().toISOString().split('T')[0], description: '', category: 'transport', amount: 0, hasReceipt: false }]);

  const addExpense = () => setExpenses([...expenses, { date: new Date().toISOString().split('T')[0], description: '', category: 'transport', amount: 0, hasReceipt: false }]);
  const removeExpense = (index: number) => setExpenses(expenses.filter((_, i) => i !== index));
  const updateExpense = (index: number, field: keyof ExpenseItem, value: any) => {
    const updated = [...expenses];
    updated[index] = { ...updated[index], [field]: value };
    setExpenses(updated);
  };

  const handleSubmit = async (action: 'preview' | 'download') => {
    setLoading(true);
    try {
      const response = await fetch('/api/rh/note-de-frais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, expenses, lang }),
      });
      if (!response.ok) throw new Error('Failed to generate PDF');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      if (action === 'preview') window.open(url, '_blank');
      else {
        const a = document.createElement('a');
        a.href = url;
        a.download = `Note_de_Frais_${formData.refNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors de la génération du PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-xl flex items-center justify-center">
            <Receipt className="w-6 h-6 text-amber-700 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Note de Frais</h1>
            <p className="text-gray-500 dark:text-gray-400">Expense Report Generator</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(['fr', 'en', 'ar', 'es'] as const).map((l) => (
            <button key={l} onClick={() => setLang(l)} className={`px-3 py-2 rounded-lg font-medium ${lang === l ? 'bg-amber-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100'}`}>
              {l === 'fr' && '🇫🇷 FR'}{l === 'en' && '🇬🇧 EN'}{l === 'ar' && '🇲🇦 AR'}{l === 'es' && '🇪🇸 ES'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Document Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reference</label><input type="text" value={formData.refNumber} onChange={(e) => setFormData({ ...formData, refNumber: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee *</label><input type="text" required value={formData.employeeFullName} onChange={(e) => setFormData({ ...formData, employeeFullName: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="John Doe" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department *</label><input type="text" required value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Sales" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Period Start *</label><input type="date" required value={formData.periodStart} onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Period End *</label><input type="date" required value={formData.periodEnd} onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Advance Received (DH)</label><input type="number" value={formData.advanceReceived} onChange={(e) => setFormData({ ...formData, advanceReceived: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" step="0.01" /></div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Expenses</h2>
            <button onClick={addExpense} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2"><Plus className="w-4 h-4" />Add Expense</button>
          </div>
          <div className="space-y-3">
            {expenses.map((expense, i) => (
              <div key={i} className="grid grid-cols-12 gap-3 items-start p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="col-span-2"><input type="date" value={expense.date} onChange={(e) => updateExpense(i, 'date', e.target.value)} className="w-full px-2 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" /></div>
                <div className="col-span-3"><input type="text" value={expense.description} onChange={(e) => updateExpense(i, 'description', e.target.value)} placeholder="Description" className="w-full px-2 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" /></div>
                <div className="col-span-2"><select value={expense.category} onChange={(e) => updateExpense(i, 'category', e.target.value)} className="w-full px-2 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"><option value="transport">Transport</option><option value="meals">Meals</option><option value="accommodation">Accommodation</option><option value="supplies">Supplies</option><option value="communication">Communication</option><option value="other">Other</option></select></div>
                <div className="col-span-2"><input type="number" value={expense.amount} onChange={(e) => updateExpense(i, 'amount', parseFloat(e.target.value) || 0)} placeholder="Amount" className="w-full px-2 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" step="0.01" /></div>
                <div className="col-span-2"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={expense.hasReceipt} onChange={(e) => updateExpense(i, 'hasReceipt', e.target.checked)} className="rounded" />Receipt</label></div>
                <div className="col-span-1"><button onClick={() => removeExpense(i)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><Trash2 className="w-4 h-4" /></button></div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={() => handleSubmit('preview')} disabled={loading || !formData.employeeFullName} className="px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2 border"><Eye className="w-5 h-5" />Preview</button>
          <button onClick={() => handleSubmit('download')} disabled={loading || !formData.employeeFullName} className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-medium hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 flex items-center gap-2 shadow-lg"><Download className="w-5 h-5" />{loading ? 'Generating...' : 'Download PDF'}</button>
        </div>
      </div>
    </div>
  );
}
