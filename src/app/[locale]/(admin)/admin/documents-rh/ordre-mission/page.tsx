"use client";
import { useState } from "react";
import { Plane, Download, Eye } from "lucide-react";
type RHLanguage = 'fr' | 'en' | 'ar' | 'es';
type TransportMode = 'car' | 'train' | 'plane' | 'bus' | 'other';
type ApprovalStatus = 'approved' | 'pending';

export default function OrdreMissionPage() {
  const [lang, setLang] = useState<RHLanguage>('fr');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    refNumber: `OM-${new Date().getFullYear()}/001`,
    employeeFullName: '',
    employeeCIN: '',
    position: '',
    department: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    missionPurpose: '',
    transportMode: 'car' as TransportMode,
    accommodation: '',
    estimatedBudget: 0,
    notes: '',
    approvalStatus: 'pending' as ApprovalStatus,
    issueDate: new Date().toISOString().split('T')[0],
    issueCity: 'Marrakech',
  });

  const handleSubmit = async (action: 'preview' | 'download') => {
    setLoading(true);
    try {
      const response = await fetch('/api/rh/ordre-mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, lang }),
      });
      if (!response.ok) throw new Error('Failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      if (action === 'preview') window.open(url, '_blank');
      else {
        const a = document.createElement('a');
        a.href = url;
        a.download = `Ordre_Mission_${formData.refNumber}.pdf`;
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
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-xl flex items-center justify-center">
            <Plane className="w-6 h-6 text-amber-700 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ordre de Mission</h1>
            <p className="text-gray-500 dark:text-gray-400">Mission Order Generator</p>
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
          <h2 className="text-lg font-semibold mb-4">Document Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">Reference</label><input type="text" value={formData.refNumber} onChange={(e) => setFormData({ ...formData, refNumber: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
            <div><label className="block text-sm font-medium mb-1">Issue Date</label><input type="date" value={formData.issueDate} onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
            <div><label className="block text-sm font-medium mb-1">Issue City</label><input type="text" value={formData.issueCity} onChange={(e) => setFormData({ ...formData, issueCity: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Employee Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Full Name *</label><input type="text" required value={formData.employeeFullName} onChange={(e) => setFormData({ ...formData, employeeFullName: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="John Doe" /></div>
            <div><label className="block text-sm font-medium mb-1">CIN *</label><input type="text" required value={formData.employeeCIN} onChange={(e) => setFormData({ ...formData, employeeCIN: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="AA123456" /></div>
            <div><label className="block text-sm font-medium mb-1">Position *</label><input type="text" required value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Sales Manager" /></div>
            <div><label className="block text-sm font-medium mb-1">Department *</label><input type="text" required value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Sales" /></div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Mission Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Destination *</label><input type="text" required value={formData.destination} onChange={(e) => setFormData({ ...formData, destination: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Casablanca" /></div>
            <div><label className="block text-sm font-medium mb-1">Transport Mode *</label><select value={formData.transportMode} onChange={(e) => setFormData({ ...formData, transportMode: e.target.value as TransportMode })} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"><option value="car">Car</option><option value="train">Train</option><option value="plane">Plane</option><option value="bus">Bus</option><option value="other">Other</option></select></div>
            <div><label className="block text-sm font-medium mb-1">Departure Date *</label><input type="date" required value={formData.departureDate} onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
            <div><label className="block text-sm font-medium mb-1">Return Date *</label><input type="date" required value={formData.returnDate} onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
            <div><label className="block text-sm font-medium mb-1">Accommodation</label><input type="text" value={formData.accommodation} onChange={(e) => setFormData({ ...formData, accommodation: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Hotel Name" /></div>
            <div><label className="block text-sm font-medium mb-1">Estimated Budget (DH)</label><input type="number" value={formData.estimatedBudget} onChange={(e) => setFormData({ ...formData, estimatedBudget: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" step="0.01" /></div>
            <div className="col-span-2"><label className="block text-sm font-medium mb-1">Mission Purpose *</label><textarea required value={formData.missionPurpose} onChange={(e) => setFormData({ ...formData, missionPurpose: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" rows={3} placeholder="Describe the purpose of this mission..." /></div>
            <div className="col-span-2"><label className="block text-sm font-medium mb-1">Notes</label><textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white" rows={2} placeholder="Additional notes..." /></div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Approval Status</h2>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="radio" name="approval" value="pending" checked={formData.approvalStatus === 'pending'} onChange={() => setFormData({ ...formData, approvalStatus: 'pending' })} className="text-amber-600" />
              <span className="text-sm font-medium">Pending</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="approval" value="approved" checked={formData.approvalStatus === 'approved'} onChange={() => setFormData({ ...formData, approvalStatus: 'approved' })} className="text-amber-600" />
              <span className="text-sm font-medium">Approved</span>
            </label>
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
