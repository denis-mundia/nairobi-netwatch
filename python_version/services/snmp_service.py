import random
from datetime import datetime, timedelta

class SNMPService:
    """
    Python equivalent of snmpService.ts
    Handles data collection and system state.
    """
    
    def __init__(self):
        self.polling_interval = 5  # seconds
        self.collected_devices = []
        self.collected_alerts = []
        
    def get_system_stats(self):
        """Returns aggregate system metrics."""
        if not self.collected_devices:
            return {
                "total_devices": 0,
                "online_devices": 0,
                "critical_alerts": 0,
                "avg_security_score": 0,
                "uptime": "0%",
                "trends": {"active_devices": 0, "uptime": 0, "compliance_score": 0, "security_threats": 0}
            }

        return {
            "total_devices": len(self.collected_devices),
            "online_devices": len([d for d in self.collected_devices if d['status'] == 'online']),
            "critical_alerts": len(self.collected_alerts),
            "avg_security_score": 88,
            "uptime": "99.9%",
            "trends": {"active_devices": 0, "uptime": 0, "compliance_score": 0, "security_threats": 0}
        }

    def get_devices(self):
        """Returns list of all monitored devices."""
        return self.collected_devices

    def get_alerts(self):
        """Returns recent security and system alerts."""
        return self.collected_alerts

    def discover(self):
        """Simulates discovery of devices."""
        self.collected_devices = [
            {
                "id": "dev-1",
                "name": "Core Router 01",
                "type": "router",
                "ip": "192.168.1.1",
                "status": "online",
                "uptime": "45d 12h",
                "cpu": 14,
                "memory": 32,
                "security_score": 92
            }
        ]
        return self.collected_devices

# Singleton instance
snmp_service = SNMPService()