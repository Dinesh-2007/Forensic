"""
Network Scraper: Extract active socket connections and remote IPs
"""

import psutil
from typing import Dict, List
from datetime import datetime

class NetworkScraper:
    """Collects live network connection data"""
    
    def __init__(self):
        self.connections = []
    
    def get_active_connections(self) -> Dict:
        """Get all active network connections with forensic context"""
        active_conns = []
        
        try:
            for conn in psutil.net_connections():
                # Filter out None values and listening ports
                if conn.raddr:
                    connection_data = {
                        'local_ip': conn.laddr.ip,
                        'local_port': conn.laddr.port,
                        'remote_ip': conn.raddr.ip,
                        'remote_port': conn.raddr.port,
                        'protocol': 'TCP' if conn.type == 1 else 'UDP',
                        'state': conn.status,
                        'pid': conn.pid,
                        'process_name': self._get_process_name(conn.pid),
                        'forensic_flags': self._check_network_anomalies(conn)
                    }
                    active_conns.append(connection_data)
        except (PermissionError, psutil.AccessDenied):
            return {"error": "Insufficient permissions for network enumeration"}
        
        return {
            "connections": active_conns,
            "total_count": len(active_conns),
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def _get_process_name(self, pid: int) -> str:
        """Get process name from PID"""
        try:
            return psutil.Process(pid).name()
        except:
            return "UNKNOWN"
    
    def _check_network_anomalies(self, conn) -> List[str]:
        """Flag suspicious network patterns"""
        flags = []
        
        # Non-standard ports
        suspicious_ports = [4444, 5555, 6666, 8080, 9999, 31337, 666]
        if conn.raddr.port in suspicious_ports:
            flags.append('NON_STANDARD_PORT')
        
        # High port numbers (might indicate P2P or C2)
        if conn.raddr.port > 50000:
            flags.append('ELEVATED_PORT')
        
        # Common C2 beacons
        c2_domains = ['pastebin.com', 'bitly.com', 'tinyurl.com']
        # (In real implementation, do reverse DNS lookup)
        
        return flags
