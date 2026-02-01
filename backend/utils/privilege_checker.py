"""
Privilege Checker: Verify and handle admin privileges for forensic scraping
Provides graceful error handling and instructions for UAC elevation
"""

import os
import ctypes
import logging
from typing import Dict, Tuple
from datetime import datetime

# Configure logging for privilege checks
logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

def is_admin() -> bool:
    """Check if the current process has admin privileges"""
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except:
        return False

def get_privilege_status() -> Dict:
    """Return detailed privilege status and instructions"""
    admin = is_admin()
    
    status = {
        "has_admin": admin,
        "message": "Admin privileges detected - Full scraping enabled" if admin else "Admin privileges required - Limited functionality",
        "details": {
            "current_user": os.getenv('USERNAME', 'Unknown'),
            "admin_required": True,
            "elevation_method": "UAC (User Account Control)" if os.name == 'nt' else "sudo"
        },
        "instructions": (
            "Your WinSentinel is running without admin privileges.\n"
            "To enable full forensic scraping capabilities:\n\n"
            "1. Close all WinSentinel windows\n"
            "2. Right-click on Command Prompt/PowerShell\n"
            "3. Select 'Run as Administrator'\n"
            "4. Navigate to the backend folder:\n"
            "   cd C:\\Users\\dines\\OneDrive\\Desktop\\foren\\backend\n"
            "5. Start the server:\n"
            "   python main.py\n\n"
            "Then refresh your browser and try Live Scraping again."
        ) if not admin else None
    }
    
    # Log all parameters when admin privilege is detected
    if admin:
        logger.info("=" * 60)
        logger.info("ADMIN PRIVILEGE DETECTED - LOGGING ALL PARAMETERS")
        logger.info("=" * 60)
        logger.info(f"Timestamp: {datetime.now().isoformat()}")
        logger.info(f"Current User: {status['details']['current_user']}")
        logger.info(f"Admin Status: {status['has_admin']}")
        logger.info(f"Admin Required: {status['details']['admin_required']}")
        logger.info(f"Elevation Method: {status['details']['elevation_method']}")
        logger.info(f"Operating System: {os.name}")
        logger.info(f"Platform: {os.sys.platform if hasattr(os, 'sys') else 'windows'}")
        logger.info(f"Working Directory: {os.getcwd()}")
        logger.info(f"Python Version: {__import__('sys').version}")
        logger.info(f"Privileges Message: {status['message']}")
        logger.info("=" * 60)
    
    return status

def check_scraping_permission(scrape_type: str) -> Tuple[bool, str]:
    """
    Check if specific scraping is allowed
    Returns: (allowed: bool, message: str)
    """
    admin = is_admin()
    
    permissions = {
        'event_logs': True, # Try best effort
        'registry': True,   # Try best effort
        'network': True,    # Try best effort
        'processes': True,
        'disks': True
    }
    
    allowed = permissions.get(scrape_type, False)
    
    # Log parameters when admin permission is granted
    if admin and allowed:
        logger.info("=" * 60)
        logger.info(f"SCRAPING PERMISSION GRANTED WITH ADMIN PRIVILEGE")
        logger.info("=" * 60)
        logger.info(f"Scrape Type Requested: {scrape_type.replace('_', ' ').title()}")
        logger.info(f"Current User: {os.getenv('USERNAME', 'Unknown')}")
        logger.info(f"Admin Status: {admin}")
        logger.info(f"Permission Granted: {allowed}")
        logger.info(f"Timestamp: {datetime.now().isoformat()}")
        logger.info(f"Working Directory: {os.getcwd()}")
        logger.info("=" * 60)
    
    if not allowed:
        return False, f"{scrape_type.replace('_', ' ').title()} scraping requires admin privileges"
    
    return True, f"{scrape_type.replace('_', ' ').title()} scraping enabled"

