import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiActivity, FiTarget, FiTrendingUp } from 'react-icons/fi';
import api from '../api/axios';

export default function Calculator() {
  const navigate = useNavigate();
  
  // Input states
  const [balance, setBalance] = useState(1000);
  const [riskPct, setRiskPct] = useState(1);
  const [slPips, setSlPips] = useState(20);
  const [entry, setEntry] = useState(1.1000);
  const [sl, setSl] = useState(1.0980);
  const [tp, setTp] = useState(1.1050);

  // Output states
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    setLoading(true);
    try {
      // Position Size API Call
      const posRes = await api.post('/api/calculator/position-size', {
        balance: Number(balance),
        risk_pct: Number(riskPct),
        sl_pips: Number(slPips),
        pip_value_per_lot: 10
      });

      // R:R API Call
      const rrRes = await api.post('/api/calculator/rr', {
        entry: Number(entry),
        stop_loss: Number(sl),
        take_profit: Number(tp),
        direction: 'buy'
      });

      // Breakeven API Call (using R:R ratio)
      const beRes = await api.post('/api/calculator/breakeven', {
        rr_ratio: rrRes.data.rr_ratio || 1
      });

      setResults({
        riskAmount: posRes.data.risk_amount,
        lotSize: posRes.data.lot_size,
        rrRatio: rrRes.data.rr_ratio,
        breakeven: beRes.data.breakeven_win_rate
      });
    } catch (err) {
      console.error(err);
      alert('Calculation failed. Check backend connection.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-gray-200 font-sans selection:bg-blue-500 selection:text-white pb-12">
      
      {/* Header */}
      <nav className="border-b border-gray-800 bg-[#0B1120]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 transition-colors">
            <FiArrowLeft className="text-xl" />
          </button>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Risk Calculator
          </h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Side: Inputs */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <FiActivity className="text-blue-500" /> Trade Parameters
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Account Balance ($)</label>
              <input type="number" value={balance} onChange={(e) => setBalance(e.target.value)} className="w-full bg-[#1F2937] text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none border border-gray-700" />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Risk (%)</label>
              <input type="number" step="0.1" value={riskPct} onChange={(e) => setRiskPct(e.target.value)} className="w-full bg-[#1F2937] text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none border border-gray-700" />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Stop Loss (Pips)</label>
              <input type="number" value={slPips} onChange={(e) => setSlPips(e.target.value)} className="w-full bg-[#1F2937] text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none border border-gray-700" />
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 space-y-4">
            <h3 className="text-lg font-medium text-white">Price Levels</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Entry</label>
                <input type="number" step="0.0001" value={entry} onChange={(e) => setEntry(e.target.value)} className="w-full bg-[#1F2937] text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none border border-gray-700" />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Stop Loss</label>
                <input type="number" step="0.0001" value={sl} onChange={(e) => setSl(e.target.value)} className="w-full bg-[#1F2937] text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-red-500 outline-none border border-gray-700" />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Take Profit</label>
                <input type="number" step="0.0001" value={tp} onChange={(e) => setTp(e.target.value)} className="w-full bg-[#1F2937] text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none border border-gray-700" />
              </div>
            </div>
          </div>

          <button 
            onClick={calculate} 
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
          >
            {loading ? 'Calculating...' : 'Calculate Risk'}
          </button>
        </div>

        {/* Right Side: Results */}
        <div className="space-y-6">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
            <h2 className="text-xl font-semibold text-white mb-6 relative z-10 flex items-center gap-2">
              <FiTarget className="text-purple-500" /> Analysis Results
            </h2>

            {!results ? (
              <div className="text-center py-12 text-gray-500">
                Enter trade details and click Calculate.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="bg-[#1F2937] p-4 rounded-xl border border-gray-700">
                  <p className="text-gray-400 text-sm mb-1">Risk Amount</p>
                  <p className="text-2xl font-bold text-red-400">${results.riskAmount}</p>
                </div>
                <div className="bg-[#1F2937] p-4 rounded-xl border border-gray-700">
                  <p className="text-gray-400 text-sm mb-1">Lot Size</p>
                  <p className="text-2xl font-bold text-white">{results.lotSize}</p>
                </div>
                <div className="bg-[#1F2937] p-4 rounded-xl border border-gray-700">
                  <p className="text-gray-400 text-sm mb-1">Risk : Reward</p>
                  <p className="text-2xl font-bold text-green-400">1 : {results.rrRatio}</p>
                </div>
                <div className="bg-[#1F2937] p-4 rounded-xl border border-gray-700">
                  <p className="text-gray-400 text-sm mb-1">Breakeven Win Rate</p>
                  <p className="text-2xl font-bold text-blue-400">{results.breakeven}%</p>
                </div>
              </div>
            )}
          </div>

          {/* Educational Panel */}
          <div className="bg-gradient-to-br from-[#111827] to-[#1F2937] border border-gray-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
              <FiTrendingUp className="text-blue-500" /> Pro Tip
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Never risk more than 1-2% of your account on a single trade. 
              A good Risk:Reward ratio is at least 1:2. If your breakeven win rate is low, 
              your strategy has a higher statistical edge.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}