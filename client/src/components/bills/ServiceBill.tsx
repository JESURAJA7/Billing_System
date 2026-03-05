import { useState } from 'react';
import { api } from '../../lib/api';
import { Save, Printer } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function ServiceBill() {
  const { user: _user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [customerName, setCustomerName] = useState('');

  // Inputs
  const [thangaEdai, setThangaEdai] = useState('');     // தங்க எடை  (Gold Weight)
  const [thangaTaram, setThangaTaram] = useState('');   // தங்க தரம்  (Gold Purity %)
  const [vendiyaTaram, setVendiyaTaram] = useState(''); // வேண்டிய தரம் (Required Purity %)
  const [sembu, setSembu] = useState('');               // செம்பு (manual entry)

  // Auto-calculated — temporarily commented out
  // const serkkaVendiyaTaram = (() => {
  //   const weight = parseFloat(thangaEdai) || 0;
  //   const current = parseFloat(thangaTaram) || 0;
  //   const required = parseFloat(vendiyaTaram) || 0;
  //   if (weight > 0 && required > current && required < 100) {
  //     return ((required - current) * weight / (100 - required)).toFixed(3);
  //   }
  //   return '';
  // })();
  // const sembu = serkkaVendiyaTaram;

  const generateBillNumber = () => `SV${Date.now().toString().slice(-8)}`;

  const val = (v: string, dp = 3) =>
    v ? parseFloat(v).toFixed(dp) : '-';

  const handlePrint = () => {
    const now = new Date();
    const billNo = generateBillNumber();
    const printWindow = window.open('', '_blank', 'width=600,height=700');
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<title>Service Bill - ${billNo}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;600;700&display=swap');
  body {
    font-family: 'Noto Sans Tamil', Arial, sans-serif;
    padding: 36px 40px;
    color: #111;
    max-width: 480px;
    margin: 0 auto;
  }
  h2 { text-align: center; font-size: 20px; margin-bottom: 4px; }
  .meta { text-align: center; font-size: 12px; color: #555; margin: 2px 0; }
  .divider { border: none; border-top: 1.5px dashed #999; margin: 12px 0; }
  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 7px 0;
    font-size: 15px;
  }
  .label { font-weight: 600; color: #333; }
  .value { font-weight: 700; font-size: 16px; color: #111; text-align: right; }
  .section-title {
    text-align: center;
    font-weight: 700;
    font-size: 14px;
    color: #555;
    margin: 4px 0;
    letter-spacing: 0.03em;
  }
  .highlight .label { color: #7c3d00; }
  .highlight .value { color: #92400e; font-size: 17px; }
  .brand { text-align: center; font-size: 22px; font-weight: 800; color: #b8860b; letter-spacing: 0.06em; margin-bottom: 2px; }
  .bill-type { text-align: center; font-size: 14px; font-weight: 600; color: #555; margin-bottom: 6px; letter-spacing: 0.05em; }
  .thank-you { text-align: center; font-size: 14px; font-weight: 700; padding: 10px 0 4px; letter-spacing: 0.04em; color: #333; }
  @media print { body { padding: 10px; } }
</style>
</head><body>
<div class="brand">MST Gold</div>
<div class="bill-type">Service Bill</div>
<p class="meta">Bill No: <strong>${billNo}</strong></p>
<p class="meta">Date: ${now.toLocaleDateString('en-IN')} &nbsp; Time: ${now.toLocaleTimeString('en-IN')}</p>
${customerName ? `<p class="meta">Customer: <strong>${customerName}</strong></p>` : ''}
<hr class="divider">

<div class="row">
  <span class="label">தங்க எடை</span>
  <span class="value">${val(thangaEdai, 3)}</span>
</div>
<div class="row">
  <span class="label">தங்க தரம்</span>
  <span class="value">${val(thangaTaram, 2)}</span>
</div>
<div class="row">
  <span class="label">வேண்டிய தரம்</span>
  <span class="value">${val(vendiyaTaram, 2)}</span>
</div>

<hr class="divider">
<p class="section-title">சேர்க்க வேண்டிய தரம்</p>
<hr class="divider">

<div class="row highlight">
  <span class="label">செம்பு</span>
  <span class="value">${sembu ? parseFloat(sembu).toFixed(3) : '-'}</span>
</div>

<hr class="divider">
<div class="thank-you">நன்றி மீண்டும் வருக ...</div>
</body></html>`);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 400);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const billNumber = generateBillNumber();
      const billItems = [
        { item_name: 'தங்க எடை',           quantity: parseFloat(thangaEdai)    || 0, rate: 1, amount: parseFloat(thangaEdai)    || 0 },
        { item_name: 'தங்க தரம்',           quantity: parseFloat(thangaTaram)   || 0, rate: 1, amount: parseFloat(thangaTaram)   || 0 },
        { item_name: 'வேண்டிய தரம்',        quantity: parseFloat(vendiyaTaram)  || 0, rate: 1, amount: parseFloat(vendiyaTaram)  || 0 },
        { item_name: 'சேர்க்க வேண்டிய தரம்', quantity: parseFloat(sembu) || 0, rate: 1, amount: parseFloat(sembu) || 0 },
        { item_name: 'செம்பு',              quantity: parseFloat(sembu)         || 0, rate: 1, amount: parseFloat(sembu)         || 0 },
      ];

      await api.post('/bills', {
        bill_number: billNumber,
        bill_type: 'service',
        customer_name: customerName || null,
        total_amount: parseFloat(sembu) || 0,
        bill_items: billItems,
      });

      setSuccess(`Bill ${billNumber} saved successfully!`);
      setCustomerName('');
      setThangaEdai('');
      setThangaTaram('');
      setVendiyaTaram('');
    } catch (err) {
      setError('Failed to save bill. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Shared styles
  const rowStyle: React.CSSProperties = {
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

  const inputStyle: React.CSSProperties = {
    width: '130px',
    padding: '10px 14px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '18px',
    fontWeight: 600,
    outline: 'none',
    background: '#fff',
    transition: 'border-color 0.2s',
    textAlign: 'right',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 700,
    color: '#92400e',
    minWidth: '160px',
    letterSpacing: '0.02em',
  };

  const colonStyle: React.CSSProperties = {
    color: '#d4af37',
    fontWeight: 700,
    fontSize: '20px',
  };

  const dividerStyle: React.CSSProperties = {
    border: 'none',
    borderTop: '1.5px dashed rgba(212,175,55,0.5)',
    margin: '6px 0',
  };

  const sectionTitleStyle: React.CSSProperties = {
    textAlign: 'center',
    fontSize: '15px',
    fontWeight: 700,
    color: '#b8860b',
    padding: '6px 0',
    letterSpacing: '0.03em',
  };

  const readonlyRowStyle: React.CSSProperties = {
    ...rowStyle,
    background: 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(255,215,0,0.08) 100%)',
    border: '1.5px solid rgba(212,175,55,0.45)',
  };



  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Service Bill</h2>

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

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Customer Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer Name (Optional)
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
            placeholder="Enter customer name"
          />
        </div>

        {/* Fields container — centered */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px', margin: '0 auto' }}>

          {/* தங்க எடை */}
          <div style={rowStyle}>
            <span style={labelStyle}>தங்க எடை</span>
            <span style={colonStyle}>:</span>
            <input
              type="number"
              step="0.001"
              min="0"
              value={thangaEdai}
              onChange={(e) => setThangaEdai(e.target.value)}
              style={inputStyle}
              placeholder="0.000"
              onFocus={e => (e.target.style.borderColor = '#d4af37')}
              onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
            />
          </div>

          {/* தங்க தரம் */}
          <div style={rowStyle}>
            <span style={labelStyle}>தங்க தரம்</span>
            <span style={colonStyle}>:</span>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={thangaTaram}
              onChange={(e) => setThangaTaram(e.target.value)}
              style={inputStyle}
              placeholder="0.00"
              onFocus={e => (e.target.style.borderColor = '#d4af37')}
              onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
            />
          </div>

          {/* வேண்டிய தரம் */}
          <div style={rowStyle}>
            <span style={labelStyle}>வேண்டிய தரம்</span>
            <span style={colonStyle}>:</span>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={vendiyaTaram}
              onChange={(e) => setVendiyaTaram(e.target.value)}
              style={inputStyle}
              placeholder="0.00"
              onFocus={e => (e.target.style.borderColor = '#d4af37')}
              onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
            />
          </div>

          {/* Divider + section title */}
          <hr style={dividerStyle} />
          <div style={sectionTitleStyle}>சேர்க்க வேண்டிய தரம்</div>
          <hr style={dividerStyle} />

          {/* செம்பு — manual input (formula temporarily commented out) */}
          <div style={readonlyRowStyle}>
            <span style={{ ...labelStyle, color: '#b8860b' }}>செம்பு</span>
            <span style={colonStyle}>:</span>
            <input
              type="number"
              step="0.001"
              min="0"
              value={sembu}
              onChange={(e) => setSembu(e.target.value)}
              style={{ ...inputStyle, width: '130px', background: 'rgba(212,175,55,0.08)', border: '1.5px solid rgba(212,175,55,0.3)' }}
              placeholder="0.000"
              onFocus={e => (e.target.style.borderColor = '#d4af37')}
              onBlur={e => (e.target.style.borderColor = 'rgba(212,175,55,0.3)')}
            />
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-4 border-t border-gray-200 gap-3">
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

      </form>
    </div>
  );
}
