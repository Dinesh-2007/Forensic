"""
Event Log Scraper: Extract critical Windows Security Event Logs
Focuses on Event IDs: 4688 (Process), 4624/4625 (Logons), 4104 (PowerShell), 1102 (Log Clear)
"""

import win32evtlog
import win32con
from typing import Dict, List
from datetime import datetime

class EventLogScraper:
    """Collects Windows Event Logs with forensic significance filtering"""
    
    # Critical Event IDs
    CRITICAL_EVENTS = {
        4688: "Process Creation",
        4624: "Successful Logon",
        4625: "Failed Logon (Brute Force Indicator)",
        4104: "PowerShell Script Block (Fileless Malware)",
        1102: "Audit Log Cleared (Cover Tracks)",
        4720: "User Account Created",
        4722: "User Account Enabled",
        4728: "Member Added to Global Group",
        4731: "Local Group Created"
    }
    
    def __init__(self):
        self.logs = []
    
    def get_critical_logs(self, hours: int = 24) -> Dict:
        """Extract critical Windows Security Event Logs"""
        critical_logs = []
        
        try:
            handle = win32evtlog.OpenEventLog(None, "Security")
            flags = win32evtlog.EVENTLOG_BACKWARDS_READ | win32evtlog.EVENTLOG_SEQUENTIAL_READ
            
            events = win32evtlog.ReadEventLog(handle, flags, 0)
            
            while events:
                for event in events:
                    event_id = event.GetEventID()
                    
                    # Only capture critical events
                    if event_id in self.CRITICAL_EVENTS:
                        event_data = {
                            'event_id': event_id,
                            'event_type': self.CRITICAL_EVENTS.get(event_id, 'Unknown'),
                            'timestamp': str(event.GetEventTime()),
                            'source': event.GetSourceName(),
                            'computer': event.GetComputerName(),
                            'message': event.GetEventMessage() if hasattr(event, 'GetEventMessage') else 'N/A',
                            'forensic_significance': self._assess_event_significance(event_id)
                        }
                        critical_logs.append(event_data)
                
                events = win32evtlog.ReadEventLog(handle, flags, 0)
            
            win32evtlog.CloseEventLog(handle)
        except Exception as e:
            return {"error": f"Failed to read event logs: {str(e)}"}
        
        return {
            "critical_events": critical_logs,
            "count": len(critical_logs),
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def _assess_event_significance(self, event_id: int) -> Dict:
        """Assess forensic significance of event"""
        significance_levels = {
            4688: {"severity": "high", "category": "Process Execution"},
            4625: {"severity": "critical", "category": "Brute Force Attack"},
            4104: {"severity": "critical", "category": "Fileless Malware"},
            1102: {"severity": "critical", "category": "Evidence Tampering"},
            4624: {"severity": "medium", "category": "Logon Activity"},
            4720: {"severity": "high", "category": "Account Creation"},
            4722: {"severity": "medium", "category": "Account Modification"},
        }
        return significance_levels.get(event_id, {"severity": "low", "category": "Other"})
