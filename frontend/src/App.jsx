import React, { useState, useEffect } from 'react';
import {
  Activity, Upload, BarChart3, Shield, Menu, User,
  ChevronRight, Laptop, Database, BrainCircuit, Bell
} from 'lucide-react';
import axios from 'axios';
import Page1LiveScraping from './pages/Page1LiveScraping';
import Page2DatasetManagement from './pages/Page2DatasetManagement';
import Page3AIForensicEngine from './pages/Page3AIForensicEngine';

const API_BASE = 'http://localhost:5006/api';

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
    { id: 'scrape', label: 'Live Sentinel', icon: <Laptop className="h-5 w-5"/> },
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
        <main className="flex-1 overflow-auto relative">
         {/*<div className="max-w-7xl mx-auto animate-fade-in-up"> this one */}
         <div className="p-[9px]">
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
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [layersExpanded, setLayersExpanded] = useState(true);
  const [selectedSubParam, setSelectedSubParam] = useState(null);

  // Forensic parameter layers (static UI data)
  const forensicLayers = [
    {
      id: 'event_meta',
      title: 'EVENT METADATA',
      subtitle: 'Base layer — indexing & filtering',
      details: 'Exists in almost all logs. Useful for indexing and quick filters but not enough for investigation alone.',
      mainParameters: [
        { name: 'EventID', description: 'What happened (event type/ID)', example: '4624, 4625' },
        { name: 'Timestamp', description: 'When it occurred', example: '2026-02-04T10:12:34Z' },
        { name: 'Source', description: 'Originating component', example: 'Microsoft-Windows-Security-Auditing' },
        { name: 'Level/Severity', description: 'Severity label', example: 'Information / Warning / Error' },
        { name: 'ComputerName', description: 'Which system logged it', example: 'HOST-01' },
        { name: 'UserSID', description: 'User identifier', example: 'S-1-5-21-...' }
      ],
      subParameters: []
    },
    {
      id: 'process',
      title: 'PROCESS & EXECUTION FORENSICS',
      subtitle: 'Critical — mandatory in professional forensics',
      details: 'Essential for tracing execution, detecting injections, LOLBins, and building process trees.',
      mainParameters: [
        { name: 'ProcessID', description: 'Unique runtime ID', example: '1234' },
        { name: 'ParentProcessID', description: 'Process lineage', example: '567' },
        { name: 'ProcessName', description: 'Binary name', example: 'powershell.exe' },
        { name: 'ExecutablePath', description: 'Full disk path', example: 'C:\\Windows\\System32\\powershell.exe' },
        { name: 'CommandLine', description: 'Execution arguments', example: '-NoProfile -ExecutionPolicy Bypass' },
        { name: 'StartTime', description: 'Process start time', example: '2026-02-04T10:12:30Z' },
        { name: 'EndTime', description: 'Termination time', example: '2026-02-04T10:15:00Z' },
        { name: 'UserContext', description: 'Which user ran it', example: 'Administrator' }
      ],
      subParameters: [
        { name: 'SHA256 / MD5', why: 'Malware identification', example: '3a7bd3...' },
        { name: 'Signed / Unsigned', why: 'Trust check', example: 'Signed (Microsoft Corp)' },
        { name: 'SignerName', why: 'Fake cert detection', example: 'Microsoft Corporation' },
        { name: 'LoadedDLLs', why: 'DLL injection detection', example: 'kernel32.dll, user32.dll' },
        { name: 'ProcessEntropy', why: 'Packed / obfuscated binary', example: '0.98' },
        { name: 'CreationFlags', why: 'Suspicious spawn', example: 'CREATE_SUSPENDED' },
        { name: 'TokenPrivileges', why: 'Privilege abuse', example: 'SeDebugPrivilege' }
      ]
    },
    {
      id: 'file',
      title: 'FILE SYSTEM FORENSICS',
      subtitle: 'Evidence gold — who touched files and when',
      details: 'Critical for detecting drops, tampering, and payloads.',
      mainParameters: [
        { name: 'FilePath', description: 'Full path', example: 'C:\\temp\\evil.dll' },
        { name: 'FileName', description: 'Name', example: 'evil.dll' },
        { name: 'Extension', description: 'File type', example: '.dll' },
        { name: 'Operation', description: 'Create/Modify/Delete', example: 'Create' },
        { name: 'Timestamp', description: 'Action time', example: '2026-02-04T10:13:00Z' },
        { name: 'ProcessID', description: 'Who touched it', example: '1234' }
      ],
      subParameters: [
        { name: 'FileSize', why: 'Payload detection', example: '51200 bytes' },
        { name: 'CreatedTime', why: 'Implant drop timing', example: '2026-02-04T10:13:01Z' },
        { name: 'ModifiedTime', why: 'Tampering', example: '2026-02-04T10:20:00Z' },
        { name: 'FileEntropy', why: 'Packed malware', example: '0.95' },
        { name: 'AlternateDataStream', why: 'Stealth hiding', example: 'Zone.Identifier' },
        { name: 'IsHidden', why: 'Defense evasion', example: 'true' },
        { name: 'OwnerSID', why: 'Ownership abuse', example: 'S-1-5-21-...' }
      ]
    },
    {
      id: 'registry',
      title: 'REGISTRY & PERSISTENCE',
      subtitle: 'Startup & stealth artifacts',
      details: 'RunKeys, Services, ScheduledTasks, CLSID hijacks — focus for persistence analysis.',
      mainParameters: [
        { name: 'Hive', description: 'HKLM / HKCU', example: 'HKCU' },
        { name: 'KeyPath', description: 'Registry location', example: 'Software\\Microsoft\\Windows\\CurrentVersion\\Run' },
        { name: 'ValueName', description: 'Entry name', example: 'MyApp' },
        { name: 'ValueData', description: 'Entry value', example: 'C:\\temp\\evil.exe' },
        { name: 'Operation', description: 'Create/Modify/Delete', example: 'Create' },
        { name: 'Timestamp', description: 'When changed', example: '2026-02-04T10:14:00Z' }
      ],
      subParameters: [
        { name: 'RunKeys', why: 'Startup malware', example: 'HKCU\\...\\Run' },
        { name: 'Services', why: 'Rootkits / persistence', example: 'evilsvc' },
        { name: 'ScheduledTasks', why: 'Stealth execution', example: '\"TaskName\"' },
        { name: 'CLSID / COM hijack', why: 'COM hijacking', example: 'CLSID:{...}' },
        { name: 'IFEO / Debugger', why: 'Process injection via IFEO', example: 'Debugger: "odbcsvc.exe"' }
      ]
    },
    {
      id: 'network',
      title: 'NETWORK FORENSICS',
      subtitle: 'Attack attribution & exfil',
      details: 'Important for C2 detection, beaconing, and exfil timelines.',
      mainParameters: [
        { name: 'ProcessID', description: 'Which process initiated connection', example: '1234' },
        { name: 'LocalIP', description: 'Source IP', example: '10.0.0.5' },
        { name: 'LocalPort', description: 'Source port', example: '52134' },
        { name: 'RemoteIP', description: 'Destination IP', example: '8.8.8.8' },
        { name: 'RemotePort', description: 'Destination port', example: '443' },
        { name: 'Protocol', description: 'TCP/UDP', example: 'TCP' },
        { name: 'Timestamp', description: 'When', example: '2026-02-04T10:14:30Z' }
      ],
      subParameters: [
        { name: 'DNSQuery', why: 'C2 domains', example: 'bad.example[.]com' },
        { name: 'GeoLocation', why: 'Attribution', example: 'Country: RU' },
        { name: 'JA3 Fingerprint', why: 'TLS fingerprinting', example: 'd4f0...' },
        { name: 'BytesSent', why: 'Exfiltration size', example: '1048576' },
        { name: 'ConnectionDuration', why: 'Beaconing detection', example: '120s' },
        { name: 'ReputationScore', why: 'Threat intel', example: '0.92' }
      ]
    },
    {
      id: 'auth',
      title: 'AUTHENTICATION & IDENTITY',
      subtitle: 'Logons, failures & lateral movement',
      details: 'Useful for brute force detection, impossible travel, and session hijack analysis.',
      mainParameters: [
        { name: 'TargetUser', description: 'Account', example: 'DOMAIN\\Administrator' },
        { name: 'LogonType', description: 'Local / RDP / SMB', example: 'RDP' },
        { name: 'SourceIP', description: 'Origin IP', example: '10.0.0.12' },
        { name: 'Result', description: 'Success / Failure', example: 'Failure' },
        { name: 'Timestamp', description: 'When', example: '2026-02-04T10:15:00Z' }
      ],
      subParameters: [
        { name: 'LogonProcess', why: 'Credential abuse', example: 'NtLmSsp' },
        { name: 'AuthenticationPackage', why: 'NTLM/Kerberos', example: 'Kerberos' },
        { name: 'FailureReason', why: 'Brute force analysis', example: 'BadPassword' },
        { name: 'SessionDuration', why: 'Hijacking', example: '3600s' },
        { name: 'PrivilegeUsed', why: 'Lateral movement', example: 'SeTcbPrivilege' }
      ]
    },
    {
      id: 'memory',
      title: 'MEMORY FORENSICS',
      subtitle: 'Advanced — fileless & runtime artifacts',
      details: 'Used by professional labs to detect fileless and runtime-only threats.',
      mainParameters: [
        { name: 'InjectedCodeRegions', description: 'Regions with suspicious code', example: '0x7ff...' },
        { name: 'RWX Pages', description: 'Read/Write/Execute pages', example: '1 page' },
        { name: 'API Hooks', description: 'Hooked APIs', example: 'NtCreateThreadEx hook' },
        { name: 'Shellcode Patterns', description: 'Shellcode signatures', example: 'MZ header missing' }
      ],
      subParameters: [
        { name: 'Fileless Indicators', why: 'Evasion', example: 'RunPE, Reflective DLL' },
        { name: 'Exploit Signatures', why: 'Exploit detection', example: 'ROP gadget patterns' }
      ]
    },
    {
      id: 'system',
      title: 'SYSTEM & SECURITY STATE',
      subtitle: 'AV/Firewall/Driver events & tampering',
      details: 'Shows defense evasion, rootkit activity, and system integrity changes.',
      mainParameters: [
        { name: 'DefenderEvents', description: 'AV actions', example: 'Quarantine' },
        { name: 'FirewallRuleChanges', description: 'Firewall modifications', example: 'Allow C2' },
        { name: 'DriverLoads', description: 'Driver events', example: 'evil.sys loaded' },
        { name: 'ServiceInstalls', description: 'New services', example: 'evilsvc' },
        { name: 'AuditPolicyChanges', description: 'Tampering', example: 'Audit disabled' },
        { name: 'TimeChangeEvents', description: 'Anti-forensics', example: 'Clock moved backward' }
      ],
      subParameters: [
        { name: 'Rootkits', why: 'Kernel implants', example: 'Hidden processes' },
        { name: 'LogTampering', why: 'Anti-forensics', example: 'Event deletion' }
      ]
    }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API_BASE}/dashboard/stats`);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (ts) => {
    if (!ts) return 'Never';
    const date = new Date(ts);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const latestAnalysis = dashboardData?.latest_analysis || {};
  const lastScrape = dashboardData?.last_scrape || {};

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
          value={latestAnalysis.risk_score > 50 ? "AT RISK" : "SECURE"}
          sub={latestAnalysis.risk_score > 0 ? `Risk Score: ${latestAnalysis.risk_score}%` : "No active threats"}
          trend={latestAnalysis.risk_score > 50 ? "High" : "+12%"}
          trendUp={latestAnalysis.risk_score <= 50}
        />
        <MetricCard
          icon={<Database className="text-blue-400" />}
          label="Datasets Loaded"
          value={dashboardData?.datasets_count || 0}
          sub="Evidence files"
          trend={`${dashboardData?.chain_of_custody_count || 0} exports`}
          trendUp={true}
        />
        <MetricCard
          icon={<BrainCircuit className="text-purple-400" />}
          label="AI Confidence"
          value={latestAnalysis.status === "analysis_complete" ? "98.2%" : "Pending"}
          sub="Model accuracy"
          trend={latestAnalysis.timestamp ? "Analyzed" : "Waiting"}
        />
        <MetricCard
          icon={<Activity className="text-orange-400" />}
          label="Total Alerts"
          value={stats.total_alerts || 0}
          sub={`${stats.critical_threats || 0} critical`}
        />
      </div>

      {/* Alert Breakdown + Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert Breakdown */}
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-4">Alert Breakdown</h3>
          <div className="space-y-4">
            <AlertBar label="Brute Force" value={stats.alert_breakdown?.brute_force || 0} color="bg-red-500" />
            <AlertBar label="Malware" value={stats.alert_breakdown?.malware || 0} color="bg-orange-500" />
            <AlertBar label="Reconnaissance" value={stats.alert_breakdown?.reconnaissance || 0} color="bg-yellow-500" />
            <AlertBar label="Persistence" value={stats.alert_breakdown?.persistence || 0} color="bg-purple-500" />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <ActivityItem
              icon={<Laptop className="h-4 w-4 text-cyan-400" />}
              title="Last Scrape"
              subtitle={lastScrape.case_id ? `Case: ${lastScrape.case_id}` : "No scrapes yet"}
              time={formatTimestamp(lastScrape.timestamp)}
            />
            <ActivityItem
              icon={<BrainCircuit className="h-4 w-4 text-purple-400" />}
              title="Last Analysis"
              subtitle={latestAnalysis.status || "No analysis yet"}
              time={formatTimestamp(latestAnalysis.timestamp)}
            />
            <ActivityItem
              icon={<Database className="h-4 w-4 text-blue-400" />}
              title="Datasets"
              subtitle={`${dashboardData?.datasets_count || 0} files loaded`}
              time="Ready"
            />
            <ActivityItem
              icon={<Shield className="h-4 w-4 text-green-400" />}
              title="Chain of Custody"
              subtitle={`${dashboardData?.chain_of_custody_count || 0} export records`}
              time="Logged"
            />
          </div>
        </div>
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

      {/* Forensic Parameter Explorer */}
      <h3 className="text-lg font-semibold text-slate-300 mb-4 px-1 mt-8">Forensic Parameter Explorer 🔍</h3>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl lg:col-span-1">
          <p className="text-sm text-slate-400 mb-4">Click a layer to view main parameters and sub-parameters.</p>
          <div className="space-y-2">
            {forensicLayers.map(layer => (
              <button
                key={layer.id}
                onClick={() => { setSelectedLayer(layer); /* navigate to Analysis page and open specific view */ setCurrentPage('analysis'); localStorage.setItem('analysis_view', layer.id); }}
                className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center justify-between ${selectedLayer?.id === layer.id ? 'bg-cyan-500/10 border border-cyan-500 text-cyan-300' : 'bg-slate-800/30 hover:bg-white/5'}`}
              >
                <div>
                  <p className="text-sm font-semibold">{layer.title}</p>
                  <p className="text-xs text-slate-400">{layer.subtitle}</p>
                </div>
                <ChevronRight className="h-4 w-4 opacity-60" />
              </button>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl lg:col-span-2">
          {!selectedLayer ? (
            <div className="h-40 flex items-center justify-center text-slate-400">Select a forensic layer to view details and sub-parameters.</div>
          ) : (
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-xl font-bold text-white">{selectedLayer.title}</h4>
                  <p className="text-sm text-slate-400">{selectedLayer.subtitle}</p>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <button onClick={() => { setSelectedLayer(null); }} className="text-cyan-400 hover:underline">Close</button>
                </div>
              </div>

              <p className="text-sm text-slate-300 mb-4">{selectedLayer.details}</p>

              <h5 className="text-sm font-semibold text-slate-300 mb-2">Main Parameters</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {selectedLayer.mainParameters.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSubParam({ name: p.name, description: p.description, example: p.example, why: p.description, visual: p.visual || null })}
                    className="p-3 bg-slate-800/50 rounded-lg text-sm text-slate-200 text-left hover:bg-cyan-500/5 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-slate-400 mt-1">{p.description}</div>
                      </div>
                      <div className="text-xs text-slate-400 ml-4">{p.example}</div>
                    </div>
                  </button>
                ))}
              </div>

              <h5 className="text-sm font-semibold text-slate-300 mb-2">Sub-Parameters & Why they matter</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-400">
                {selectedLayer.subParameters.length === 0 ? (
                  <div className="p-3 bg-slate-800/40 rounded-lg">No sub-parameters for this layer.</div>
                ) : (
                  selectedLayer.subParameters.map((s, i) => (
                    <button key={i} onClick={() => setSelectedSubParam({ name: s.name, description: s.why, example: s.example, why: s.why, visual: s.visual || null })} className="p-3 bg-slate-800/40 rounded-lg text-left hover:bg-white/5 transition">
                      <div className="font-medium text-slate-200">{s.name}</div>
                      <div className="text-xs text-slate-400 mt-1">{s.why}</div>
                    </button>
                  ))
                )}
              </div>

              {/* Sub-parameter modal */}
              {selectedSubParam && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedSubParam(null)}></div>
                  <div className="bg-slate-900 rounded-2xl p-6 z-10 w-full max-w-2xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-bold text-white">{selectedSubParam.name}</h4>
                        <p className="text-sm text-slate-400">{selectedSubParam.description}</p>
                      </div>
                      <button onClick={() => setSelectedSubParam(null)} className="text-cyan-400">Close</button>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-xs text-slate-400">Why it matters</h5>
                        <p className="text-sm text-slate-300 mt-1">{selectedSubParam.why || '—'}</p>
                      </div>
                      <div>
                        <h5 className="text-xs text-slate-400">Example value</h5>
                        <pre className="mt-1 bg-slate-800 p-3 rounded text-xs text-slate-200">{selectedSubParam.example || 'N/A'}</pre>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-slate-400">{selectedSubParam.visual || ''}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AlertBar({ label, value, color }) {
  const maxValue = 20; // Scale for display
  const width = Math.min((value / maxValue) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-medium">{value}</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${width}%` }}></div>
      </div>
    </div>
  );
}

function ActivityItem({ icon, title, subtitle, time }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-slate-700 rounded-lg">{icon}</div>
        <div>
          <p className="text-sm font-medium text-white">{title}</p>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
      </div>
      <span className="text-xs text-slate-500">{time}</span>
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
