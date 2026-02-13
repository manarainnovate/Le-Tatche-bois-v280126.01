"use client";
import { useState } from "react";
import { Receipt, Download, Eye, Plus, Trash2 } from "lucide-react";
type RHLanguage = 'fr' | 'en' | 'ar' | 'es';
interface BonusItem { description: string; amount: number; }
interface DeductionItem { description: string; amount: number; }

export default function BulletinPaiePage() {
  const [lang, setLang] = useState<RHLanguage>('fr');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    refNumber: `BP-${new Date().getFullYear()}/001`,
    employeeFullName: '',
    employeeCIN: '',
    position: '',
    department: '',
    cnssNumber: '',
    payPeriodStart: '',
    payPeriodEnd: '',
    baseSalary: 0,
    overtimeHours: 0,
    overtimeRate: 0,
    workDays: 26,
    paidLeave: 0,
    sickLeave: 0,
    issueDate: new Date().toISOString().split('T')[0],
  });
  const [bonuses, setBonuses] = useState<BonusItem[]>([]);
  const [deductions, setDeductions] = useState<DeductionItem[]>([]);

  const addBonus = () => setBonuses([...bonuses, { description: '', amount: 0 }]);
  const removeBonus = (i: number) => setBonuses(bonuses.filter((_, idx) => idx !== i));
  const updateBonus = (i: number, field: keyof BonusItem, value: any) => {
    const updated = [...bonuses];
    updated[i] = { ...updated[i], [field]: value };
    setBonuses(updated);
  };

  const addDeduction = () => setDeductions([...deductions, { description: '', amount: 0 }]);
  const removeDeduction = (i: number) => setDeductions(deductions.filter((_, idx) => idx !== i));
  const updateDeduction = (i: number, field: keyof DeductionItem, value: any) => {
    const updated = [...deductions];
    updated[i] = { ...updated[i], [field]: value };
    setDeductions(updated);
  };

  const handleSubmit = async (action: 'preview' | 'download') => {
    setLoading(true);
    try {
      const response = await fetch('/api/rh/bulletin-paie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, bonuses, customDeductions: deductions, lang }),
      });
      if (!response.ok) throw new Error('Failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      if (action === 'preview') window.open(url, '_blank');
      else {
        const a = document.createElement('a');
        a.href = url;
        a.download = `Bulletin_Paie_${formData.refNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
    } catch (error) {
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bulletin de Paie</h1>
            <p className="text-gray-500 dark:text-gray-400">Payslip Generator</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(['fr', 'en', 'ar', 'es'] as const).map((l) => (
            <button key={l} onClick={() => setLang(l)} className={`px-3 py-2 rounded-lg font-medium ${lang === l ? 'bg-amber-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
              {l === 'fr' && '🇫🇷 FR'}{l === 'en' && '🇬🇧 EN'}{l === 'ar' && '🇲🇦 AR'}{l === 'es' && '🇪🇸 ES'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Employee Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">Reference</label><input type="text" value={formData.refNumber} onChange={(e) => setFormData({ ...formData, refNumber: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
            <div><label className="block text-sm font-medium mb-1">Full Name *</label><input type="text" required value={formData.employeeFullName} onChange={(e) => setFormData({ ...formData, employeeFullName: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="John Doe" /></div>
            <div><label className="block text-sm font-medium mb-1">CIN *</label><input type="text" required value={formData.employeeCIN} onChange={(e) => setFormData({ ...formData, employeeCIN: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="AA123456" /></div>
            <div><label className="block text-sm font-medium mb-1">Position *</label><input type="text" required value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Menuisier" /></div>
            <div><label className="block text-sm font-medium mb-1">Department *</label><input type="text" required value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Production" /></div>
            <div><label className="block text-sm font-medium mb-1">CNSS Number *</label><input type="text" required value={formData.cnssNumber} onChange={(e) => setFormData({ ...formData, cnssNumber: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="123456789" /></div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Pay Period & Work Days</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div><label className="block text-sm font-medium mb-1">Period Start *</label><input type="date" required value={formData.payPeriodStart} onChange={(e) => setFormData({ ...formData, payPeriodStart: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
            <div><label className="block text-sm font-medium mb-1">Period End *</label><input type="date" required value={formData.payPeriodEnd} onChange={(e) => setFormData({ ...formData, payPeriodEnd: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
            <div><label className="block text-sm font-medium mb-1">Work Days</label><input type="number" value={formData.workDays} onChange={(e) => setFormData({ ...formData, workDays: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
            <div><label className="block text-sm font-medium mb-1">Paid Leave</label><input type="number" value={formData.paidLeave} onChange={(e) => setFormData({ ...formData, paidLeave: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
            <div><label className="block text-sm font-medium mb-1">Sick Leave</label><input type="number" value={formData.sickLeave} onChange={(e) => setFormData({ ...formData, sickLeave: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Salary & Overtime</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">Base Salary (DH) *</label><input type="number" required value={formData.baseSalary} onChange={(e) => setFormData({ ...formData, baseSalary: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" step="0.01" /></div>
            <div><label className="block text-sm font-medium mb-1">Overtime Hours</label><input type="number" value={formData.overtimeHours} onChange={(e) => setFormData({ ...formData, overtimeHours: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" step="0.5" /></div>
            <div><label className="block text-sm font-medium mb-1">Overtime Rate (DH/h)</label><input type="number" value={formData.overtimeRate} onChange={(e) => setFormData({ ...formData, overtimeRate: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" step="0.01" /></div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Bonuses</h2>
            <button onClick={addBonus} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2 text-sm"><Plus className="w-4 h-4" />Add Bonus</button>
          </div>
          <div className="space-y-2">
            {bonuses.map((bonus, i) => (
              <div key={i} className="flex gap-3 items-center">
                <input type="text" value={bonus.description} onChange={(e) => updateBonus(i, 'description', e.target.value)} placeholder="Bonus description" className="flex-1 px-3 py-2 rounded border bg-white dark:bg-gray-700 text-sm" />
                <input type="number" value={bonus.amount} onChange={(e) => updateBonus(i, 'amount', parseFloat(e.target.value) || 0)} placeholder="Amount" className="w-32 px-3 py-2 rounded border bg-white dark:bg-gray-700 text-sm" step="0.01" />
                <button onClick={() => removeBonus(i)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Custom Deductions</h2>
            <button onClick={addDeduction} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2 text-sm"><Plus className="w-4 h-4" />Add Deduction</button>
          </div>
          <div className="space-y-2">
            {deductions.map((ded, i) => (
              <div key={i} className="flex gap-3 items-center">
                <input type="text" value={ded.description} onChange={(e) => updateDeduction(i, 'description', e.target.value)} placeholder="Deduction description" className="flex-1 px-3 py-2 rounded border bg-white dark:bg-gray-700 text-sm" />
                <input type="number" value={ded.amount} onChange={(e) => updateDeduction(i, 'amount', parseFloat(e.target.value) || 0)} placeholder="Amount" className="w-32 px-3 py-2 rounded border bg-white dark:bg-gray-700 text-sm" step="0.01" />
                <button onClick={() => removeDeduction(i)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={() => handleSubmit('preview')} disabled={loading || !formData.employeeFullName} className="px-6 py-3 bg-white dark:bg-gray-700 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2 border"><Eye className="w-5 h-5" />Preview</button>
          <button onClick={() => handleSubmit('download')} disabled={loading || !formData.employeeFullName} className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-medium disabled:opacity-50 flex items-center gap-2 shadow-lg"><Download className="w-5 h-5" />{loading ? 'Generating...' : 'Download PDF'}</button>
        </div>
      </div>
    </div>
  );
}
