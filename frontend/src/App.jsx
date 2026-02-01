import React, { useState, useEffect } from 'react';
import {
  Activity, Upload, BarChart3, Shield, Menu, User,
  ChevronRight, Laptop, Database, BrainCircuit, Bell
} from 'lucide-react';
import axios from 'axios';
import Page1LiveScraping from './pages/Page1LiveScraping';
import Page2DatasetManagement from './pages/Page2DatasetManagement';
import Page3AIForensicEngine from './pages/Page3AIForensicEngine';

const API_BASE = 'http://localhost:8001/api';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    checkSystemHealth();
  }, []);

  const checkSystemHealth = async () => {
    try {
      const response = await axios.get(`${API_BASE.replace('/api', '')}/health`);
      setSystemHealth(response.data);
      setLoading(false);
    } catch (error) {
      console.error('System unavailable:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-cyan-400 font-medium tracking-wide">INITIALIZING ORBITAL FORENSICS...</p>
        </div>
      </div>
    );
  }

  // Define nav items
  const navItems = [
    { id: 'home', label: 'Overview', icon: <Activity className="h-5 w-5" /> },
    { id: 'scrape', label: 'Live Sentinel', icon: <Laptop className="h-5 w-5" /> },
    { id: 'dataset', label: 'Evidence Locker', icon: <Database className="h-5 w-5" /> },
    { id: 'analysis', label: 'Neural Engine', icon: <BrainCircuit className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex overflow-hidden">

      {/* 🚀 SIDEBAR NAVIGATION */}
      <aside
        className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 flex flex-col transition-all duration-300 z-50`}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-white/5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Shield className="h-6 w-6 text-white" />
            </div>
            {isSidebarOpen && (
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">WinSentinel</h1>
                <p className="text-xs text-cyan-400 font-medium tracking-wider">FORENSIC SUITE</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-8 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group relative
                ${currentPage === item.id
                  ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 shadow-inner'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
              {currentPage === item.id && (
                <div className="absolute left-0 w-1 h-8 bg-cyan-400 rounded-r-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
              )}
              {item.icon}
              {isSidebarOpen && (
                <span className="ml-3 font-medium tracking-wide">{item.label}</span>
              )}
              {!isSidebarOpen && (
                <div className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50 pointer-events-none">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* System Status Footer */}
        <div className="p-4 border-t border-white/5">
          {isSidebarOpen ? (
            <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-slate-400">SYSTEM STATUS</span>
                <span className="flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
              </div>
              <div className="text-xs text-slate-500 flex justify-between">
                <span>Backend API</span>
                <span className="text-green-400">Online 8001</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <span className="flex h-3 w-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            </div>
          )}
        </div>
      </aside>

      {/* 🖥️ MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col relative overflow-hidden">

        {/* Background Ambient Glows */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px]"></div>
        </div>

        {/* Top Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition mr-4"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold text-white tracking-wide">
              {navItems.find(n => n.id === currentPage)?.label}
            </h2>
          </div>

          <div className="flex items-center space-x-6">
            <button className="relative p-2 text-slate-400 hover:text-white transition">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-slate-900"></span>
            </button>
            <div className="flex items-center space-x-3 pl-6 border-l border-white/10">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-white">Administrator</p>
                <p className="text-xs text-slate-400">Security Clearance: Lvl 5</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center">
                <User className="h-5 w-5 text-slate-300" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8 relative">
          <div className="max-w-7xl mx-auto animate-fade-in-up">
            {currentPage === 'home' && <Dashboard setCurrentPage={setCurrentPage} />}
            {currentPage === 'scrape' && <div className="glass-card rounded-2xl p-1"><Page1LiveScraping /></div>}
            {currentPage === 'dataset' && <div className="glass-card rounded-2xl p-1"><Page2DatasetManagement /></div>}
            {currentPage === 'analysis' && <div className="glass-card rounded-2xl p-1"><Page3AIForensicEngine /></div>}
          </div>
        </main>
      </div>
    </div>
  );
}

function Dashboard({ setCurrentPage }) {
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-card p-8 md:p-12 mb-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-bl-full pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Welcome back, <span className="gradient-text">Administrator</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mb-8">
            WinSentinel is ready. Your system security posture is currently stable.
            Initiate a scan to detect new anomalies in real-time.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setCurrentPage('scrape')}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl transition shadow-lg shadow-cyan-500/20 flex items-center"
            >
              <Activity className="h-5 w-5 mr-2" />
              Start Live Scan
            </button>
            <button
              onClick={() => setCurrentPage('analysis')}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl border border-white/10 transition flex items-center"
            >
              <BrainCircuit className="h-5 w-5 mr-2" />
              View Intelligence
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <h3 className="text-lg font-semibold text-slate-300 mb-4 px-1">System Telemetry</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={<Shield className="text-emerald-400" />}
          label="Security Status"
          value="SECURE"
          sub="No active threats"
          trend="+12%"
          trendUp={true}
        />
        <MetricCard
          icon={<Database className="text-blue-400" />}
          label="Artifacts Indexed"
          value="24.8K"
          sub="Total records"
          trend="+5%"
          trendUp={true}
        />
        <MetricCard
          icon={<BrainCircuit className="text-purple-400" />}
          label="AI Confidence"
          value="98.2%"
          sub="Model accuracy"
          trend="Stable"
        />
        <MetricCard
          icon={<Activity className="text-orange-400" />}
          label="Active Probes"
          value="4"
          sub="Running daemons"
        />
      </div>

      {/* Quick Actions */}
      <h3 className="text-lg font-semibold text-slate-300 mb-4 px-1 mt-8">Module Shortcuts</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ActionCard
          title="Live Sentinel"
          desc="Real-time process, registry, and network monitoring with anomaly detection."
          icon={<Laptop className="h-6 w-6 text-cyan-400" />}
          delay="0"
          onClick={() => setCurrentPage('scrape')}
        />
        <ActionCard
          title="Evidence Locker"
          desc="Upload forensic datasets (.evtx, .csv) for offline processing."
          icon={<Database className="h-6 w-6 text-blue-400" />}
          delay="100"
          onClick={() => setCurrentPage('dataset')}
        />
        <ActionCard
          title="Neural Engine"
          desc="LLM-powered threat analysis and automated reporting."
          icon={<BrainCircuit className="h-6 w-6 text-purple-400" />}
          delay="200"
          onClick={() => setCurrentPage('analysis')}
        />
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, sub, trend, trendUp }) {
  return (
    <div className="glass-panel p-6 rounded-2xl hover:bg-slate-800/50 transition">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-800 rounded-lg border border-white/5">
          {React.cloneElement(icon, { className: `h-6 w-6 ${icon.props.className}` })}
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <h4 className="text-2xl font-bold text-white mb-1">{value}</h4>
        <p className="text-sm text-slate-400">{label}</p>
        <p className="text-xs text-slate-600 mt-1">{sub}</p>
      </div>
    </div>
  );
}

function ActionCard({ title, desc, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left group glass-panel p-6 rounded-2xl hover:border-cyan-500/30 hover:bg-slate-800/80 transition-all duration-300 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
      <div className="mb-4 p-3 bg-slate-900 rounded-xl w-fit group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h4 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{title}</h4>
      <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
    </button>
  );
}
