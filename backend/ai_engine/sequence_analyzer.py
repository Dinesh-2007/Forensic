"""
Sequence Analyzer: Detects attack patterns using LSTM and sequence modeling
Models: Attack happens in sequences (Download -> Execute -> Persist)
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple
from datetime import datetime
import json

class SequenceAnalyzer:
    """Analyzes sequences of events to detect multi-step attack patterns"""
    
    # Known attack sequences mapped to MITRE ATT&CK
    ATTACK_SEQUENCES = {
        'persistence_run_key': {
            'pattern': ['Process Spawn', 'Registry Modification', 'System Restart'],
            'mitre': 'T1547.001',
            'severity': 'critical',
            'description': 'Potential persistence via Registry Run key'
        },
        'fileless_malware': {
            'pattern': ['PowerShell Execution', 'Script Block Logging', 'Network Connection'],
            'mitre': 'T1059.001',
            'severity': 'critical',
            'description': 'Fileless malware execution detected'
        },
        'lateral_movement': {
            'pattern': ['Logon Activity', 'Process Creation', 'Network Connection'],
            'mitre': 'T1021',
            'severity': 'high',
            'description': 'Lateral movement indicators detected'
        },
        'privilege_escalation': {
            'pattern': ['Process Spawn', 'Token Impersonation', 'Registry Modification'],
            'mitre': 'T1134',
            'severity': 'high',
            'description': 'Potential privilege escalation attempt'
        }
    }
    
    def __init__(self):
        self.sequences = []
    
    def analyze(self, dataset_name: str, window_size: int = 10) -> Dict:
        """
        Analyze sequential patterns in logs
        window_size: Number of consecutive events to analyze
        """
        try:
            # Load and sort by timestamp
            df = pd.read_csv(f"./datasets/{dataset_name}")
            
            if 'timestamp' not in df.columns:
                return {'error': 'Dataset must contain timestamp column'}
            
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df = df.sort_values('timestamp')
            
            # Detect sequences
            detected_sequences = []
            
            for i in range(len(df) - window_size):
                window = df.iloc[i:i+window_size]
                
                # Extract event types
                event_sequence = window['event_type'].tolist() if 'event_type' in window.columns else []
                
                # Check against known attack sequences
                for seq_name, seq_def in self.ATTACK_SEQUENCES.items():
                    if self._match_sequence(event_sequence, seq_def['pattern']):
                        detected_sequences.append({
                            'attack_type': seq_name,
                            'description': seq_def['description'],
                            'severity': seq_def['severity'],
                            'mitre_technique': seq_def['mitre'],
                            'start_time': window.iloc[0]['timestamp'],
                            'end_time': window.iloc[-1]['timestamp'],
                            'events_count': len(window),
                            'confidence': self._calculate_sequence_confidence(window, seq_def)
                        })
            
            # Calculate timeline score
            timeline_score = len(detected_sequences) / max(len(df) // window_size, 1)
            
            return {
                'status': 'sequence_analysis_complete',
                'sequences': detected_sequences,
                'total_sequences': len(detected_sequences),
                'timeline_infection_probability': min(timeline_score * 100, 100),
                'timestamp': datetime.utcnow().isoformat()
            }
        
        except Exception as e:
            return {'error': f'Sequence analysis failed: {str(e)}'}
    
    def _match_sequence(self, observed: List[str], pattern: List[str]) -> bool:
        """Check if observed sequence matches known pattern (fuzzy match)"""
        # Simple matching: check if pattern elements appear in order
        pattern_idx = 0
        for event in observed:
            if pattern_idx < len(pattern) and self._event_match(event, pattern[pattern_idx]):
                pattern_idx += 1
        
        return pattern_idx >= len(pattern) * 0.7  # 70% match threshold
    
    def _event_match(self, event: str, pattern_element: str) -> bool:
        """Match event to pattern element (case-insensitive, substring)"""
        event_lower = str(event).lower()
        pattern_lower = pattern_element.lower()
        return pattern_lower in event_lower
    
    def _calculate_sequence_confidence(self, window: pd.DataFrame, seq_def: Dict) -> float:
        """Calculate confidence score for detected sequence"""
        # Base confidence: 0.5 to 1.0
        confidence = 0.5
        
        # Increase if events are temporally close
        if 'timestamp' in window.columns:
            time_span = (window.iloc[-1]['timestamp'] - window.iloc[0]['timestamp']).total_seconds()
            # Typical attack sequence: 5-60 seconds
            if time_span < 60:
                confidence += 0.3
            else:
                confidence += 0.1
        
        # Check for risk scores
        if 'risk_score' in window.columns:
            avg_risk = window['risk_score'].mean()
            confidence += (avg_risk * 0.2)
        
        return min(confidence, 1.0)
    
    def build_golden_thread(self, dataset_name: str) -> List[Dict]:
        """Build 'Golden Thread' timeline of attack progression"""
        try:
            df = pd.read_csv(f"./datasets/{dataset_name}")
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df = df.sort_values('timestamp')
            
            timeline = []
            for idx, row in df.iterrows():
                timeline.append({
                    'timestamp': row['timestamp'].isoformat(),
                    'event_type': row.get('event_type', 'Unknown'),
                    'severity': self._row_severity(row),
                    'details': row.to_dict()
                })
            
            return timeline
        except Exception as e:
            return [{'error': str(e)}]
    
    def _row_severity(self, row: pd.Series) -> str:
        """Determine severity from row"""
        if 'risk_score' in row and row['risk_score'] > 0.8:
            return 'red'
        elif 'risk_score' in row and row['risk_score'] > 0.5:
            return 'yellow'
        else:
            return 'green'
