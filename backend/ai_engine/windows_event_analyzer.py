"""
Windows Event Log Analyzer: Specialized forensic analysis for Windows event logs
Detects security anomalies, error spikes, and suspicious patterns
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Set
from collections import Counter
import re

class WindowsEventLogAnalyzer:
    """Analyzes Windows event logs for forensic anomalies"""
    
    # Risk mappings for event types
    CRITICAL_SOURCES = {
        'Microsoft-Windows-Security-Auditing',
        'Microsoft-Windows-Sysmon',
        'Microsoft-Windows-PowerShell',
        'Microsoft-Windows-WMI-Activity'
    }
    
    ERROR_LEVEL_MAPPING = {
        'Information': 1,
        'Warning': 3,
        'Error': 2,
        'Critical': 4
    }
    
    def __init__(self):
        self.df = None
        self.analysis_results = {}
    
    def analyze_event_log(self, file_path: str) -> Dict:
        """
        Comprehensive Windows event log analysis
        Returns: Forensic analysis with threat detection
        """
        try:
            # Load CSV
            self.df = pd.read_csv(file_path, dtype={'EventID': str})
            
            if len(self.df) == 0:
                return {'error': 'Empty dataset'}
            
            # Parse timestamp with flexible format handling
            # Normalize timestamp column
            timestamp_cols = ['TimeCreated', 'Date', 'Time', 'timestamp', 'date']
            for col in timestamp_cols:
                if 'Timestamp' not in self.df.columns and col in self.df.columns:
                    self.df.rename(columns={col: 'Timestamp'}, inplace=True)
                    break
            
            # Parse timestamp with flexible format handling
            if 'Timestamp' not in self.df.columns:
                 return {'error': f'Missing "Timestamp" column. Found: {list(self.df.columns)}'}
                 
            self.df['Timestamp'] = pd.to_datetime(self.df['Timestamp'], errors='coerce')

            # Normalize other critical columns
            column_mappings = {'Severity': 'Level', 'Type': 'Level', 'Provider': 'Source'}
            self.df.rename(columns=column_mappings, inplace=True)
            
            # Ensure critical columns exist
            if 'Level' not in self.df.columns:
                self.df['Level'] = 'Information' # Default
            if 'Source' not in self.df.columns:
                self.df['Source'] = 'Unknown Source'
            if 'EventID' not in self.df.columns:
                self.df['EventID'] = '0'
            if 'Message' not in self.df.columns:
                self.df['Message'] = ''
            if 'UserID' not in self.df.columns:
                self.df['UserID'] = 'N/A'
            if 'Computer' not in self.df.columns:
                self.df['Computer'] = 'Unknown'
            

            
            # Run analysis modules
            results = {
                'metadata': self._extract_metadata(),
                'severity_distribution': self._analyze_severity(),
                'source_analysis': self._analyze_sources(),
                'error_analysis': self._detect_error_spikes(),
                'timeline_analysis': self._analyze_timeline(),
                'anomalies': self._detect_anomalies(),
                'threat_indicators': self._identify_threats(),
                'recommendations': self._generate_recommendations()
            }
            
            self.analysis_results = results
            return results
            
        except Exception as e:
            return {'error': f'Event log analysis failed: {str(e)}'}
    
    def _extract_metadata(self) -> Dict:
        """Extract basic dataset metadata"""
        return {
            'total_records': len(self.df),
            'total_events': len(self.df),
            'date_range': {
                'start': self.df['Timestamp'].min().isoformat(),
                'end': self.df['Timestamp'].max().isoformat(),
                'duration_hours': (self.df['Timestamp'].max() - self.df['Timestamp'].min()).total_seconds() / 3600
            },
            'date_range_days': int((self.df['Timestamp'].max() - self.df['Timestamp'].min()).days),
            'unique_sources': self.df['Source'].nunique(),
            'unique_users': self.df['UserID'].nunique(),
            'unique_computers': self.df['Computer'].nunique()
        }
    
    def _analyze_severity(self) -> Dict:
        """Analyze severity level distribution"""
        level_counts = self.df['Level'].value_counts().to_dict()
        
        return {
            'distribution': level_counts,
            'critical_count': level_counts.get('Critical', 0),
            'error_count': level_counts.get('Error', 0),
            'warning_count': level_counts.get('Warning', 0),
            'info_count': level_counts.get('Information', 0),
            'error_percentage': (level_counts.get('Error', 0) + level_counts.get('Critical', 0)) / len(self.df) * 100
        }
    
    def _analyze_sources(self) -> Dict:
        """Analyze event sources and categorize by criticality"""
        source_counts = self.df['Source'].value_counts().to_dict()
        
        critical_sources = {}
        system_services = {}
        applications = {}
        
        for source, count in source_counts.items():
            if source in self.CRITICAL_SOURCES:
                critical_sources[source] = count
            elif 'Microsoft-Windows' in source:
                system_services[source] = count
            else:
                applications[source] = count
        
        return {
            'top_10_sources': dict(sorted(source_counts.items(), key=lambda x: x[1], reverse=True)[:10]),
            'critical_sources': critical_sources,
            'system_services': system_services,
            'applications': applications,
            'total_unique_sources': len(source_counts)
        }
    
    def _detect_error_spikes(self) -> Dict:
        """Detect sudden spikes in error events"""
        errors = self.df[self.df['Level'].isin(['Error', 'Critical', 'Warning'])].copy()
        
        if len(errors) == 0:
            return {'spike_detected': False, 'spikes': []}
        
        # Group by hour and count
        errors['Hour'] = errors['Timestamp'].dt.floor('h')
        hourly_counts = errors.groupby('Hour').size()
        
        # Detect spikes (events > mean + 1 std dev)
        mean = hourly_counts.mean()
        std = hourly_counts.std()
        threshold = mean + std
        
        spikes = []
        for hour, count in hourly_counts.items():
            if count > threshold:
                spikes.append({
                    'timestamp': hour.isoformat(),
                    'event_count': int(count),
                    'deviation_from_mean': float(count - mean)
                })
        
        return {
            'spike_detected': len(spikes) > 0,
            'spikes': sorted(spikes, key=lambda x: x['event_count'], reverse=True),
            'average_errors_per_hour': float(mean),
            'threshold': float(threshold)
        }
    
    def _analyze_timeline(self) -> Dict:
        """Analyze event distribution over time"""
        daily_counts = self.df.groupby(self.df['Timestamp'].dt.date).size()
        # Convert date keys to strings for JSON serialization
        daily_counts.index = daily_counts.index.astype(str)
        
        hourly_counts = self.df.groupby(self.df['Timestamp'].dt.floor('h')).size()
        
        return {
            'events_per_day': daily_counts.to_dict(),
            'peak_hour': self.df.groupby(self.df['Timestamp'].dt.hour).size().idxmax(),
            'daily_avg': float(daily_counts.mean()),
            'hourly_avg': float(hourly_counts.mean())
        }
    
    def _detect_anomalies(self) -> Dict:
        """Detect suspicious patterns in logs"""
        anomalies = []
        
        # 1. Repeated errors from same source
        error_sources = self.df[self.df['Level'] == 'Error']['Source'].value_counts()
        for source, count in error_sources.head(5).items():
            if count > 5:
                anomalies.append({
                    'type': 'repeated_errors',
                    'source': source,
                    'count': int(count),
                    'risk': 'medium',
                    'description': f'{source} generated {count} error events'
                })
        
        # 2. Unusual user activities
        user_events = self.df[self.df['UserID'] != 'N/A']['UserID'].value_counts()
        for user, count in user_events.head(3).items():
            if count > 50:
                anomalies.append({
                    'type': 'high_activity_user',
                    'user': user,
                    'event_count': int(count),
                    'risk': 'low',
                    'description': f'User {user} has {count} events (possible noise or legitimate activity)'
                })
        
        # 3. Messages containing keywords indicating issues
        suspicious_keywords = [
            'failed', 'denied', 'unauthorized', 'permission', 'access denied',
            'invalid', 'error', 'critical', 'breach', 'threat'
        ]
        
        for keyword in suspicious_keywords:
            matching = self.df[self.df['Message'].str.lower().str.contains(keyword, na=False)]
            if len(matching) > 3:
                anomalies.append({
                    'type': 'suspicious_keywords',
                    'keyword': keyword,
                    'count': len(matching),
                    'risk': 'medium',
                    'description': f'Messages containing "{keyword}" detected {len(matching)} times'
                })
        
        return {
            'anomalies_detected': len(anomalies),
            'anomalies': anomalies[:10]  # Top 10
        }
    
    def _identify_threats(self) -> Dict:
        """Identify security threats and suspicious patterns"""
        threats = []
        
        # 1. DPTF/Hardware errors (reliability indicator)
        dptf_errors = self.df[self.df['Source'].str.contains('DPTF', case=False, na=False) & 
                              (self.df['Level'] == 'Error')]
        if len(dptf_errors) > 0:
            threats.append({
                'category': 'Hardware Issues',
                'type': 'DPTF_Errors',
                'count': len(dptf_errors),
                'severity': 'LOW',
                'mitre_technique': 'T1499 - Service Stop',
                'confidence': 0.6,
                'description': 'Power/thermal management errors (system stability concern)'
            })
        
        # 2. Winlogon failures (session/login issues)
        winlogon_errors = self.df[self.df['Source'].str.contains('Winlogon', case=False, na=False) & 
                                  (self.df['Level'].isin(['Error', 'Warning']))]
        if len(winlogon_errors) > 0:
            threats.append({
                'category': 'Session Management',
                'type': 'Winlogon_Events',
                'count': len(winlogon_errors),
                'severity': 'MEDIUM',
                'mitre_technique': 'T1547 - Boot or Logon Autostart Execution',
                'confidence': 0.7,
                'description': 'Session initialization issues detected'
            })
        
        # 3. Windows Error Reporting (WER) indicates system failures
        wer_events = self.df[self.df['Source'].str.contains('Windows Error Reporting', case=False, na=False)]
        if len(wer_events) > 0:
            threats.append({
                'category': 'System Stability',
                'type': 'Application_Crashes',
                'count': len(wer_events),
                'severity': 'MEDIUM',
                'mitre_technique': 'T1499 - Service Disruption',
                'confidence': 0.75,
                'description': 'Application crashes or system failures recorded'
            })
        
        # 4. Security Service events
        security_events = self.df[self.df['Source'].str.contains('Security-SPP|SecurityCenter', case=False, na=False)]
        if len(security_events) > 0:
            threats.append({
                'category': 'Security Services',
                'type': 'Protection_Events',
                'count': len(security_events),
                'severity': 'LOW',
                'mitre_technique': 'T1562 - Impair Defenses',
                'confidence': 0.5,
                'description': 'Software Protection Service activities'
            })
        
        return {
            'total_threats_identified': len(threats),
            'threats': threats,
            'overall_risk': self._calculate_overall_risk(threats)
        }
    
    def _calculate_overall_risk(self, threats: List[Dict]) -> str:
        """Calculate overall risk level"""
        if not threats:
            return 'LOW'
        
        high_count = sum(1 for t in threats if t['severity'] == 'HIGH')
        medium_count = sum(1 for t in threats if t['severity'] == 'MEDIUM')
        
        if high_count > 0:
            return 'HIGH'
        elif medium_count >= 2:
            return 'MEDIUM'
        else:
            return 'LOW'
    
    def _generate_recommendations(self) -> List[Dict]:
        """Generate actionable recommendations"""
        recommendations = []
        
        severity = self.analysis_results.get('severity_distribution', {})
        errors = severity.get('error_count', 0)
        
        if errors > 10:
            recommendations.append({
                'priority': 'HIGH',
                'action': 'Review error events',
                'description': f'{errors} error events detected. Investigate root causes.',
                'steps': [
                    '1. Filter logs by "Error" level',
                    '2. Group by Source to identify problematic services',
                    '3. Check system logs for correlations',
                    '4. Review backup/recovery status'
                ]
            })
        
        sources = self.analysis_results.get('source_analysis', {})
        critical = sources.get('critical_sources', {})
        if critical:
            recommendations.append({
                'priority': 'MEDIUM',
                'action': 'Monitor critical sources',
                'description': f'Critical sources detected: {list(critical.keys())}',
                'steps': [
                    '1. Enable enhanced logging for critical sources',
                    '2. Set up alerts for critical events',
                    '3. Archive logs for forensic analysis'
                ]
            })
        
        timeline = self.analysis_results.get('timeline_analysis', {})
        peak = timeline.get('peak_hour')
        recommendations.append({
            'priority': 'LOW',
            'action': 'Review peak activity time',
            'description': f'Peak activity occurs around {peak}:00. Normal operation indicator.',
            'steps': [
                '1. Establish baseline metrics',
                '2. Monitor for deviations from baseline',
                '3. Correlate with user activity logs'
            ]
        })
        
        return recommendations
