import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCpu, FiActivity } from 'react-icons/fi';
import api from '../api/axios';

export default function MLPredictor() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ entry: '', stop_loss: '', take_profit: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/api/ml/predict', {
        entry: Number(formData.entry),
        stop_loss: Number(formData.stop_loss),
        take_profit: Number(formData.take_profit)
      });
      setResult(res.data);
    } catch (err) {
      alert('Prediction failed. Check backend console.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-gray-200 font-sans pb-12">
      <nav className="border-b border-gray-800 bg-[#0B1120]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400">
            <FiArrowLeft className="text-xl" />
          </button>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            ML Predictor
          </h1>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
          
          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
              <FiCpu className="text-white text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">AI Win Probability</h2>
              <p className="text-gray-400 text-sm">Our ML model analyzes your past trades to predict the outcome of this setup.</p>
            </div>
          </div>

          <form onSubmit={handlePredict} className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10 mb-8">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Entry Price</label>
              <input type="number" step="0.0001" required value={formData.entry} onChange={e => setFormData({...formData, entry: e.target.value})} className="w-full bg-[#1F2937] text-white px-4 py-3 rounded-xl border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Stop Loss</label>
              <input type="number" step="0.0001" required value={formData.stop_loss} onChange={e => setFormData({...formData, stop_loss: e.target.value})} className="w-full bg-[#1F2937] text-white px-4 py-3 rounded-xl border border-gray-700 focus:ring-2 focus:ring-red-500 outline-none" />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Take Profit</label>
              <input type="number" step="0.0001" required value={formData.take_profit} onChange={e => setFormData({...formData, take_profit: e.target.value})} className="w-full bg-[#1F2937] text-white px-4 py-3 rounded-xl border border-gray-700 focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div className="md:col-span-3">
              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50">
                {loading ? 'Analyzing Data...' : 'Predict Win Probability'}
              </button>
            </div>
          </form>

          {result && (
            <div className="bg-[#1F2937] border border-gray-700 rounded-xl p-6 relative z-10">
              {result.error ? (
                <div className="text-yellow-400 text-center">{result.error}</div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-2">Predicted Win Probability</p>
                  <h3 className={`text-5xl font-extrabold mb-4 ${result.win_probability > 50 ? 'text-green-400' : 'text-red-400'}`}>
                    {result.win_probability}%
                  </h3>
                  <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
                    <FiActivity /> Based on {result.total_trades_analyzed} past trades
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}