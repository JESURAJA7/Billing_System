import { useState } from 'react';
import { api } from '../../lib/api';
import { Save, Plus, Trash2, Printer } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface WholesaleItem {
  item_name: string;
  quantity: string;
  rate: string;
}

export default function WholesaleBill() {
  const { user: _user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [kooli, setKooli] = useState(''); // கூலி (labour charge)
  const [items, setItems] = useState<WholesaleItem[]>([
    { item_name: '', quantity: '', rate: '' },
  ]);

  const handleItemChange = (index: number, field: keyof WholesaleItem, value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () =>
    setItems([...items, { item_name: '', quantity: '', rate: '' }]);

  const removeItem = (index: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };

  // மொத்தம் qty and rate (sum of all rows)
  const totalQty = items.reduce((s, i) => s + (parseFloat(i.quantity) || 0), 0);
  const totalRate = items.reduce((s, i) => s + (parseFloat(i.rate) || 0), 0);
  const totalAmount = totalRate + (parseFloat(kooli) || 0);

  const generateBillNumber = () => `WS${Date.now().toString().slice(-8)}`;

  const v = (val: string) => val.trim() || '-';

  const handlePrint = () => {
    const now = new Date();
    const billNo = generateBillNumber();
    const printWindow = window.open('', '_blank', 'width=700,height=800');
    if (!printWindow) return;

    const itemRows = items.map(i => `
      <tr>
        <td class="item">${v(i.item_name)}</td>
        <td class="center">${v(i.quantity)}</td>
        <td class="right">${v(i.rate)}</td>
      </tr>`).join('');

    printWindow.document.write(`<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<title>Wholesale Bill - ${billNo}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Noto Sans Tamil', Arial, sans-serif;
    padding: 20px 24px;
    color: #111;
    max-width: 520px;
    margin: 0 auto;
    font-size: 14px;
  }
  .divider { border: none; border-top: 1.5px dashed #555; margin: 6px 0; }
  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    font-size: 13px;
  }
  .header-row span { font-weight: 600; }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th, td { padding: 6px 4px; }
  th { font-weight: 700; font-size: 14px; border-bottom: 1px dashed #555; }
  td { font-size: 13px; }
  .item { text-align: left; width: 60%; }
  .center { text-align: center; width: 20%; }
  .right { text-align: right; width: 20%; }
  tr + tr td { border-top: 1px dotted #ddd; }
  .total-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 4px;
    font-weight: 700;
    font-size: 14px;
  }
  .footer-note {
    text-align: right;
    font-size: 13px;
    font-weight: 600;
    padding: 5px 4px;
  }
  .thank-you {
    text-align: center;
    font-size: 14px;
    font-weight: 700;
    padding: 8px 0 4px;
    letter-spacing: 0.04em;
  }
  .brand { text-align: center; font-size: 22px; font-weight: 800; color: #b8860b; letter-spacing: 0.06em; margin-bottom: 1px; }
  .bill-type { text-align: center; font-size: 13px; font-weight: 600; color: #555; margin-bottom: 4px; letter-spacing: 0.05em; }
  @media print { body { padding: 8px; } }
</style>
</head><body>
<div class="brand">MST Gold</div>
<div class="bill-type">Wholesale Bill</div>
<hr class="divider">
<div class="header-row">
  <span>Bill No: ${billNo}</span>
  <span>${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
  <span>${now.toLocaleDateString('en-IN')}</span>
</div>
${customerName ? `<div class="header-row"><span>பெயர்: ${customerName}</span></div>` : ''}
<hr class="divider">

<table>
  <thead>
    <tr>
      <th class="item">பொருள்</th>
      <th class="center">qty</th>
      <th class="right">விலை</th>
    </tr>
  </thead>
  <tbody>
    ${itemRows}
  </tbody>
</table>

<hr class="divider">
<div class="total-section">
  <span>மொத்தம்</span>
  <span>${totalQty > 0 ? totalQty.toFixed(2) : '-'}</span>
  <span>${totalRate > 0 ? totalRate.toFixed(2) : '-'}</span>
</div>
<hr class="divider">

<div class="footer-note">கூலி &nbsp; ரூ : ${kooli ? parseFloat(kooli).toFixed(2) : '-'}</div>
<hr class="divider">
<div class="thank-you">நன்றி மீண்டும் வருக ...</div>
<hr class="divider">

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
      const billItems = items
        .filter(i => i.item_name || i.quantity || i.rate)
        .map(i => ({
          item_name: i.item_name || '-',
          quantity: parseFloat(i.quantity) || 0,
          rate: parseFloat(i.rate) || 0,
          amount: (parseFloat(i.quantity) || 0) * (parseFloat(i.rate) || 0),
        }));

      if (kooli) {
        billItems.push({ item_name: 'கூலி', quantity: 1, rate: parseFloat(kooli), amount: parseFloat(kooli) });
      }

      await api.post('/bills', {
        bill_number: billNumber,
        bill_type: 'wholesale',
        customer_name: customerName || null,
        total_amount: totalAmount,
        bill_items: billItems,
      });

      setSuccess(`Bill ${billNumber} saved successfully!`);
      setCustomerName('');
      setKooli('');
      setItems([{ item_name: '', quantity: '', rate: '' }]);
    } catch (err) {
      setError('Failed to save bill. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // UI styles
  const thStyle: React.CSSProperties = {
    padding: '8px 10px',
    fontSize: '13px',
    fontWeight: 700,
    color: '#92400e',
    background: 'rgba(212,175,55,0.12)',
    textAlign: 'center',
    borderBottom: '1.5px solid rgba(212,175,55,0.3)',
  };

  const tdStyle: React.CSSProperties = {
    padding: '6px 6px',
    verticalAlign: 'middle',
  };

  const inputBase: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    outline: 'none',
    transition: 'border-color 0.2s',
    background: '#fff',
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Wholesale Bill</h2>

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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer Name (Optional)
          </label>
          <input
            type="text"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            style={{ ...inputBase, fontSize: '15px' }}
            placeholder="Enter customer name"
          />
        </div>

        {/* Items Table */}
        <div style={{
          border: '1.5px solid rgba(212,175,55,0.3)',
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(212,175,55,0.1)',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, textAlign: 'left', width: '50%' }}>பொருள்</th>
                <th style={{ ...thStyle, width: '22%' }}>qty</th>
                <th style={{ ...thStyle, width: '22%' }}>விலை</th>
                <th style={{ ...thStyle, width: '6%' }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} style={{ background: index % 2 === 0 ? 'rgba(255,255,255,0.8)' : 'rgba(212,175,55,0.04)' }}>
                  <td style={tdStyle}>
                    <input
                      type="text"
                      value={item.item_name}
                      onChange={e => handleItemChange(index, 'item_name', e.target.value)}
                      style={inputBase}
                      placeholder="பொருள் பெயர்"
                      onFocus={e => (e.target.style.borderColor = '#d4af37')}
                      onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                    />
                  </td>
                  <td style={tdStyle}>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={item.quantity}
                      onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                      style={{ ...inputBase, textAlign: 'center' }}
                      placeholder="0"
                      onFocus={e => (e.target.style.borderColor = '#d4af37')}
                      onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                    />
                  </td>
                  <td style={tdStyle}>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.rate}
                      onChange={e => handleItemChange(index, 'rate', e.target.value)}
                      style={{ ...inputBase, textAlign: 'right' }}
                      placeholder="0.00"
                      onFocus={e => (e.target.style.borderColor = '#d4af37')}
                      onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                    />
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: items.length === 1 ? '#d1d5db' : '#ef4444',
                        fontSize: '18px', lineHeight: 1,
                      }}
                      title="Remove row"
                    >
                      <Trash2 style={{ width: '15px', height: '15px' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Item Button */}
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition"
          style={{ color: '#b8860b', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)' }}
        >
          <Plus className="w-4 h-4" />
          Add Row
        </button>

        {/* மொத்தம் row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(255,215,0,0.08))',
          border: '1.5px solid rgba(212,175,55,0.4)',
          borderRadius: '12px',
          padding: '12px 20px',
          fontWeight: 700,
          fontSize: '16px',
          color: '#92400e',
        }}>
          <span>மொத்தம்</span>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>
            qty: <strong style={{ color: '#92400e' }}>{totalQty > 0 ? totalQty.toFixed(3) : '-'}</strong>
            &nbsp;&nbsp; விலை: <strong style={{ color: '#92400e' }}>{totalRate > 0 ? totalRate.toFixed(2) : '-'}</strong>
          </span>
        </div>

        {/* கூலி */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(255,255,255,0.7)',
          border: '1.5px solid rgba(212,175,55,0.25)',
          borderRadius: '12px',
          padding: '10px 20px',
        }}>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#92400e', minWidth: '100px' }}>கூலி  ரூ</span>
          <span style={{ color: '#d4af37', fontWeight: 700, fontSize: '18px' }}>:</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={kooli}
            onChange={e => setKooli(e.target.value)}
            style={{ ...inputBase, maxWidth: '140px', textAlign: 'right', fontSize: '16px', fontWeight: 600 }}
            placeholder="0.00"
            onFocus={e => (e.target.style.borderColor = '#d4af37')}
            onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
          />
        </div>

        {/* நன்றி */}
        <div style={{
          textAlign: 'center',
          fontSize: '15px',
          fontWeight: 600,
          color: '#b8860b',
          padding: '4px',
          letterSpacing: '0.04em',
        }}>
          நன்றி மீண்டும் வருக ...
        </div>

        {/* Footer Buttons */}
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
