import sqlite3
import json
import os
from datetime import datetime
from typing import Dict, Any, List, Optional

DB_PATH = "forensic_data.db"

def init_db():
    """Initialize the database tables."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # K-V store for singletons (dashboard stats, etc.)
    c.execute('''CREATE TABLE IF NOT EXISTS kv_store
                 (key TEXT PRIMARY KEY, value TEXT)''')
                 
    # Analysis Results (keyed by dataset name usually, or just a log)
    c.execute('''CREATE TABLE IF NOT EXISTS analysis_results
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                  dataset_name TEXT, 
                  result TEXT, 
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP)''')

    # Scrape Results
    c.execute('''CREATE TABLE IF NOT EXISTS scrape_results
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                  result TEXT, 
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP)''')
                  
    # Chain of Custody
    c.execute('''CREATE TABLE IF NOT EXISTS chain_of_custody
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                  timestamp TEXT, 
                  description TEXT, 
                  user TEXT, 
                  hash TEXT,
                  metadata TEXT)''')

    conn.commit()
    conn.close()

def save_state_key(key: str, value: Any):
    """Save a JSON-serializable object to the KV store."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)", 
              (key, json.dumps(value)))
    conn.commit()
    conn.close()

def load_state_key(key: str, default: Any = None):
    """Load a JSON-serializable object from the KV store."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT value FROM kv_store WHERE key=?", (key,))
    row = c.fetchone()
    conn.close()
    if row:
        try:
            return json.loads(row[0])
        except:
            return default
    return default

def add_chain_of_custody_entry(entry: Dict):
    """Add an entry to the chain of custody log."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''INSERT INTO chain_of_custody 
                 (timestamp, description, user, hash, metadata) 
                 VALUES (?, ?, ?, ?, ?)''',
              (entry.get('timestamp', datetime.now().isoformat()),
               entry.get('description', ''),
               entry.get('user', 'System'),
               entry.get('hash', ''),
               json.dumps(entry.get('metadata', {}))))
    conn.commit()
    conn.close()

def get_chain_of_custody() -> List[Dict]:
    """Retrieve full chain of custody log."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM chain_of_custody ORDER BY id DESC")
    rows = c.fetchall()
    conn.close()
    
    result = []
    for row in rows:
        item = dict(row)
        if item['metadata']:
            try:
                item['metadata'] = json.loads(item['metadata'])
            except:
                item['metadata'] = {}
        result.append(item)
    return result

def save_analysis(dataset_name: str, result: Dict):
    """Save analysis result."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    # We might want to upsert or just append history. 
    # For now, let's keep a history but also allow easy retrieval of latest by name.
    c.execute("INSERT INTO analysis_results (dataset_name, result) VALUES (?, ?)",
              (dataset_name, json.dumps(result)))
    conn.commit()
    conn.close()
    
    # Also update 'latest_analysis' in KV for quick access
    save_state_key("latest_analysis", result)

def get_latest_analysis(dataset_name: Optional[str] = None):
    """Get latest analysis, optionally filtering by dataset name."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    if dataset_name:
        c.execute("SELECT result FROM analysis_results WHERE dataset_name = ? ORDER BY id DESC LIMIT 1", (dataset_name,))
    else:
        c.execute("SELECT result FROM analysis_results ORDER BY id DESC LIMIT 1")
    row = c.fetchone()
    conn.close()
    if row:
        return json.loads(row[0])
    return None

def save_scrape(result: Dict):
    """Save scrape result."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("INSERT INTO scrape_results (result) VALUES (?)", (json.dumps(result),))
    conn.commit()
    conn.close()
    save_state_key("last_scrape_results", result)
