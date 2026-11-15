import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiList, FiUpload } from 'react-icons/fi'; // FiUpload add kiya
import api from '../api/axios';

export default function TradeJournal() {
  const navigate = useNavigate();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null);
  const [uploading, setUploading] = useState(false); // Naya state

  // Form State
  const [formData, setFormData] = useState({
    account_id: 1,
    pair: 'EURUSD',
    direction: 'buy',
    entry_price: '',
    stop_loss: '',
    take_profit: '',
    lot_size: '',
    notes: ''
  });

  // Fetch Trades on load
  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      const res = await api.get('/api/trades/');
      setTrades(res.data);
    } catch (err) {
      console.error("Failed to fetch trades", err);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/trades/', {
        ...formData,
        entry_price: Number(formData.entry_price),
        stop_loss: Number(formData.stop_loss),
        take_profit: Number(formData.take_profit),
        lot_size: Number(formData.lot_size)
      });
      setShowForm(false);
      setFormData({ ...formData, entry_price: '', stop_loss: '', take_profit: '', lot_size: '', notes: '' });
      fetchTrades();
    } catch (err) {
      alert('Failed to add trade');
    }
  };

  // CSV Upload Function
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/api/csv/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(`${res.data.imported_count} trades imported! (${res.data.skipped_count} skipped)`);
      fetchTrades();
    } catch (err) {
      alert('Failed to upload CSV. Check backend connection.');
    }
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-gray-200 font-sans pb-12">
      
      {/* Header */}
      <nav className="border-b border-gray-800 bg-[#0B1120]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400">
              <FiArrowLeft className="text-xl" />
            </button>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Trade Journal
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Import CSV Button */}
            <label className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border border-gray-700">
              <FiUpload /> {uploading ? 'Uploading...' : 'Import CSV'}
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={uploading} />
            </label>

            {/* Add Trade Button */}
            <button 
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            >
              {showForm ? <FiList /> : <FiPlus />} 
              {showForm ? 'View Trades' : 'Add Trade'}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Add Trade Form */}
        {showForm && (
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-2xl mb-8 animate-fade-in">
            <h2 className="text-lg font-semibold text-white mb-4">Log New Trade</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Pair</label>
                <input name="pair" value={formData.pair} onChange={handleInputChange} required className="w-full bg-[#1F2937] text-white px-3 py-2 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Direction</label>
                <select name="direction" value={formData.direction} onChange={handleInputChange} className="w-full bg-[#1F2937] text-white px-3 py-2 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Entry Price</label>
                <input type="number" step="0.0001" name="entry_price" value={formData.entry_price} onChange={handleInputChange} required className="w-full bg-[#1F2937] text-white px-3 py-2 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Lot Size</label>
                <input type="number" step="0.01" name="lot_size" value={formData.lot_size} onChange={handleInputChange} required className="w-full bg-[#1F2937] text-white px-3 py-2 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Stop Loss</label>
                <input type="number" step="0.0001" name="stop_loss" value={formData.stop_loss} onChange={handleInputChange} required className="w-full bg-[#1F2937] text-white px-3 py-2 rounded-lg border border-gray-700 focus:ring-2 focus:ring-red-500 outline-none" />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Take Profit</label>
                <input type="number" step="0.0001" name="take_profit" value={formData.take_profit} onChange={handleInputChange} required className="w-full bg-[#1F2937] text-white px-3 py-2 rounded-lg border border-gray-700 focus:ring-2 focus:ring-green-500 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="text-gray-400 text-sm mb-1 block">Notes (Optional)</label>
                <input name="notes" value={formData.notes} onChange={handleInputChange} className="w-full bg-[#1F2937] text-white px-3 py-2 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Setup details..." />
              </div>
              <div className="md:col-span-4 flex justify-end mt-2">
                <button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold px-6 py-2 rounded-lg transition-all shadow-lg">
                  Save Trade
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Trades Table */}
        {!showForm && (
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-2xl overflow-hidden">
            <h2 className="text-lg font-semibold text-white mb-6">Recent Trades</h2>
            
            {loading ? (
              <p className="text-center text-gray-500 py-8">Loading trades...</p>
            ) : trades.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No trades found. Add your first trade!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-gray-400 border-b border-gray-800">
                    <tr>
                      <th className="pb-3 px-4">Pair</th>
                      <th className="pb-3 px-4">Direction</th>
                      <th className="pb-3 px-4">Entry</th>
                      <th className="pb-3 px-4">SL</th>
                      <th className="pb-3 px-4">TP</th>
                      <th className="pb-3 px-4">Lot</th>
                      <th className="pb-3 px-4">Status</th>
                      <th className="pb-3 px-4">Date</th>
                      <th className="pb-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {trades.map((trade) => (
                      <tr key={trade.id} className="hover:bg-gray-800/50 transition-colors">
                        <td className="py-4 px-4 font-bold text-white">{trade.pair}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${trade.direction === 'buy' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {trade.direction.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-300">{trade.entry_price}</td>
                        <td className="py-4 px-4 text-red-400">{trade.stop_loss}</td>
                        <td className="py-4 px-4 text-green-400">{trade.take_profit}</td>
                        <td className="py-4 px-4 text-gray-300">{trade.lot_size}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-medium border ${
                            trade.result === 'win' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                            trade.result === 'loss' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                            {trade.result.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-500 text-xs">
                          {new Date(trade.opened_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          {trade.result === 'open' ? (
                            <button 
                              onClick={() => setEditingTrade(trade)}
                              className="text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors"
                            >
                              Close Trade
                            </button>
                          ) : (
                            <span className="text-gray-600 text-sm">Closed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Close Trade Modal */}
      {editingTrade && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl w-96 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Close Trade: {editingTrade.pair}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm block mb-1">Exit Price</label>
                <input type="number" step="0.0001" id="exitPrice" className="w-full bg-[#1F2937] text-white px-3 py-2 rounded-lg border border-gray-700 outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 1.1050" />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Result</label>
                <select id="tradeResult" className="w-full bg-[#1F2937] text-white px-3 py-2 rounded-lg border border-gray-700 outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="win">Win (Take Profit)</option>
                  <option value="loss">Loss (Stop Loss)</option>
                  <option value="breakeven">Breakeven</option>
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Profit / Loss ($)</label>
                <input type="number" id="tradePnl" className="w-full bg-[#1F2937] text-white px-3 py-2 rounded-lg border border-gray-700 outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 50 or -20" />
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setEditingTrade(null)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    const exit_price = Number(document.getElementById('exitPrice').value);
                    const result = document.getElementById('tradeResult').value;
                    const pnl = Number(document.getElementById('tradePnl').value);
                    
                    try {
                      await api.put(`/api/trades/${editingTrade.id}`, { exit_price, result, pnl });
                      setEditingTrade(null);
                      fetchTrades();
                    } catch (err) {
                      alert('Failed to close trade');
                    }
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg transition-colors shadow-lg shadow-blue-500/20"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}