"""
WinSentinel Backend Configuration
"""

import os
from typing import Dict

# Application Config
APP_NAME = "WinSentinel"
APP_VERSION = "1.2.0"
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

# API Config
API_HOST = "0.0.0.0"
API_PORT = int(os.getenv("API_PORT", 8000))
API_WORKERS = int(os.getenv("API_WORKERS", 4))

# Database Config
DATABASE_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", 5432)),
    "database": os.getenv("DB_NAME", "winssentinel"),
    "user": os.getenv("DB_USER", "forensic_user"),
    "password": os.getenv("DB_PASSWORD", "secure_password")
}

# Storage Config
DATASETS_DIR = "./datasets"
EXPORTS_DIR = "./forensic_exports"
LOGS_DIR = "./logs"

# Ensure directories exist
for dir_path in [DATASETS_DIR, EXPORTS_DIR, LOGS_DIR]:
    os.makedirs(dir_path, exist_ok=True)

# AI Model Config
ANOMALY_DETECTION = {
    "algorithm": "isolation_forest",
    "contamination": 0.1,
    "n_estimators": 100
}

SEQUENCE_ANALYSIS = {
    "window_size": 10,
    "match_threshold": 0.7
}

# Logging Config
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

# CORS Config
CORS_ORIGINS = ["http://localhost:3000", "http://localhost:8080", "*"]
CORS_METHODS = ["*"]
CORS_HEADERS = ["*"]

# Tool Dependencies
TOOL_DEPENDENCIES = {
    "PyTorch": "2.1.0+",
    "Scikit-Learn": "1.3.0+",
    "Pandas": "2.0.0+",
    "FastAPI": "0.104.0+",
    "NumPy": "1.24.0+",
    "psutil": "5.9.0+"
}

# MITRE ATT&CK Tactics
MITRE_TACTICS = [
    "Reconnaissance",
    "Resource Development",
    "Initial Access",
    "Execution",
    "Persistence",
    "Privilege Escalation",
    "Defense Evasion",
    "Credential Access",
    "Discovery",
    "Lateral Movement",
    "Collection",
    "Command and Control",
    "Exfiltration",
    "Impact"
]

# Risk Assessment Thresholds
RISK_THRESHOLDS = {
    "critical": 0.85,
    "high": 0.65,
    "medium": 0.45,
    "low": 0.25,
    "benign": 0.0
}
