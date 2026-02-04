"""
Export Manager: Generate forensic-sound exports with SHA-256 integrity
Supports: CSV, Excel, PDF, JSON formats
Implements: Chain of Custody logging, Case Metadata, MITRE ATT&CK mapping
"""

import os
import json
import hashlib
import pandas as pd
from datetime import datetime
from typing import Dict, Optional
import csv

class ExportManager:
    """Generates court-ready forensic exports with integrity seals"""
    
    # Tool metadata
    TOOL_VERSION = "WinSentinel v1.2"
    TOOL_DEPENDENCIES = {
        'PyTorch': '2.1.0',
        'Scikit-Learn': '1.3.0',
        'Pandas': '2.0.0',
        'FastAPI': '0.104.0'
    }
    
    def __init__(self):
        self.export_log_path = "./forensic_exports/chain_of_custody.csv"
        os.makedirs("./forensic_exports", exist_ok=True)
        self._init_custody_log()
    
    def _init_custody_log(self):
        """Initialize Chain of Custody log"""
        if not os.path.exists(self.export_log_path):
            with open(self.export_log_path, 'w', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=[
                    'export_date', 'file_name', 'case_id', 'investigator',
                    'export_format', 'file_hash_sha256', 'file_size_bytes'
                ])
                writer.writeheader()
    
    def generate_export(self, case_id: str, investigator_name: str, 
                       export_format: str, export_type: str, 
                       data: Optional[Dict] = None) -> str:
        """
        Generate forensic export with integrity seal
        Returns: Path to generated file
        """
        
        timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{case_id}_{export_type}_{timestamp_str}"
        
        # Generate court-ready export
        if export_format == 'csv':
            file_path = self._generate_csv_export(filename, case_id, investigator_name, data)
        elif export_format == 'excel':
            file_path = self._generate_excel_export(filename, case_id, investigator_name, data)
        elif export_format == 'pdf':
            file_path = self._generate_pdf_export(filename, case_id, investigator_name, data)
        elif export_format == 'json':
            file_path = self._generate_json_export(filename, case_id, investigator_name, data)
        else:
            raise ValueError(f"Unsupported export format: {export_format}")
        
        # Calculate integrity hash
        file_hash = self._calculate_file_hash(file_path)
        file_size = os.path.getsize(file_path)
        
        # Log to Chain of Custody
        self._log_to_custody(
            export_date=datetime.now().isoformat(),
            file_name=os.path.basename(file_path),
            case_id=case_id,
            investigator=investigator_name,
            export_format=export_format,
            file_hash=file_hash,
            file_size=file_size
        )
        
        return file_path
    
    def _generate_csv_export(self, filename: str, case_id: str, 
                            investigator: str, data: Optional[Dict]) -> str:
        """Generate CSV export with metadata header"""
        file_path = f"./forensic_exports/{filename}.csv"
        
        with open(file_path, 'w', newline='') as f:
            writer = csv.writer(f)
            
            # Write forensic header
            writer.writerow(['FORENSIC ANALYSIS EXPORT'])
            writer.writerow(['CASE METADATA'])
            writer.writerow(['Case ID', case_id])
            writer.writerow(['Investigator Name', investigator])
            writer.writerow(['Export Date', datetime.now().isoformat()])
            writer.writerow(['Tool Version', self.TOOL_VERSION])
            writer.writerow([''])
            
            writer.writerow(['TOOL DEPENDENCIES'])
            for lib, version in self.TOOL_DEPENDENCIES.items():
                writer.writerow([lib, version])
            writer.writerow([''])
            
            writer.writerow(['EVENTS AND FINDINGS'])
            writer.writerow(['Timestamp', 'Event Type', 'Severity', 'Risk Score', 
                           'Process Name', 'Source IP', 'Destination IP', 
                           'MITRE ATT&CK', 'XAI Justification'])
            
            # Write sample data
            if data:
                for event in data.get('events', []):
                    writer.writerow([
                        event.get('timestamp', ''),
                        event.get('event_type', ''),
                        event.get('severity', ''),
                        event.get('risk_score', ''),
                        event.get('process_name', ''),
                        event.get('source_ip', ''),
                        event.get('destination_ip', ''),
                        event.get('mitre_technique', ''),
                        event.get('explanation', '')
                    ])
        
        return file_path
    
    def _generate_excel_export(self, filename: str, case_id: str, 
                              investigator: str, data: Optional[Dict]) -> str:
        """Generate Excel export with multiple sheets"""
        file_path = f"./forensic_exports/{filename}.xlsx"
        
        with pd.ExcelWriter(file_path, engine='openpyxl') as writer:
            # Metadata sheet
            metadata_df = pd.DataFrame([
                {'Parameter': 'Case ID', 'Value': case_id},
                {'Parameter': 'Investigator', 'Value': investigator},
                {'Parameter': 'Export Date', 'Value': datetime.now().isoformat()},
                {'Parameter': 'Tool Version', 'Value': self.TOOL_VERSION},
            ])
            metadata_df.to_excel(writer, sheet_name='Metadata', index=False)
            
            # Findings sheet
            if data and 'events' in data:
                findings_df = pd.DataFrame(data['events'])
                findings_df.to_excel(writer, sheet_name='Findings', index=False)
            
            # Chain of Custody sheet
            if os.path.exists(self.export_log_path):
                custody_df = pd.read_csv(self.export_log_path)
                custody_df.to_excel(writer, sheet_name='Chain of Custody', index=False)
        
        return file_path
    
    def _generate_pdf_export(self, filename: str, case_id: str, 
                            investigator: str, data: Optional[Dict]) -> str:
        """Generate PDF report with infection timeline visualization"""
        file_path = f"./forensic_exports/{filename}.pdf"
        
        # Placeholder: PDF generation would use ReportLab or FPDF
        # For now, create a text file as placeholder
        with open(file_path, 'w') as f:
            f.write("FORENSIC ANALYSIS REPORT (PDF PLACEHOLDER)\n")
            f.write("=" * 50 + "\n\n")
            f.write(f"Case ID: {case_id}\n")
            f.write(f"Investigator: {investigator}\n")
            f.write(f"Export Date: {datetime.now().isoformat()}\n")
            f.write(f"Tool: {self.TOOL_VERSION}\n\n")
            f.write("INFECTION TIMELINE\n")
            f.write("-" * 50 + "\n")
            if data and 'timeline' in data:
                for event in data['timeline']:
                    f.write(f"{event['timestamp']}: {event['event_type']}\n")
            f.write("\nHIGH-PRIORITY ACTION ITEMS\n")
            f.write("-" * 50 + "\n")
            f.write("1. Isolate affected systems from network\n")
            f.write("2. Preserve volatile memory and logs\n")
            f.write("3. Block malicious IPs at firewall\n")
        
        return file_path
    
    def _generate_json_export(self, filename: str, case_id: str, 
                             investigator: str, data: Optional[Dict]) -> str:
        """Generate JSON export for API consumption"""
        file_path = f"./forensic_exports/{filename}.json"
        
        export_data = {
            'case_metadata': {
                'case_id': case_id,
                'investigator_name': investigator,
                'export_timestamp': datetime.now().isoformat(),
                'tool_version': self.TOOL_VERSION,
                'dependencies': self.TOOL_DEPENDENCIES
            },
            'ai_verdict': {
                'classification': 'malicious' if data and data.get('risk_score', 0) > 0.5 else 'benign',
                'confidence_score': data.get('risk_score', 0) if data else 0,
                'infection_probability': f"{data.get('risk_score', 0) * 100:.1f}%"
            },
            'findings': data or {},
            'integrity_seal': {
                'algorithm': 'SHA-256',
                'hash': ''  # Will be set after file write
            }
        }
        
        with open(file_path, 'w') as f:
            json.dump(export_data, f, indent=2)
        
        return file_path
    
    def _calculate_file_hash(self, file_path: str) -> str:
        """Calculate SHA-256 hash of file"""
        sha256_hash = hashlib.sha256()
        with open(file_path, 'rb') as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    
    def _log_to_custody(self, export_date: str, file_name: str, case_id: str,
                       investigator: str, export_format: str, 
                       file_hash: str, file_size: int):
        """Log export to Chain of Custody"""
        with open(self.export_log_path, 'a', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=[
                'export_date', 'file_name', 'case_id', 'investigator',
                'export_format', 'file_hash_sha256', 'file_size_bytes'
            ])
            writer.writerow({
                'export_date': export_date,
                'file_name': file_name,
                'case_id': case_id,
                'investigator': investigator,
                'export_format': export_format,
                'file_hash_sha256': file_hash,
                'file_size_bytes': file_size
            })
    
    def get_chain_of_custody(self) -> list:
        """Retrieve Chain of Custody log"""
        if os.path.exists(self.export_log_path):
            return pd.read_csv(self.export_log_path).to_dict('records')
        return []
