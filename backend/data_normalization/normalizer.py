"""
Log Normalization: Convert diverse log sources to unified schema
Handles: Windows Event Logs, Network CSVs, Registry dumps, Process trees
"""

import pandas as pd
import json
import csv
from typing import Dict, Optional
from datetime import datetime
import re

class LogNormalizer:
    """Converts heterogeneous log sources to unified forensic schema"""
    
    # Unified schema columns
    UNIFIED_SCHEMA = [
        'timestamp',
        'event_type',
        'source_ip',
        'destination_ip',
        'source_port',
        'destination_port',
        'protocol',
        'process_name',
        'process_id',
        'user',
        'action',
        'risk_score',
        'original_log'
    ]
    
    def __init__(self):
        self.normalizers = {
            'csv': self._normalize_csv,
            'json': self._normalize_json,
            'evtx': self._normalize_evtx
        }
    
    def normalize(self, dataset_name: str, dataset_type: str, 
                  timestamp_column: str, source_ip_column: Optional[str] = None) -> pd.DataFrame:
        """Main normalization entry point"""
        
        if dataset_type not in self.normalizers:
            raise ValueError(f"Unsupported dataset type: {dataset_type}")
        
        # Load raw data
        file_path = f"./datasets/{dataset_name}"
        
        if dataset_type == 'csv':
            raw_data = pd.read_csv(file_path)
        elif dataset_type == 'json':
            with open(file_path, 'r') as f:
                raw_data = pd.DataFrame(json.load(f))
        else:
            raw_data = self._load_evtx(file_path)
        
        # Normalize
        normalized = self.normalizers[dataset_type](
            raw_data, 
            timestamp_column,
            source_ip_column
        )
        
        return normalized
    
    def _normalize_csv(self, df: pd.DataFrame, ts_col: str, src_ip_col: Optional[str]) -> pd.DataFrame:
        """Normalize CSV datasets (e.g., UNSW-NB15, CICIDS2017)"""
        normalized = pd.DataFrame()
        
        # Map timestamp
        normalized['timestamp'] = pd.to_datetime(df[ts_col])
        
        # Map IPs
        if src_ip_col and src_ip_col in df.columns:
            normalized['source_ip'] = df[src_ip_col]
        
        # Common column mappings for network datasets
        column_map = {
            'sport': 'source_port',
            'dport': 'destination_port',
            'proto': 'protocol',
            'attack_cat': 'event_type',
            'label': 'risk_score'
        }
        
        for old_col, new_col in column_map.items():
            if old_col in df.columns:
                normalized[new_col] = df[old_col]
        
        # Compute risk score if label present
        if 'label' in df.columns:
            normalized['risk_score'] = df['label'].apply(
                lambda x: 0.9 if x != 'Normal' else 0.1
            )
        
        # Store original log for forensic trace
        normalized['original_log'] = df.to_dict(orient='records')
        
        return normalized.fillna('N/A')
    
    def _normalize_json(self, df: pd.DataFrame, ts_col: str, src_ip_col: Optional[str]) -> pd.DataFrame:
        """Normalize JSON log files"""
        return self._normalize_csv(df, ts_col, src_ip_col)
    
    def _normalize_evtx(self, file_path: str) -> pd.DataFrame:
        """Normalize Windows Event Log (.evtx) files"""
        # Requires python-evtx library
        try:
            from Evtx.Evtx import Evtx
            
            events = []
            with Evtx(file_path) as evtx:
                for record in evtx.records():
                    event_data = {
                        'timestamp': record.event_data.get('Event', {}).get('System', {}).get('TimeCreated'),
                        'event_type': 'EventLog',
                        'original_log': str(record.xml())
                    }
                    events.append(event_data)
            
            return pd.DataFrame(events)
        except ImportError:
            return pd.DataFrame({'error': 'python-evtx not installed'})
    
    def _load_evtx(self, file_path: str) -> pd.DataFrame:
        """Load EVTX file into DataFrame"""
        return pd.DataFrame()
    
    def denormalize_for_export(self, normalized_df: pd.DataFrame, export_format: str) -> str:
        """Convert normalized schema back to export format"""
        if export_format == 'csv':
            return normalized_df.to_csv(index=False)
        elif export_format == 'json':
            return normalized_df.to_json(orient='records')
        else:
            return normalized_df.to_string()
