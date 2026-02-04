import React, { useState, useEffect } from 'react';
import { Play, AlertTriangle, Lock, CheckCircle, BarChart3, PieChart, TrendingUp, Shield, Activity } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5006/api';

export default function Page1LiveScraping() {
  const [scrapeConfig, setScrapeConfig] = useState({
    scope: 'full_system',
    include_processes: true,
    include_registry: true,
    include_network: true,
    include_event_logs: true
  });

  const [scrapingInProgress, setScrapingInProgress] = useState(false);
  const [scrapedData, setScrapedData] = useState(null);
  const [systemTelemetry, setSystemTelemetry] = useState(null);
  const [integrityChecks, setIntegrityChecks] = useState([]);
  const [backendStatus, setBackendStatus] = useState(null);
  const [privilegeStatus, setPrivilegeStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiDashboardOpen, setAiDashboardOpen] = useState(false);

  useEffect(() => {
    checkBackendStatus();
    checkPrivilegeStatus();
  }, []);

  const handleAIAnalytics = async () => {
    if (!scrapedData) return;
    // Open the full dashboard view immediately
    setAiDashboardOpen(true);
    setAiAnalysis(null);
    setAiAnalyzing(true);

    try {
      // Send process artifacts to backend AI analysis endpoint
      const payload = {
        processes: scrapedData.artifacts?.processes || {}
      };
      const response = await axios.post(`${API_BASE}/analysis/process-tree`, payload);
      setAiAnalysis(response.data);
    } catch (error) {
      console.error('AI analysis failed:', error);

      // If backend returns 405 Method Not Allowed, show explicit messages on all panels
      if (error.response?.status === 405) {
        const methodNotAllowed = {
          event_metadata: { summary: 'Method Not Allowed' },
          process_forensics: { summary: 'Method Not Allowed' },
          file_system_forensics: { summary: 'Method Not Allowed' },
          registry_forensics: { summary: 'Method Not Allowed' },
          network_forensics: { summary: 'Method Not Allowed' },
          authentication_forensics: { summary: 'Method Not Allowed' },
          memory_forensics: { summary: 'Method Not Allowed' },
          system_security_forensics: { summary: 'Method Not Allowed' },
        };
        setAiAnalysis(methodNotAllowed);
      } else {
        setAiAnalysis({ error: true, message: error.response?.data?.detail || error.message || 'AI analysis failed' });
      }
    } finally {
      setAiAnalyzing(false);
    }
  };

  const checkBackendStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE.replace('/api', '')}/health`);
      setBackendStatus(response.data);
    } catch (error) {
      console.error('Backend status check failed:', error);
    }
  };

  const checkPrivilegeStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/scrape/privilege-status`);
      if (!response.data.has_admin) {
        setPrivilegeStatus(response.data);
      }
    } catch (error) {
      console.error('Privilege check failed:', error);
      // If API call fails, assume admin is available (backend is running)
    }
  };

  const handleRestartAdmin = async () => {
    if (confirm("This will restart the backend server and request Admin privileges via UAC. Continue?")) {
      // Fire and forget - the server will die before responding sometimes
      axios.post(`${API_BASE}/system/restart-admin`).catch(e => console.log('Server restarting...'));

      setErrorMessage({
        title: "Restarting...",
        message: "Server is rebooting with Admin privileges. Please wait 10-15 seconds...",
        instructions: "If the page doesn't recover, please run 'launcher.bat' manually."
      });

      // Poll for health
      let checks = 0;
      const interval = setInterval(async () => {
        try {
          await axios.get(`${API_BASE.replace('/api', '')}/health`);
          clearInterval(interval);
          window.location.reload();
        } catch (e) {
          checks++;
          if (checks > 20) clearInterval(interval);
        }
      }, 1000);
    }
  };

  const handleStartScrape = async () => {
    setErrorMessage(null);
    setScrapingInProgress(true);
    try {
      const response = await axios.post(`${API_BASE}/scrape/start`, scrapeConfig);
      setScrapedData(response.data);

      // Calculate integrity hash
      const hashResponse = await axios.post(`${API_BASE}/scrape/integrity-check`, response.data);
      setIntegrityChecks(prev => [...prev, hashResponse.data]);

      // Fetch telemetry
      const telemetryResponse = await axios.get(`${API_BASE}/scrape/system-telemetry`);
      setSystemTelemetry(telemetryResponse.data);
    } catch (error) {
      console.error('Scrape failed:', error);
      const errorData = error.response?.data?.detail;
      if (typeof errorData === 'object' && errorData.error) {
        setErrorMessage({
          title: errorData.error,
          message: errorData.message,
          instructions: errorData.instructions
        });
      } else {
        setErrorMessage({
          title: 'Scraping Failed',
          message: error.response?.data?.detail || error.message || 'Unknown error occurred',
          instructions: 'Check the backend console for more details.'
        });
      }
    } finally {
      setScrapingInProgress(false);
    }
  };

  return (
    <div className="space-y-8 relative">

      {aiDashboardOpen && (
        <div className="absolute inset-0 z-50 bg-slate-950/95 p-6 overflow-auto rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">AI Analysis Dashboard</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAiDashboardOpen(false)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-sm"
              >
                Close
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="flex space-x-4 pb-2">
              {[
                { id: 1, key: 'event_metadata', title: 'EVENT METADATA' },
                { id: 2, key: 'process_forensics', title: 'PROCESS & EXECUTION FORENSICS' },
                { id: 3, key: 'file_system_forensics', title: 'FILE SYSTEM FORENSICS (EVIDENCE GOLD)' },
                { id: 4, key: 'registry_forensics', title: 'REGISTRY & PERSISTENCE FORENSICS' },
                { id: 5, key: 'network_forensics', title: 'NETWORK FORENSICS (ATTACK ATTRIBUTION)' },
                { id: 6, key: 'authentication_forensics', title: 'AUTHENTICATION & IDENTITY FORENSICS' },
                { id: 7, key: 'memory_forensics', title: 'MEMORY FORENSICS' },
                { id: 8, key: 'system_security_forensics', title: 'SYSTEM & SECURITY STATE FORENSICS' },
              ].map((card) => (
                <div key={card.key} className="min-w-[320px] bg-slate-900/70 rounded-lg p-4 border border-white/5">
                  <h5 className="text-sm font-semibold text-cyan-300 mb-2">{`${card.id}️⃣ ${card.title}`}</h5>
                  <div className="text-xs text-slate-300">
                    <p className="text-xs font-semibold text-slate-400">Summary</p>
                    <p className="mt-2 text-sm text-rose-400">{(aiAnalysis && aiAnalysis[card.key] && (aiAnalysis[card.key].summary || aiAnalysis[card.key])) || 'Method Not Allowed'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Admin Privilege Alert */}
      {privilegeStatus && !privilegeStatus.has_admin && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <Shield className="h-6 w-6 text-red-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-100 mb-2">Admin Privileges Required</h3>
              <p className="text-red-200 mb-4">{privilegeStatus.message}</p>
              <div className="bg-red-800 rounded p-4 text-sm text-red-50 font-mono whitespace-pre-wrap">
                {privilegeStatus.instructions}
              </div>
              <button
                onClick={() => setPrivilegeStatus(null)}
                className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-600 rounded font-medium text-sm"
              >
                Dismiss
              </button>
              <button
                onClick={handleRestartAdmin}
                className="mt-4 ml-3 px-4 py-2 bg-red-900 border border-red-500 hover:bg-red-800 rounded font-medium text-sm flex-inline items-center"
              >
                <Shield className="w-4 h-4 inline mr-2" />
                Restart as Administrator
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message Alert */}
      {
        errorMessage && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="h-6 w-6 text-red-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-100 mb-2">{errorMessage.title}</h3>
                <p className="text-red-200 mb-3">{errorMessage.message}</p>
                {errorMessage.instructions && (
                  <div className="bg-red-800 rounded p-3 text-sm text-red-50 font-mono whitespace-pre-wrap mb-3">
                    {errorMessage.instructions}
                  </div>
                )}
                <button
                  onClick={() => setErrorMessage(null)}
                  className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded font-medium text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Target Scope */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Target Scope Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Artifact Scope</label>
            <select
              value={scrapeConfig.scope}
              onChange={(e) => setScrapeConfig({ ...scrapeConfig, scope: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="full_system">Full System</option>
              <option value="volatile_only">Volatile Only (RAM)</option>
              <option value="custom">Custom Registry Keys</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Collectors */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Active Collectors</h2>
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={scrapeConfig.include_processes}
              onChange={(e) => setScrapeConfig({ ...scrapeConfig, include_processes: e.target.checked })}
              className="w-4 h-4"
            />
            <span>Process Monitor (Parent/Child Trees)</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={scrapeConfig.include_registry}
              onChange={(e) => setScrapeConfig({ ...scrapeConfig, include_registry: e.target.checked })}
              className="w-4 h-4"
            />
            <span>Registry Watcher (Persistence Keys)</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={scrapeConfig.include_network}
              onChange={(e) => setScrapeConfig({ ...scrapeConfig, include_network: e.target.checked })}
              className="w-4 h-4"
            />
            <span>Network Sniffer (Active Connections)</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={scrapeConfig.include_event_logs}
              onChange={(e) => setScrapeConfig({ ...scrapeConfig, include_event_logs: e.target.checked })}
              className="w-4 h-4"
            />
            <span>Event Log Collector (Security Logs)</span>
          </label>
        </div>
      </div>

      {/* System Telemetry */}
      {
        systemTelemetry && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">System Telemetry</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">CPU Usage</p>
                <p className="text-2xl font-bold text-cyan-400">{systemTelemetry.cpu_percent.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Memory Usage</p>
                <p className="text-2xl font-bold text-cyan-400">{systemTelemetry.memory_percent.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        )
      }

      {/* Visualizations - Only show if data exists */}
      {/* 🌳 REAL PROCESS TREE */}
      {scrapedData && scrapedData.artifacts?.processes?.root_processes && (
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center text-cyan-400">
              <Activity className="h-5 w-5 mr-2" />
              Live Process Tree (Real-Time)
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleAIAnalytics}
                disabled={aiAnalyzing}
                className={`px-3 py-1 text-sm rounded-md font-medium flex items-center ${aiAnalyzing ? 'bg-gray-600 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500'}`}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                <span>{aiAnalyzing ? 'Analyzing...' : 'AI analytics'}</span>
              </button>
            </div>
          </div>

          <div className="font-mono text-xs space-y-1 text-slate-300 overflow-auto max-h-[500px] pr-2 custom-scrollbar">
            {scrapedData.artifacts.processes.root_processes.length > 0 ? (
              <RecursiveProcessTree nodes={scrapedData.artifacts.processes.root_processes} />
            ) : (
              <p className="text-slate-500 italic">No process data captured. Check permissions.</p>
            )}
          </div>

          {aiAnalysis && (
            <div className="mt-4 bg-slate-800/60 p-4 rounded border border-white/5">
              <h4 className="text-sm font-semibold text-white mb-4">AI Analysis Dashboard</h4>

              <div className="overflow-x-auto">
                <div className="flex space-x-4 pb-2">
                  {[
                    { id: 1, key: 'event_metadata', title: 'EVENT METADATA' },
                    { id: 2, key: 'process_forensics', title: 'PROCESS & EXECUTION FORENSICS' },
                    { id: 3, key: 'file_system_forensics', title: 'FILE SYSTEM FORENSICS (EVIDENCE GOLD)' },
                    { id: 4, key: 'registry_forensics', title: 'REGISTRY & PERSISTENCE FORENSICS' },
                    { id: 5, key: 'network_forensics', title: 'NETWORK FORENSICS (ATTACK ATTRIBUTION)' },
                    { id: 6, key: 'authentication_forensics', title: 'AUTHENTICATION & IDENTITY FORENSICS' },
                    { id: 7, key: 'memory_forensics', title: 'MEMORY FORENSICS' },
                    { id: 8, key: 'system_security_forensics', title: 'SYSTEM & SECURITY STATE FORENSICS' },
                  ].map((card) => (
                    <div key={card.key} className="min-w-[320px] bg-slate-900/50 rounded-lg p-4 border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-xs font-semibold text-cyan-300">{`${card.id}️⃣ ${card.title}`}</h5>
                        <span className="text-xs text-slate-400">Summary</span>
                      </div>
                      <div className="text-xs text-slate-300 h-36 overflow-auto">
                        {aiAnalysis.error ? (
                          <p className="text-rose-400">{aiAnalysis.message}</p>
                        ) : aiAnalysis[card.key] ? (
                          typeof aiAnalysis[card.key] === 'string' ? (
                            <p>{aiAnalysis[card.key]}</p>
                          ) : aiAnalysis[card.key].summary ? (
                            <p>{aiAnalysis[card.key].summary}</p>
                          ) : (
                            <pre className="whitespace-pre-wrap">{JSON.stringify(aiAnalysis[card.key], null, 2)}</pre>
                          )
                        ) : (
                          <p className="text-slate-500 italic">No data available</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 📜 REAL EVENT LOGS */}
      {scrapedData && scrapedData.artifacts?.event_logs?.critical_events && (
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-yellow-400">
            <Shield className="h-5 w-5 mr-2" />
            Security Event Timeline
          </h3>
          <div className="space-y-2 max-h-[400px] overflow-auto custom-scrollbar">
            {scrapedData.artifacts.event_logs.critical_events.length > 0 ? (
              scrapedData.artifacts.event_logs.critical_events.map((evt, idx) => (
                <div key={idx} className="bg-slate-800/50 p-3 rounded border-l-2 border-yellow-500 hover:bg-slate-800 transition">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-200">Event ID {evt.event_id}</span>
                    <span className="text-xs text-slate-500">{evt.timestamp}</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{evt.message}</p>
                  <p className="text-xs text-slate-600 mt-1">Source: {evt.source}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-500 italic">No critical security events found in the last 24h.</p>
            )}
          </div>
        </div>
      )}

      <button
        onClick={handleStartScrape}
        disabled={scrapingInProgress}
        className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition ${scrapingInProgress
          ? 'bg-gray-600 cursor-not-allowed'
          : 'bg-cyan-600 hover:bg-cyan-700'
          }`}
      >
        <Play className="h-5 w-5" />
        <span>{scrapingInProgress ? 'Scraping in Progress...' : 'Start Live Scraping'}</span>
      </button>

      <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-yellow-200">Information</p>
          <p className="text-sm text-yellow-300 mt-1">
            Running with admin privileges provides access to Event Logs, Registry, and Network APIs. You can use Live Scraping without admin to collect process information.
          </p>
        </div>
      </div>
    </div >
  );
}

function RecursiveProcessTree({ nodes, level = 0 }) {
  if (!nodes) return null;
  return (
    <div className="space-y-1">
      {nodes.map((node) => (
        <div key={node.pid}>
          <div
            className="flex items-center hover:bg-white/5 rounded px-1 py-0.5"
            style={{ paddingLeft: `${level * 16}px` }}
          >
            <span className="text-slate-500 mr-2 opacity-50">└─</span>
            <span className={`mr-2 ${node.forensic_flags?.includes('MALWARE_SIGNATURE') ? 'text-red-400 font-bold' : 'text-cyan-300'}`}>
              {node.name}
            </span>
            <span className="text-slate-600 text-[10px] mr-2">({node.pid})</span>
            {node.forensic_flags && node.forensic_flags.length > 0 && (
              <span className="text-[10px] bg-red-900/50 text-red-200 px-1 rounded border border-red-800">
                {node.forensic_flags[0]}
              </span>
            )}
          </div>
          {node.children && <RecursiveProcessTree nodes={node.children} level={level + 1} />}
        </div>
      ))}
    </div>
  );
}
