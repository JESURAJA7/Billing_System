import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Download, Search, Calendar, Filter } from 'lucide-react';
import type { Bill } from '../lib/api';

export default function Reports() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const data = await api.get<Bill[]>('/bills');
      setBills(data || []);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBills = bills.filter((bill) => {
    const matchesSearch =
      bill.bill_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bill.customer_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || bill.bill_type === filterType;

    const billDate = new Date(bill.date);
    const matchesDateRange =
      (!startDate || billDate >= new Date(startDate)) &&
      (!endDate || billDate <= new Date(endDate));

    return matchesSearch && matchesType && matchesDateRange;
  });

  const downloadCSV = () => {
    const headers = ['Bill Number', 'Type', 'Date', 'Time', 'Customer', 'Total Amount'];
    const rows = filteredBills.map((bill) => [
      bill.bill_number,
      bill.bill_type,
      bill.date,
      bill.time,
      bill.customer_name || '-',
      bill.total_amount,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bills_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadDetailedReport = (bill: Bill) => {
    const headers = ['Item', 'Quantity', 'Rate', 'Amount'];
    const rows = bill.bill_items.map((item) => [
      item.item_name,
      item.quantity,
      item.rate,
      item.amount,
    ]);

    const csvContent = [
      `Bill Number: ${bill.bill_number}`,
      `Type: ${bill.bill_type}`,
      `Date: ${bill.date}`,
      `Customer: ${bill.customer_name || '-'}`,
      '',
      headers.join(','),
      ...rows.map((row) => row.join(',')),
      '',
      `Total,,,${bill.total_amount}`,
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${bill.bill_number}_detailed.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTotalRevenue = () => {
    return filteredBills.reduce((sum, bill) => sum + parseFloat(bill.total_amount.toString()), 0);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Reports</h2>
        <button
          onClick={downloadCSV}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Summary Report
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Bills</p>
            <p className="text-2xl font-bold text-gray-800">{filteredBills.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-800">₹{getTotalRevenue().toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Average Bill</p>
            <p className="text-2xl font-bold text-gray-800">
              ₹{filteredBills.length > 0 ? (getTotalRevenue() / filteredBills.length).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none"
            >
              <option value="all">All Types</option>
              <option value="exchange">Exchange</option>
              <option value="retail">Retail</option>
              <option value="service">Service</option>
              <option value="wholesale">Wholesale</option>
            </select>
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Start Date"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="End Date"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading bills...</p>
        </div>
      ) : filteredBills.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No bills found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bill Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBills.map((bill) => (
                  <tr key={bill._id || bill.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">{bill.bill_number}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                        {bill.bill_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(bill.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {bill.customer_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{parseFloat(bill.total_amount.toString()).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => downloadDetailedReport(bill)}
                        className="flex items-center px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
