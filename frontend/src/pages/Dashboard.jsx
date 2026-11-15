import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { FiLogOut, FiActivity, FiTarget, FiDollarSign, FiList, FiShield } from 'react-icons/fi';
import api from '../api/axios';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [riskStatus, setRiskStatus] = useState(null); // Naya State
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Dono APIs ek saath call karo
        const [statsRes, riskRes] = await Promise.all([
          api.get('/api/analytics/dashboard-stats'),
          api.get('/api/analytics/risk-status')
        ]);
        setStats(statsRes.data);
        setRiskStatus(riskRes.data);
      } catch (err) {
        console.error("Failed to load data", err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0B1120] flex items-center justify-center text-white">Loading Analytics...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-gray-200 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Top Navigation */}
      <nav className="border-b border-gray-800 bg-[#0B1120]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FiActivity className="text-white text-xl" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              ForexEdge
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/journal')}
              className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-700 text-sm transition-all"
            >
              Journal
            </button>

            <button 
              onClick={() => navigate('/ml')}
              className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-700 text-sm transition-all"
            >
              ML Predictor
            </button>

            <button 
              onClick={() => navigate('/calculator')}
              className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-700 text-sm transition-all"
            >
              Calculator
            </button>

            {/* Naya Monte Carlo Button */}
            <button 
              onClick={() => navigate('/montecarlo')}
              className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-700 text-sm transition-all"
            >
              Monte Carlo
            </button>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-gray-800/50 hover:bg-gray-800 px-3 py-2 rounded-lg border border-gray-700"
            >
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        
        {/* Risk Guardrail Banner */}
        {riskStatus && (
          <div className={`p-4 rounded-xl border flex items-center justify-between shadow-lg ${
            riskStatus.status === 'safe' 
              ? 'bg-green-500/10 border-green-500/30 text-green-400' 
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            <div className="flex items-center gap-3">
              <FiShield className="text-2xl" />
              <p className="font-medium">{riskStatus.message}</p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-70">Today's P&L</p>
              <p className="font-bold text-lg">${riskStatus.daily_pnl}</p>
            </div>
          </div>
        )}

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/50 transition-all duration-300">
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">Total Trades</p>
                <h3 className="text-3xl font-bold text-white">{stats?.total_trades || 0}</h3>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                <FiList className="text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/50 transition-all duration-300">
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">Win Rate</p>
                <h3 className="text-3xl font-bold text-white">{stats?.win_rate || 0}%</h3>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                <FiTarget className="text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-yellow-500/50 transition-all duration-300">
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">Avg R:R</p>
                <h3 className="text-3xl font-bold text-white">1 : 2.8</h3>
              </div>
              <div className="p-3 bg-yellow-500/20 rounded-xl text-yellow-400">
                <FiDollarSign className="text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-6">Equity Curve</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.equity_curve || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                  <XAxis dataKey="name" stroke="#4B5563" tick={{fill: '#9CA3AF'}} axisLine={false} tickLine={false} />
                  <YAxis stroke="#4B5563" tick={{fill: '#9CA3AF'}} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '0.5rem', color: '#fff' }} />
                  <Area type="monotone" dataKey="balance" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-6">R-Multiple Distribution</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.r_distribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                  <XAxis dataKey="name" stroke="#4B5563" tick={{fill: '#9CA3AF'}} axisLine={false} tickLine={false} />
                  <YAxis stroke="#4B5563" tick={{fill: '#9CA3AF'}} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#1F2937'}} contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '0.5rem', color: '#fff' }} />
                  <Bar dataKey="trades" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}