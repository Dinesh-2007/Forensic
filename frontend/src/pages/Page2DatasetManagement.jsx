import React, { useState } from 'react';
import { Upload, FileText, Trash2, Download, BarChart3, Zap } from 'lucide-react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const API_BASE = 'http://localhost:5006/api';

export default function Page2DatasetManagement() {
  const [datasets, setDatasets] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [csvColumns, setCsvColumns] = useState([]);
  const [csvData, setCsvData] = useState([]); // Full data
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [chartData, setChartData] = useState(null);
  const [selectedChartCol, setSelectedChartCol] = useState(0);
  const [analyzeInProgress, setAnalyzeInProgress] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [normalizeConfig, setNormalizeConfig] = useState({
    dataset_name: '',
    dataset_type: 'csv',
    timestamp_column: '',
    source_ip_column: ''
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dataset_name', file.name);

    try {
      const response = await axios.post(`${API_BASE}/dataset/upload`, formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });

      // Store uploaded file info
      setUploadedFile({
        name: response.data.filename,
        size: response.data.size_bytes,
        hash: response.data.hash,
        timestamp: response.data.timestamp
      });

      // Parse CSV to get columns
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n');
        if (lines.length > 0) {
          const headers = lines[0].split(',').map(h => h.trim());
          setCsvColumns(headers);

          // Store up to 1000 rows for view/analysis
          const parsedRows = lines.slice(1, 1001).map(line => line.split(',').map(v => v.trim()));
          setCsvData(parsedRows);

          // Default chart: Last column usually contains labels/results
          if (headers.length > 0) {
            generateChartData(parsedRows, headers.length - 1, headers);
            setSelectedChartCol(headers.length - 1);
          }
        }
      };
      fileReader.readAsText(file);

      setDatasets(prev => [...prev, response.data]);
      setUploadProgress(0);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleNormalize = async () => {
    try {
      const response = await axios.post(`${API_BASE}/dataset/normalize`, normalizeConfig);
      alert(`Dataset normalized! Rows: ${response.data.row_count}`);
    } catch (error) {
      console.error('Normalization failed:', error);
      alert('Normalization failed');
    }
  };

  const handleDeduplicate = async () => {
    try {
      const response = await axios.post(`${API_BASE}/dataset/deduplicate`, {
        dataset_name: normalizeConfig.dataset_name
      });
      alert(`Deduplication complete: ${response.data.duplicates_removed} duplicates removed`);
    } catch (error) {
      console.error('Deduplication failed:', error);
    }
  };

  const handleAIAnalysis = async () => {
    if (!uploadedFile) {
      alert('Please upload a CSV file first');
      return;
    }

    setAnalyzeInProgress(true);
    try {
      const response = await axios.post(`${API_BASE}/analysis/run`, {
        dataset_name: uploadedFile.name,
        algorithm: 'isolation_forest'
      });

      setAnalysisResults(response.data);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('AI Analysis failed');
    } finally {
      setAnalyzeInProgress(false);
    }
  };

  const generateChartData = (data, colIndex, headers = csvColumns) => {
    if (!data || data.length === 0) return;

    const counts = {};
    data.forEach(row => {
      const val = row[colIndex] || 'Unknown';
      counts[val] = (counts[val] || 0) + 1;
    });

    // Sort by count and take top 10
    const sortedCounts = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    setChartData({
      labels: sortedCounts.map(([k]) => k),
      datasets: [
        {
          data: sortedCounts.map(([, v]) => v),
          backgroundColor: [
            '#06b6d4', '#8b5cf6', '#eab308', '#ef4444',
            '#22c55e', '#f97316', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e'
          ],
          borderColor: '#1f2937',
          borderWidth: 1,
        },
      ],
    });
  };

  const handleSort = (colIndex) => {
    let direction = 'ascending';
    if (sortConfig.key === colIndex && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key: colIndex, direction });

    const sorted = [...csvData].sort((a, b) => {
      if (a[colIndex] < b[colIndex]) return direction === 'ascending' ? -1 : 1;
      if (a[colIndex] > b[colIndex]) return direction === 'ascending' ? 1 : -1;
      return 0;
    });
    setCsvData(sorted);
  };

  return (
    <div className="space-y-8">
      {/* Upload Portal */}
      <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Upload className="h-5 w-5 mr-2" />
          Upload Dataset
        </h2>

        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-cyan-500 transition cursor-pointer">
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="file-upload"
            accept=".csv,.json,.evtx,.xlsx"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-300">Drag and drop your dataset here</p>
            <p className="text-gray-500 text-sm">or click to browse</p>
            <p className="text-gray-600 text-xs mt-2">Supported: CSV, JSON, EVTX, XLSX</p>
          </label>
        </div>

        {uploadProgress > 0 && (
          <div className="mt-4">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-cyan-500 h-2 rounded-full transition"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-2">{uploadProgress}%</p>
          </div>
        )}
      </div>

      {/* CSV Column Preview - After Upload */}
      {uploadedFile && csvColumns.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-cyan-400" />
            Uploaded File: {uploadedFile.name}
          </h2>

          {/* File Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-700 p-4 rounded">
              <p className="text-xs text-gray-400">File Size</p>
              <p className="text-lg font-semibold text-cyan-400">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <p className="text-xs text-gray-400">Uploaded</p>
              <p className="text-lg font-semibold text-green-400">{uploadedFile.timestamp}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <p className="text-xs text-gray-400">Columns Detected</p>
              <p className="text-lg font-semibold text-yellow-400">{csvColumns.length}</p>
            </div>
          </div>

          {/* Column List */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-300 mb-3">CSV Parameters (Columns):</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {csvColumns.map((col, idx) => (
                <div key={idx} className="bg-gray-700 p-3 rounded text-sm">
                  <span className="text-cyan-400">#{idx + 1}</span>
                  <p className="text-gray-200 font-mono text-xs mt-1">{col}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Data Visualization & Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Pie Chart Section */}
            <div className="lg:col-span-1 bg-gray-900 p-4 rounded-lg flex flex-col items-center justify-center">
              <h3 className="text-gray-300 font-semibold mb-3 w-full text-center">Data Distribution</h3>

              <div className="w-full mb-4">
                <label className="text-xs text-gray-400 mb-1 block">Visualizing Column:</label>
                <select
                  value={selectedChartCol}
                  onChange={(e) => {
                    const idx = parseInt(e.target.value);
                    setSelectedChartCol(idx);
                    generateChartData(csvData, idx);
                  }}
                  className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm"
                >
                  {csvColumns.map((col, idx) => (
                    <option key={idx} value={idx}>{col}</option>
                  ))}
                </select>
              </div>

              {chartData && (
                <div className="w-48 h-48">
                  <Pie data={chartData} options={{ maintainAspectRatio: false }} />
                </div>
              )}
            </div>

            {/* Detailed Table Section */}
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-300">Detailed Data View ({csvData.length} rows)</h3>
                <span className="text-xs text-gray-500 italic">Click headers to sort</span>
              </div>

              <div className="overflow-x-auto overflow-y-auto max-h-80 bg-gray-900 rounded p-4 border border-gray-700">
                <table className="w-full text-xs text-gray-300">
                  <thead className="sticky top-0 bg-gray-800 z-10 shadow-lg">
                    <tr>
                      {csvColumns.map((col, idx) => (
                        <th
                          key={idx}
                          onClick={() => handleSort(idx)}
                          className={`px-3 py-3 text-left font-semibold cursor-pointer hover:text-white transition ${sortConfig.key === idx ? 'text-cyan-400' : 'text-gray-400'
                            }`}
                        >
                          <div className="flex items-center space-x-1">
                            <span>{col}</span>
                            {sortConfig.key === idx && (
                              <span>{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.map((row, rowIdx) => (
                      <tr key={rowIdx} className="border-b border-gray-800 hover:bg-gray-700/50 transition">
                        {row.map((cell, cellIdx) => (
                          <td key={cellIdx} className="px-3 py-2 truncate max-w-[150px] font-mono text-gray-400">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* AI Analysis Button */}
          <button
            onClick={handleAIAnalysis}
            disabled={analyzeInProgress}
            className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition ${analyzeInProgress
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700'
              }`}
          >
            <Zap className="h-5 w-5" />
            <span>{analyzeInProgress ? 'Running AI Analysis...' : 'Run AI Analysis'}</span>
          </button>
        </div>
      )}

      {/* AI Analysis Results */}
      {analysisResults && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-red-900 to-red-700 rounded-lg p-6">
              <p className="text-red-200 text-sm">Threats Identified</p>
              <p className="text-4xl font-bold text-red-100 mt-2">
                {analysisResults.threat_indicators?.total_threats_identified || 0}
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-900 to-orange-700 rounded-lg p-6">
              <p className="text-orange-200 text-sm">Risk Score</p>
              <p className="text-4xl font-bold text-orange-100 mt-2">{analysisResults.risk_score || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-900 to-yellow-700 rounded-lg p-6">
              <p className="text-yellow-200 text-sm">Total Records</p>
              <p className="text-4xl font-bold text-yellow-100 mt-2">
                {analysisResults.metadata?.total_records || 0}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-900 to-green-700 rounded-lg p-6">
              <p className="text-green-200 text-sm">Date Range</p>
              <p className="text-lg font-bold text-green-100 mt-2">
                {analysisResults.metadata?.date_range_days || '?'} days
              </p>
            </div>
          </div>

          {/* Severity Distribution */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-purple-400" />
              Event Severity Distribution
            </h3>
            <div className="space-y-3">
              {analysisResults.severity_distribution ? (
                Object.entries(analysisResults.severity_distribution).filter(([k]) => k !== 'error_percentage').map(([level, count]) => {
                  const colors = {
                    'Critical': 'bg-red-600',
                    'Error': 'bg-orange-600',
                    'Warning': 'bg-yellow-600',
                    'Information': 'bg-blue-600'
                  };
                  const total = analysisResults.metadata?.total_records || 1;
                  return (
                    <div key={level}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-semibold">{level}</span>
                        <span className="text-sm">{count} ({((count / total) * 100).toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded h-3">
                        <div
                          className={`${colors[level] || 'bg-gray-500'} h-3 rounded`}
                          style={{ width: `${(count / total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : null}
            </div>
          </div>

          {/* Threat Indicators */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Detected Threats (MITRE ATT&CK)</h3>
            <div className="space-y-3">
              {analysisResults.threat_indicators?.threats && analysisResults.threat_indicators.threats.length > 0 ? (
                analysisResults.threat_indicators.threats.map((threat, idx) => (
                  <div key={idx} className="bg-gray-700 p-4 rounded-lg border-l-4 border-red-500">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-gray-100">{threat.threat_type}</p>
                      <span className="text-xs bg-red-600 px-3 py-1 rounded font-mono">{threat.mitre_technique}</span>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{threat.description}</p>
                    <p className="text-xs text-gray-400">Events: {threat.event_count}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No major threats detected</p>
              )}
            </div>
          </div>

          {/* Anomalies Detected */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Detected Anomalies</h3>
            <div className="space-y-3">
              {analysisResults.sample_anomalies && analysisResults.sample_anomalies.length > 0 ? (
                analysisResults.sample_anomalies.map((anomaly, idx) => (
                  <div key={idx} className="bg-gray-700 p-3 rounded text-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-yellow-300">{anomaly.anomaly_type}</p>
                        <p className="text-gray-300 text-xs mt-1">{anomaly.details}</p>
                      </div>
                      <span className="bg-yellow-600 text-white px-2 py-1 rounded text-xs ml-2">
                        {anomaly.count} events
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No major anomalies detected</p>
              )}
            </div>
          </div>

          {/* Risk Assessment & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Risk Assessment</h3>
              <div className={`p-4 rounded-lg ${analysisResults.overall_risk === 'HIGH' ? 'bg-red-900' :
                analysisResults.overall_risk === 'MEDIUM' ? 'bg-yellow-900' :
                  'bg-green-900'
                }`}>
                <p className="text-sm text-gray-300 mb-2">Overall Risk Level</p>
                <p className={`text-4xl font-bold ${analysisResults.overall_risk === 'HIGH' ? 'text-red-400' :
                  analysisResults.overall_risk === 'MEDIUM' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                  {analysisResults.overall_risk || 'UNKNOWN'}
                </p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
              <div className="space-y-2">
                {analysisResults.recommendations && analysisResults.recommendations.length > 0 ? (
                  analysisResults.recommendations.slice(0, 3).map((rec, idx) => (
                    <div key={idx} className="text-sm p-2 bg-gray-700 rounded">
                      <div className="flex items-start">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold mr-2 ${rec.priority === 'HIGH' ? 'bg-red-600' :
                          rec.priority === 'MEDIUM' ? 'bg-yellow-600' :
                            'bg-blue-600'
                          }`}>{rec.priority}</span>
                        <span className="text-gray-300">{rec.action}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No critical recommendations</p>
                )}
              </div>
            </div>
          </div>

          {/* Metadata Summary */}
          {analysisResults.metadata && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Event Log Metadata</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Unique Sources</p>
                  <p className="text-xl font-semibold text-cyan-400 mt-1">
                    {analysisResults.metadata.unique_sources || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Unique Users</p>
                  <p className="text-xl font-semibold text-cyan-400 mt-1">
                    {analysisResults.metadata.unique_users || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Unique Computers</p>
                  <p className="text-xl font-semibold text-cyan-400 mt-1">
                    {analysisResults.metadata.unique_computers || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Analysis Type</p>
                  <p className="text-xl font-semibold text-purple-400 mt-1">
                    Windows Forensics
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Dataset Normalizer</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Dataset Name</label>
              <input
                type="text"
                value={normalizeConfig.dataset_name}
                onChange={(e) => setNormalizeConfig({ ...normalizeConfig, dataset_name: e.target.value })}
                placeholder="e.g., UNSW-NB15.csv"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Dataset Type</label>
              <select
                value={normalizeConfig.dataset_type}
                onChange={(e) => setNormalizeConfig({ ...normalizeConfig, dataset_type: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="evtx">EVTX</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Timestamp Column</label>
              <input
                type="text"
                value={normalizeConfig.timestamp_column}
                onChange={(e) => setNormalizeConfig({ ...normalizeConfig, timestamp_column: e.target.value })}
                placeholder="e.g., StartTime"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Source IP Column</label>
              <input
                type="text"
                value={normalizeConfig.source_ip_column}
                onChange={(e) => setNormalizeConfig({ ...normalizeConfig, source_ip_column: e.target.value })}
                placeholder="e.g., src"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleNormalize}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded font-semibold transition"
            >
              Normalize Dataset
            </button>
            <button
              onClick={handleDeduplicate}
              className="flex-1 bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded font-semibold transition"
            >
              Deduplicate
            </button>
          </div>
        </div>
      </div>

      {/* Dataset Archive */}
      {datasets.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Dataset Archive
          </h2>
          <div className="space-y-2">
            {datasets.map((ds, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-700 p-3 rounded">
                <div className="flex-1">
                  <p className="font-medium">{ds.name}</p>
                  <p className="text-xs text-gray-400">{(ds.size / 1024).toFixed(2)} KB | {ds.timestamp}</p>
                  <p className="text-xs text-gray-500 font-mono mt-1">SHA-256: {ds.hash.substring(0, 16)}...</p>
                </div>
                <button className="p-2 hover:bg-gray-600 rounded">
                  <Trash2 className="h-4 w-4 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preprocessing Options */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Preprocessing Options</h2>
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span>Noise Reduction (Filter benign system chatter)</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span>Remove Duplicates (Exact matches)</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4" />
            <span>Normalize Timestamps (UTC)</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4" />
            <span>Encode Malicious Strings (Regex matching)</span>
          </label>
        </div>
      </div>
    </div>
  );
}
