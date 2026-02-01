"""
Scrapers package initialization
Windows-specific scrapers are optional (graceful fallback)
"""

try:
    from .process_scraper import ProcessScraper
except ImportError:
    ProcessScraper = None

try:
    from .registry_scraper import RegistryScraper
except ImportError:
    RegistryScraper = None

try:
    from .network_scraper import NetworkScraper
except ImportError:
    NetworkScraper = None

try:
    from .event_log_scraper import EventLogScraper
except ImportError:
    EventLogScraper = None

__all__ = [
    'ProcessScraper',
    'RegistryScraper',
    'NetworkScraper',
    'EventLogScraper'
]
