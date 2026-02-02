import React, { useState, useEffect } from 'react';
import { BarChart3, Download, AlertTriangle, TrendingUp, Gauge } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5006/api';

export default function Page3AIForensicEngine() {
  const [analysisResults, setAnalysisResults] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [riskGauge, setRiskGauge] = useState(null);
  const [parameterBreakdown, setParameterBreakdown] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [datasetName, setDatasetName] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [xaiExplanation, setXaiExplanation] = useState(null);

  const handleRunAnalysis = async () => {
    if (!datasetName) {
      alert('Please enter a dataset name');
      return;
    }

    setAnalyzing(true);
    try {
      // Run main analysis
      const analysisResponse = await axios.post(`${API_BASE}/analysis/run`, null, {
        params: { dataset_name: datasetName }
      });
      setAnalysisResults(analysisResponse.data);

      // Get timeline
      const timelineResponse = await axios.get(`${API_BASE}/analysis/timeline`, {
        params: { dataset_name: datasetName }
      });
      setTimeline(timelineResponse.data.timeline);

      // Get risk gauge
      const riskResponse = await axios.get(`${API_BASE}/analysis/risk-gauge`, {
        params: { dataset_name: datasetName }
      });
      setRiskGauge(riskResponse.data);

      // Get parameter breakdown
      const paramResponse = await axios.get(`${API_BASE}/analysis/parameter-breakdown`, {
        params: { dataset_name: datasetName }
      });
      setParameterBreakdown(paramResponse.data);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed. Check that the dataset exists.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleEventClick = async (eventId) => {
    try {
      const response = await axios.get(`${API_BASE}/analysis/xai-explanation`, {
        params: { event_id: eventId }
      });
      setSelectedEvent(eventId);
      setXaiExplanation(response.data);
    } catch (error) {
      console.error('Failed to get explanation:', error);
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.post(`${API_BASE}/export/forensic-report`, {
        case_id: `CASE_${Date.now()}`,
        investigator_name: 'Investigator',
        export_format: 'csv',
        export_type: 'timeline'
      });
      alert(`Export ready: ${response.data.file_path}`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed');
    }
  };

  return (
    <div className="space-y-8">
      {/* Analysis Control */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Run Forensic Analysis
        </h2>
        <div className="flex space-x-3">
          <input
            type="text"
            value={datasetName}
            onChange={(e) => setDatasetName(e.target.value)}
            placeholder="Enter dataset name (e.g., UNSW-NB15.csv)"
            className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
          />
          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className={`px-6 py-2 rounded font-semibold transition ${analyzing
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-cyan-600 hover:bg-cyan-700'
              }`}
          >
            {analyzing ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </div>
      </div>

      {/* Risk Gauge */}
      {riskGauge && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Gauge className="h-5 w-5 mr-2" />
            System Infection Probability
          </h2>
          <div className="flex items-center space-x-8">
            <div className="relative w-48 h-48">
              <svg className="transform -rotate-90" width="200" height="200">
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="#374151"
                  strokeWidth="20"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke={riskGauge.risk_score > 70 ? '#ef4444' : '#eab308'}
                  strokeWidth="20"
                  strokeDasharray={`${(riskGauge.risk_score / 100) * 565} 565`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-4xl font-bold text-cyan-400">{riskGauge.risk_score.toFixed(1)}%</p>
                  <p className="text-sm text-gray-400">{riskGauge.severity.toUpperCase()}</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-gray-300 mb-4">This system shows signs of:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span>Unauthorized registry modifications</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span>Suspicious process spawning</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span>Anomalous network connections</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Golden Thread Timeline */}
      {timeline && timeline.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Infection Timeline (Golden Thread)
          </h2>
          <div className="space-y-3 max-h-96 overflow-auto">
            {timeline.slice(0, 10).map((event, idx) => (
              <div
                key={idx}
                onClick={() => handleEventClick(idx)}
                className={`p-3 rounded cursor-pointer border-l-4 transition ${event.severity === 'red'
                  ? 'border-red-500 bg-red-900/20'
                  : event.severity === 'yellow'
                    ? 'border-yellow-500 bg-yellow-900/20'
                    : 'border-green-500 bg-green-900/20'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{event.event_type}</p>
                    <p className="text-sm text-gray-400">{event.timestamp}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded font-semibold ${event.severity === 'red' ? 'bg-red-600' :
                    event.severity === 'yellow' ? 'bg-yellow-600' :
                      'bg-green-600'
                    }`}>
                    {event.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mt-2">{event.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* XAI Explanation */}
      {xaiExplanation && (
        <div className="bg-gray-800 rounded-lg p-6 border border-cyan-700 border-2">
          <h2 className="text-xl font-semibold mb-4">AI Explainability (XAI)</h2>
          <div className="space-y-3">
            <div className="bg-gray-900 p-4 rounded">
              <p className="text-gray-300 leading-relaxed">{xaiExplanation.explanation}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-2">MITRE ATT&CK Techniques:</p>
              <div className="flex flex-wrap gap-2">
                {xaiExplanation.mitre_attack?.map((technique, idx) => (
                  <span key={idx} className="bg-cyan-900 px-3 py-1 rounded text-xs font-mono">
                    {technique}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-400">Confidence Score: <span className="text-cyan-400 font-bold">{(xaiExplanation.confidence * 100).toFixed(1)}%</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Parameter Breakdown */}
      {parameterBreakdown && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Parameter Breakdown</h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(parameterBreakdown).map(([param, data]) => (
              <div key={param} className={`p-4 rounded border-l-4 ${data.risk === 'critical' ? 'border-red-500 bg-red-900/20' :
                data.risk === 'high' ? 'border-orange-500 bg-orange-900/20' :
                  data.risk === 'medium' ? 'border-yellow-500 bg-yellow-900/20' :
                    'border-green-500 bg-green-900/20'
                }`}>
                <p className="font-semibold capitalize">{param.replace(/_/g, ' ')}</p>
                <p className="text-2xl font-bold mt-2">{data.alerts}</p>
                <p className="text-xs text-gray-400 mt-1">Risk: {data.risk.toUpperCase()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Summary */}
      {analysisResults && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Analysis Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-700 p-4 rounded">
              <p className="text-gray-400 text-sm">Anomalies Detected</p>
              <p className="text-2xl font-bold text-cyan-400">{analysisResults.anomalies_detected || 0}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <p className="text-gray-400 text-sm">Overall Risk</p>
              <p className="text-2xl font-bold text-orange-400">{analysisResults.overall_risk || 'N/A'}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <p className="text-gray-400 text-sm">Risk Score</p>
              <p className="text-2xl font-bold text-red-400">{analysisResults.risk_score?.toFixed(1) || 0}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <p className="text-gray-400 text-sm">Dataset Type</p>
              <p className="text-sm font-mono text-gray-300 mt-2">{analysisResults.dataset_type || 'Generic'}</p>
            </div>
          </div>

          {/* Recommendations */}
          {analysisResults.recommendations && analysisResults.recommendations.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2 text-yellow-400">Recommendations</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                {analysisResults.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm">{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* AI Insights Panel (Gemini) */}
      {analysisResults?.ai_insights && Object.keys(analysisResults.ai_insights).length > 0 && (
        <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-lg p-6 border border-purple-500/50">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <h2 className="text-xl font-semibold text-purple-300">Gemini AI Threat Intelligence</h2>
          </div>

          {/* Executive Summary */}
          {analysisResults.ai_insights.executive_summary && (
            <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Executive Summary</h3>
              <p className="text-gray-200">{analysisResults.ai_insights.executive_summary}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Threat Level Badge */}
            {analysisResults.ai_insights.threat_level && (
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Threat Level</h3>
                <span className={`inline-block px-4 py-2 rounded-full font-bold text-lg ${analysisResults.ai_insights.threat_level === 'CRITICAL' ? 'bg-red-600 text-white' :
                    analysisResults.ai_insights.threat_level === 'HIGH' ? 'bg-orange-600 text-white' :
                      analysisResults.ai_insights.threat_level === 'MEDIUM' ? 'bg-yellow-600 text-black' :
                        'bg-green-600 text-white'
                  }`}>
                  {analysisResults.ai_insights.threat_level}
                </span>
              </div>
            )}

            {/* AI Risk Score */}
            {analysisResults.ai_insights.risk_score !== undefined && (
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">AI Risk Assessment</h3>
                <div className="flex items-center">
                  <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${analysisResults.ai_insights.risk_score > 70 ? 'bg-red-500' :
                          analysisResults.ai_insights.risk_score > 40 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                      style={{ width: `${analysisResults.ai_insights.risk_score}%` }}
                    ></div>
                  </div>
                  <span className="ml-3 text-xl font-bold text-white">{analysisResults.ai_insights.risk_score}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Key Concerns */}
          {analysisResults.ai_insights.key_concerns && analysisResults.ai_insights.key_concerns.length > 0 && (
            <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-red-400 mb-2">⚠️ Key Concerns</h3>
              <ul className="space-y-2">
                {analysisResults.ai_insights.key_concerns.map((concern, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span className="text-gray-300">{concern}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Attack Indicators (MITRE) */}
          {analysisResults.ai_insights.attack_indicators && analysisResults.ai_insights.attack_indicators.length > 0 && (
            <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-orange-400 mb-2">🎯 MITRE ATT&CK Indicators</h3>
              <div className="flex flex-wrap gap-2">
                {analysisResults.ai_insights.attack_indicators.map((indicator, idx) => (
                  <span key={idx} className="bg-orange-900/50 border border-orange-500 px-3 py-1 rounded text-sm">
                    <span className="font-mono text-orange-300">{indicator.technique}</span>
                    <span className="text-gray-400 ml-2">{indicator.name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Recommendations */}
          {analysisResults.ai_insights.recommendations && analysisResults.ai_insights.recommendations.length > 0 && (
            <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-green-400 mb-2">✅ AI Recommendations</h3>
              <ul className="space-y-2">
                {analysisResults.ai_insights.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0 text-xs font-bold">{idx + 1}</span>
                    <span className="text-gray-300">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Investigation Priorities */}
          {analysisResults.ai_insights.investigation_priorities && analysisResults.ai_insights.investigation_priorities.length > 0 && (
            <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-400 mb-2">🔍 Investigation Priorities</h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-300">
                {analysisResults.ai_insights.investigation_priorities.map((priority, idx) => (
                  <li key={idx}>{priority}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Export Button */}
      <button
        onClick={handleExport}
        className="w-full bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition"
      >
        <Download className="h-5 w-5" />
        <span>Download Forensic CSV Report</span>
      </button>

      {/* Warning */}
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-red-200">High-Risk System Detected</p>
          <p className="text-sm text-red-300 mt-1">
            This analysis indicates potential active compromise. Recommend immediate isolation and incident response activation.
          </p>
        </div>
      </div>
    </div>
  );
}
