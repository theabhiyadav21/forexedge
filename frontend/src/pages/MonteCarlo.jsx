import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiActivity, FiTrendingUp } from 'react-icons/fi';
import api from '../api/axios';

export default function MonteCarlo() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    win_rate: 40,
    rr_ratio: 2,
    num_trades: 100,
    risk_pct: 1,
    simulations: 1000
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/api/advanced/monte-carlo', {
        win_rate: Number(formData.win_rate),
        rr_ratio: Number(formData.rr_ratio),
        num_trades: Number(formData.num_trades),
        risk_pct: Number(formData.risk_pct),
        simulations: Number(formData.simulations)
      });
      setResult(res.data);
    } catch (err) {
      alert('Simulation failed.');
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
            Monte Carlo Simulation
          </h1>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-6">Strategy Parameters</h2>
          <form onSubmit={runSimulation} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Win Rate (%)</label>
                <input type="number" value={formData.win_rate} onChange={e => setFormData({...formData, win_rate: e.target.value})} className="w-full bg-[#1F2937] text-white px-3 py-2 rounded-lg border border-gray-700 outline-none" />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Risk:Reward (1:X)</label>
                <input type="number" step="0.1" value={formData.rr_ratio} onChange={e => setFormData({...formData, rr_ratio: e.target.value})} className="w-full bg-[#1F2937] text-white px-3 py-2 rounded-lg border border-gray-700 outline-none" />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Total Trades</label>
                <input type="number" value={formData.num_trades} onChange={e => setFormData({...formData, num_trades: e.target.value})} className="w-full bg-[#1F2937] text-white px-3 py-2 rounded-lg border border-gray-700 outline-none" />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Risk per Trade (%)</label>
                <input type="number" step="0.1" value={formData.risk_pct} onChange={e => setFormData({...formData, risk_pct: e.target.value})} className="w-full bg-[#1F2937] text-white px-3 py-2 rounded-lg border border-gray-700 outline-none" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-xl mt-4 transition-all shadow-lg disabled:opacity-50">
              {loading ? 'Running 1000 Simulations...' : 'Run Simulation'}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-6">Results</h2>
          {!result ? (
            <div className="text-center text-gray-500 py-12">Run a simulation to see results.</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1F2937] p-4 rounded-xl text-center border border-gray-700">
                  <p className="text-gray-400 text-sm mb-1">Median Balance</p>
                  <p className="text-xl font-bold text-white">${result.median_final_balance}</p>
                </div>
                <div className="bg-[#1F2937] p-4 rounded-xl text-center border border-gray-700">
                  <p className="text-gray-400 text-sm mb-1">Worst Case (5%)</p>
                  <p className="text-xl font-bold text-red-400">${result.worst_5pct_balance}</p>
                </div>
                <div className="bg-[#1F2937] p-4 rounded-xl text-center border border-gray-700">
                  <p className="text-gray-400 text-sm mb-1">Median Drawdown</p>
                  <p className="text-xl font-bold text-yellow-400">{result.median_max_drawdown_pct}%</p>
                </div>
                <div className="bg-[#1F2937] p-4 rounded-xl text-center border border-gray-700">
                  <p className="text-gray-400 text-sm mb-1">Worst Drawdown</p>
                  <p className="text-xl font-bold text-red-500">{result.worst_max_drawdown_pct}%</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center">
                * Based on {formData.simulations} simulations of {formData.num_trades} trades.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}