"""
Registry Scraper: Extract Auto-run and User Assist keys for persistence detection
"""

import winreg
import json
from typing import Dict
from datetime import datetime
import struct

class RegistryScraper:
    """Collects Registry data critical for forensic analysis"""
    
    # Key persistence locations
    RUN_KEYS = [
        (winreg.HKEY_LOCAL_MACHINE, r'SOFTWARE\Microsoft\Windows\CurrentVersion\Run'),
        (winreg.HKEY_LOCAL_MACHINE, r'SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce'),
        (winreg.HKEY_CURRENT_USER, r'SOFTWARE\Microsoft\Windows\CurrentVersion\Run'),
        (winreg.HKEY_CURRENT_USER, r'SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce'),
    ]
    
    USER_ASSIST_KEY = (winreg.HKEY_CURRENT_USER, r'SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\UserAssist')
    
    def __init__(self):
        self.registry_data = {}
    
    def get_run_keys(self) -> Dict:
        """Extract Auto-run keys from Windows Registry"""
        run_entries = {}
        
        for hive, path in self.RUN_KEYS:
            try:
                key = winreg.OpenKey(hive, path)
                i = 0
                while True:
                    try:
                        name, value, regtype = winreg.EnumValue(key, i)
                        run_entries[f"{path}\\{name}"] = {
                            'value': value,
                            'type': regtype,
                            'forensic_significance': self._assess_run_entry(name, value)
                        }
                        i += 1
                    except OSError:
                        break
                winreg.CloseKey(key)
            except FileNotFoundError:
                continue
            except PermissionError:
                run_entries[f"{path}"] = {"error": "Access Denied"}
        
        return {"run_keys": run_entries}
    
    def get_user_assist_keys(self) -> Dict:
        """Extract User Assist keys (tracks program execution history)"""
        user_assist_data = {}
        hive, path = self.USER_ASSIST_KEY
        
        try:
            key = winreg.OpenKey(hive, path)
            i = 0
            while True:
                try:
                    subkey_name = winreg.EnumKey(key, i)
                    subkey = winreg.OpenKey(key, subkey_name)
                    
                    j = 0
                    while True:
                        try:
                            name, value, regtype = winreg.EnumValue(subkey, j)
                            if name == 'HRZR_PGYFRFFVATF':  # ROT13 encoded
                                decoded_data = self._decode_userassist_value(value)
                                user_assist_data[name] = {
                                    'execution_count': decoded_data.get('execution_count'),
                                    'last_execution': decoded_data.get('last_execution')
                                }
                            j += 1
                        except OSError:
                            break
                    
                    winreg.CloseKey(subkey)
                    i += 1
                except OSError:
                    break
            
            winreg.CloseKey(key)
        except (FileNotFoundError, PermissionError):
            pass
        
        return {"user_assist": user_assist_data}
    
    def _assess_run_entry(self, name: str, value: str) -> Dict:
        """Flag suspicious registry entries"""
        flags = []
        
        suspicious_keywords = ['cmd', 'powershell', 'rundll32', 'svchost', 'regsvcs']
        suspicious_paths = ['temp', 'appdata', 'programdata', 'public']
        
        if any(keyword in value.lower() for keyword in suspicious_keywords):
            flags.append('SUSPICIOUS_COMMAND')
        
        if any(path in value.lower() for path in suspicious_paths):
            flags.append('NON_STANDARD_PATH')
        
        return {
            'severity': 'high' if flags else 'low',
            'flags': flags
        }
    
    def _decode_userassist_value(self, value: bytes) -> Dict:
        """Decode User Assist ROT13 encoded value"""
        try:
            # ROT13 decode
            if isinstance(value, bytes) and len(value) >= 4:
                execution_count = struct.unpack('<I', value[4:8])[0]
                return {
                    'execution_count': execution_count,
                    'last_execution': 'N/A'  # Requires additional parsing
                }
        except:
            pass
        return {'execution_count': 0, 'last_execution': 'Unknown'}
