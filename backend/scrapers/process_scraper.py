"""
Process Tree Scraper: Extract parent/child process relationships
"""

import psutil
import json
from typing import Dict, List
from datetime import datetime

class ProcessScraper:
    """Collects live process tree data with forensic details"""
    
    def __init__(self):
        self.processes = {}
    
    def get_process_tree(self) -> Dict:
        """Build parent-child process tree"""
        tree = {}
        try:
            for proc in psutil.process_iter(['pid', 'ppid', 'name', 'exe', 'cmdline', 'create_time']):
                try:
                    proc_info = proc.info
                    pid = proc_info['pid']
                    tree[pid] = {
                        'pid': pid,
                        'ppid': proc_info['ppid'],
                        'name': proc_info['name'],
                        'exe': proc_info['exe'],
                        'cmdline': ' '.join(proc_info['cmdline']) if proc_info['cmdline'] else '',
                        'created': datetime.fromtimestamp(proc_info['create_time']).isoformat(),
                        'forensic_flags': self._check_forensic_flags(proc_info)
                    }
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
            
            return self._build_hierarchy(tree)
        except Exception as e:
            return {"error": str(e)}
    
    def _build_hierarchy(self, flat_tree: Dict) -> Dict:
        """Convert flat process list to hierarchical tree"""
        root_processes = []
        
        for pid, proc_info in flat_tree.items():
            ppid = proc_info['ppid']
            if ppid is None or ppid not in flat_tree:
                root_processes.append(proc_info)
            else:
                if 'children' not in flat_tree[ppid]:
                    flat_tree[ppid]['children'] = []
                flat_tree[ppid]['children'].append(proc_info)
        
        return {"root_processes": root_processes}
    
    def _check_forensic_flags(self, proc_info: Dict) -> List[str]:
        """Flag suspicious process patterns"""
        flags = []
        exe = proc_info['exe'] or ''
        name = proc_info['name'] or ''
        cmdline = ' '.join(proc_info['cmdline']) if proc_info['cmdline'] else ''
        
        # Suspicious parent-child relationships
        suspicious_pairs = {
            'explorer.exe': ['cmd.exe', 'powershell.exe', 'rundll32.exe'],
            'svchost.exe': ['cmd.exe', 'powershell.exe', 'notepad.exe'],
            'winlogon.exe': ['cmd.exe', 'powershell.exe'],
        }
        
        # Suspicious process names
        suspicious_processes = ['psexec.exe', 'mimikatz.exe', 'laZagne.exe']
        
        # Suspicious command patterns
        suspicious_patterns = ['base64', 'encoded', 'obfuscated', '-nop', '-enc']
        
        if name.lower() in suspicious_processes:
            flags.append('MALWARE_SIGNATURE')
        
        if any(pattern in cmdline.lower() for pattern in suspicious_patterns):
            flags.append('OBFUSCATED_COMMAND')
        
        if 'temp' in exe.lower() or 'appdata' in exe.lower():
            flags.append('NON_STANDARD_PATH')
        
        return flags
