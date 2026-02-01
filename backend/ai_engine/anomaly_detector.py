"""
Anomaly Detection Engine: Unsupervised learning for malicious behavior detection
Uses Isolation Forest for outlier detection (doesn't require labeled data)
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from typing import Dict, List, Tuple
from datetime import datetime
import json

class AnomalyDetector:
    """Detects anomalous behavior using Isolation Forest"""
    
    def __init__(self, contamination: float = 0.1):
        """
        Initialize detector
        contamination: Expected proportion of anomalies in dataset (0-1)
        """
        self.contamination = contamination
        self.scaler = StandardScaler()
        self.model = IsolationForest(contamination=contamination, random_state=42)
        self.trained = False
    
    def detect(self, dataset_name: str, features: List[str] = None) -> Dict:
        """
        Run anomaly detection on dataset
        Returns: List of anomalies with risk scores
        """
        try:
            # Load normalized data (from normalizer)
            df = pd.read_csv(f"./datasets/{dataset_name}")
            
            # Select features for anomaly detection
            if features is None:
                # Default features: network-based
                features = [
                    'source_port', 'destination_port', 'sbytes', 'dbytes',
                    'sttl', 'dttl', 'sintpkt', 'dintpkt'
                ]
                features = [f for f in features if f in df.columns]
            
            # Prepare data
            X = df[features].fillna(0).values
            X_scaled = self.scaler.fit_transform(X)
            
            # Fit and predict
            predictions = self.model.fit_predict(X_scaled)
            anomaly_scores = self.model.score_samples(X_scaled)
            
            # Convert scores to risk (0-1 range)
            risk_scores = 1 - (anomaly_scores - anomaly_scores.min()) / \
                         (anomaly_scores.max() - anomaly_scores.min())
            
            # Identify anomalies
            anomalies = []
            for idx, (pred, risk) in enumerate(zip(predictions, risk_scores)):
                if pred == -1:  # Anomaly
                    anomalies.append({
                        'row_index': idx,
                        'risk_score': float(risk),
                        'severity': self._risk_to_severity(risk),
                        'features': dict(zip(features, X[idx])),
                        'timestamp': df.iloc[idx]['timestamp'] if 'timestamp' in df.columns else 'N/A'
                    })
            
            # Sort by risk
            anomalies.sort(key=lambda x: x['risk_score'], reverse=True)
            
            return {
                'status': 'detection_complete',
                'anomalies': anomalies,
                'total_anomalies': len(anomalies),
                'contamination_rate': len(anomalies) / len(df),
                'timestamp': datetime.utcnow().isoformat()
            }
        
        except Exception as e:
            return {'error': f'Anomaly detection failed: {str(e)}'}
    
    def _risk_to_severity(self, risk: float) -> str:
        """Convert risk score to severity level"""
        if risk > 0.8:
            return 'critical'
        elif risk > 0.6:
            return 'high'
        elif risk > 0.4:
            return 'medium'
        else:
            return 'low'
    
    def get_feature_importance(self) -> Dict:
        """Analyze which features drive anomaly detection"""
        # Isolation Forest doesn't have direct feature importance
        # Instead, return feature statistics that help interpretation
        return {
            'interpretation': 'Features with high variance often drive anomalies',
            'recommendation': 'Focus on inter-packet timing and TTL variance'
        }
