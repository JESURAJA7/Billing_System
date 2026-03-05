import { useState } from 'react';
import { api } from '../../lib/api';
import { Save, Printer } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function ExchangeBill() {
  const { user: _user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [gms, setGms] = useState('');
  const [touch, setTouch] = useState('');

  // Pure = Gms × Touch / 100, formatted to 3 decimal places
  const pure = (() => {
    const g = parseFloat(gms) || 0;
    const t = parseFloat(touch) || 0;
    return g > 0 && t > 0 ? (g * t / 100).toFixed(3) : '';
  })();

  const generateBillNumber = () => {
    return `EX${Date.now().toString().slice(-8)}`;
  };

  const handlePrint = () => {
    const now = new Date();
    const billNo = generateBillNumber();
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html><html><head><title>Exchange Bill - ${billNo}</title>
<style>
  body { font-family: Arial, sans-serif; padding: 30px; color: #111; }
  h2 { text-align: center; margin-bottom: 4px; }
  p { text-align: center; margin: 2px 0; color: #555; font-size: 13px; }
  table { width: 60%; margin: 24px auto 0; border-collapse: collapse; }
  th { background: #f5f5f5; padding: 10px 16px; text-align: left; border-bottom: 2px solid #ddd; font-size: 14px; }
  td { padding: 10px 16px; border-bottom: 1px solid #eee; font-size: 14px; }
  td:last-child { text-align: right; font-weight: bold; }
  .total-row td { font-weight: bold; border-top: 2px solid #333; font-size: 15px; }
  .brand { text-align: center; font-size: 22px; font-weight: 800; color: #b8860b; letter-spacing: 0.06em; margin-bottom: 2px; }
  .bill-type { text-align: center; font-size: 14px; font-weight: 600; color: #555; margin-bottom: 6px; letter-spacing: 0.05em; }
  .thank-you { text-align: center; font-size: 14px; font-weight: 700; padding: 10px 0 4px; letter-spacing: 0.04em; color: #333; }
  @media print { body { padding: 0; } }
</style></head><body>
<div class="brand">MST Gold</div>
<div class="bill-type">Exchange Bill</div>
<p>Bill No: <strong>${billNo}</strong></p>
<p>Date: ${now.toLocaleDateString('en-IN')} &nbsp; Time: ${now.toLocaleTimeString('en-IN')}</p>
${customerName ? `<p>Customer: <strong>${customerName}</strong></p>` : ''}
<table>
  <thead><tr><th>Field</th><th style="text-align:right">Value</th></tr></thead>
  <tbody>
    <tr><td>Gms</td><td style="text-align:right">${parseFloat(gms || '0').toFixed(3)}</td></tr>
    <tr><td>Touch</td><td style="text-align:right">${parseFloat(touch || '0').toFixed(2)}</td></tr>
    <tr class="total-row"><td>Pure</td><td style="text-align:right">${pure || '0.000'}</td></tr>
  </tbody>
</table>
<div class="thank-you">நன்றி மீண்டும் வருக ...</div>
</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const billNumber = generateBillNumber();

      const billItems = [
        { item_name: 'Gms',   quantity: parseFloat(gms)   || 0, rate: 1, amount: parseFloat(gms)   || 0 },
        { item_name: 'Touch', quantity: parseFloat(touch) || 0, rate: 1, amount: parseFloat(touch) || 0 },
        { item_name: 'Pure',  quantity: parseFloat(pure)  || 0, rate: 1, amount: parseFloat(pure)  || 0 },
      ];

      await api.post('/bills', {
        bill_number: billNumber,
        bill_type: 'exchange',
        customer_name: customerName || null,
        total_amount: parseFloat(pure) || 0,
        bill_items: billItems,
      });

      setSuccess(`Bill ${billNumber} saved successfully!`);
      setCustomerName('');
      setGms('');
      setTouch('');
    } catch (err) {
      setError('Failed to save bill. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Input field style
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '18px',
    fontWeight: 600,
    outline: 'none',
    background: '#fff',
    transition: 'border-color 0.2s',
    textAlign: 'right',
    letterSpacing: '0.03em',
  };

  const labelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'rgba(255,255,255,0.7)',
    border: '1.5px solid rgba(212,175,55,0.25)',
    borderRadius: '12px',
    padding: '10px 16px',
    gap: '12px',
    boxShadow: '0 2px 8px rgba(212,175,55,0.08)',
  };

  const fieldLabelStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 700,
    color: '#92400e',
    minWidth: '80px',
    letterSpacing: '0.04em',
  };

  const pureRowStyle: React.CSSProperties = {
    ...labelStyle,
    background: 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(255,215,0,0.08) 100%)',
    border: '1.5px solid rgba(212,175,55,0.45)',
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Exchange Bill</h2>

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Customer Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer Name (Optional)
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            style={{ ...inputStyle, textAlign: 'left', fontWeight: 500 }}
            placeholder="Enter customer name"
          />
        </div>

        {/* Exchange Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '360px', margin: '0 auto' }}>

          {/* Gms */}
          <div style={labelStyle}>
            <span style={fieldLabelStyle}>Gms</span>
            <span style={{ color: '#d4af37', fontWeight: 700, fontSize: '18px' }}>:</span>
            <input
              type="number"
              step="0.001"
              min="0"
              value={gms}
              onChange={(e) => setGms(e.target.value)}
              style={{ ...inputStyle, maxWidth: '130px' }}
              placeholder="0.000"
              required
              onFocus={e => (e.target.style.borderColor = '#d4af37')}
              onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
            />
          </div>

          {/* Touch */}
          <div style={labelStyle}>
            <span style={fieldLabelStyle}>Touch</span>
            <span style={{ color: '#d4af37', fontWeight: 700, fontSize: '18px' }}>:</span>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={touch}
              onChange={(e) => setTouch(e.target.value)}
              style={{ ...inputStyle, maxWidth: '130px' }}
              placeholder="0.00"
              required
              onFocus={e => (e.target.style.borderColor = '#d4af37')}
              onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
            />
          </div>

          {/* Pure — auto-calculated */}
          <div style={pureRowStyle}>
            <span style={{ ...fieldLabelStyle, color: '#b8860b' }}>Pure</span>
            <span style={{ color: '#d4af37', fontWeight: 700, fontSize: '18px' }}>:</span>
            <div
              style={{
                ...inputStyle,
                maxWidth: '130px',
                background: 'rgba(212,175,55,0.08)',
                border: '1.5px solid rgba(212,175,55,0.3)',
                color: pure ? '#92400e' : '#9ca3af',
                cursor: 'default',
              }}
            >
              {pure || '0.000'}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            {pure && (
              <span>
                Pure Weight: <strong style={{ color: '#92400e', fontSize: '16px' }}>{pure} g</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center px-5 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 transition"
            >
              <Printer className="w-5 h-5 mr-2" />
              Print
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Save className="w-5 h-5 mr-2" />
              {loading ? 'Saving...' : 'Save Bill'}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
