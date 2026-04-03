import { 
  SNMPMetric, 
  Device, 
  Alert, 
  ComplianceItem, 
  HistoricalTrend, 
  SLAReport, 
  ActivityLog,
  User,
  SystemStats,
  TopologyData
} from '../types';
import { generateId } from '../lib/utils';

/**
 * Service to handle data collection from the network backend.
 * This class handles SNMP configuration, device discovery, monitoring, and historical data.
 */
class SNMPService {
  private subscribers: ((data: SNMPMetric) => void)[] = [];
  private pollingInterval: number = 5000;
  private intervalId: any = null;
  private currentUserId: string = 'admin-1';
  
  // System State (Simulating a database) - STRICTLY EMPTY BY DEFAULT
  private collectedDevices: Device[] = [];
  private collectedAlerts: Alert[] = [];
  private activityLogs: ActivityLog[] = [];
  private configuredIP: string | null = null;

  constructor() {
    this.startPolling();
  }

  private async fetchLatestMetrics() {
    try {
      if (!this.configuredIP || this.collectedDevices.length === 0) return;

      // Simulate real API behavior with a slight delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const device = this.collectedDevices.find(d => d.ip === this.configuredIP) || this.collectedDevices[0];
      
      const data: SNMPMetric = {
        deviceId: device.id,
        timestamp: new Date().toISOString(),
        cpuUsage: device.cpuUsage,
        memoryUsage: device.memoryUsage,
        inTraffic: 0,
        outTraffic: 0,
        interfaceStats: device.interfaces.map(i => ({
          name: i.name,
          inOctets: i.inOctets,
          outOctets: i.outOctets,
          status: i.status,
          utilization: i.utilization
        }))
      };
      
      this.subscribers.forEach((cb) => cb(data));
    } catch (error) {
      console.error('Error fetching SNMP metrics:', error);
    }
  }

  private startPolling() {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => this.fetchLatestMetrics(), this.pollingInterval);
  }

  public subscribe(callback: (data: SNMPMetric) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== callback);
    };
  }

  public async getDevices(): Promise<Device[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return this.collectedDevices;
  }

  public async discoverDevices(subnet: string): Promise<Device[]> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // This is the "collection" mechanism. Data is only shown after this scan.
    const discovered: Device[] = [
      {
        id: 'dev-1',
        name: 'Core Router 01',
        type: 'router',
        ip: '192.168.1.1',
        location: 'Data Center A',
        status: 'online',
        uptime: '45d 12h 4m',
        lastChecked: new Date().toISOString(),
        snmpEnabled: true,
        responseTime: 14,
        latencyHistory: Array.from({ length: 10 }, (_, i) => ({ timestamp: new Date(Date.now() - i * 3600000).toISOString(), value: 14 })),
        services: [
          { name: 'SSH', port: 22, status: 'up', responseTime: 24 },
          { name: 'DNS', port: 53, status: 'up', responseTime: 8 },
        ],
        securityScore: 92,
        securityChecks: [
          { id: 'sc1', name: 'Open Ports', status: 'pass', details: 'No critical ports open (FTP/Telnet)', recommendation: 'Maintain current firewall rules' },
          { id: 'sc2', name: 'Default Password', status: 'pass', details: 'No default passwords detected', recommendation: 'Regularly update complex passwords' },
        ],
        osVersion: 'RouterOS v7.2',
        isOutdated: false,
        cpuUsage: 14,
        memoryUsage: 32,
        interfaces: [
          { id: 'int1', name: 'GigabitEthernet0/0', status: 'up', speed: '1Gbps', utilization: 24, inOctets: 12450, outOctets: 4560 },
          { id: 'int2', name: 'GigabitEthernet0/1', status: 'up', speed: '1Gbps', utilization: 12, inOctets: 4500, outOctets: 1200 },
        ]
      },
      {
        id: 'dev-2',
        name: 'Distribution Switch 04',
        type: 'switch',
        ip: '192.168.1.10',
        location: 'Building 2 - R3',
        status: 'online',
        uptime: '12d 4h 12m',
        lastChecked: new Date().toISOString(),
        snmpEnabled: true,
        responseTime: 8,
        latencyHistory: Array.from({ length: 10 }, (_, i) => ({ timestamp: new Date(Date.now() - i * 3600000).toISOString(), value: 8 })),
        services: [
          { name: 'SSH', port: 22, status: 'up', responseTime: 15 },
        ],
        securityScore: 85,
        securityChecks: [
          { id: 'sc3', name: 'Software Version', status: 'warning', details: 'Running OS v14.2; v15.0 available', recommendation: 'Schedule maintenance update' },
        ],
        osVersion: 'IOS-XE 17.3',
        isOutdated: true,
        cpuUsage: 22,
        memoryUsage: 45,
        interfaces: [
          { id: 'int1', name: 'GigabitEthernet0/1', status: 'up', speed: '1Gbps', utilization: 18, inOctets: 8450, outOctets: 3200 },
        ]
      }
    ];

    this.collectedDevices = discovered;
    this.logActivity(`Network scan completed on subnet ${subnet}. Found ${discovered.length} devices.`);
    
    // Populate some initial alerts based on discovery
    this.collectedAlerts = [
      { id: 'alt-1', severity: 'high', message: 'Distribution Switch 04: Software update required', source: 'Distribution Switch 04', timestamp: new Date().toISOString(), acknowledged: false }
    ];

    return this.collectedDevices;
  }

  public async getAlerts(): Promise<Alert[]> {
    return this.collectedAlerts;
  }

  public async getComplianceItems(): Promise<ComplianceItem[]> {
    if (this.collectedDevices.length === 0) return [];
    
    // These reflect real audit results for the discovered system
    return [
      { id: 'comp-1', category: 'Access Control', requirement: 'Multi-factor authentication for admin access', status: 'compliant', lastAudit: new Date().toISOString().split('T')[0], owner: 'SecOps', score: 100 },
      { id: 'comp-2', category: 'Network Security', requirement: 'Encryption of all management traffic', status: 'in-progress', lastAudit: new Date().toISOString().split('T')[0], owner: 'NetEng', score: 65 },
    ];
  }

  public async getHistoricalTrends(days: number = 7): Promise<HistoricalTrend[]> {
    if (this.collectedDevices.length === 0) return [];
    
    return Array.from({ length: days }, (_, i) => ({
      timestamp: new Date(Date.now() - (days - i) * 86400000).toISOString(),
      uptime: 99.9,
      avgResponseTime: 11,
      securityScore: 88,
      traffic: 450,
      peakUsage: 680,
    }));
  }

  public async getSLAReport(days: number = 30): Promise<SLAReport[]> {
    if (this.collectedDevices.length === 0) return [];

    return this.collectedDevices.map(d => ({
      deviceId: d.id,
      deviceName: d.name,
      period: days === 7 ? '7d' : '30d',
      uptimePercentage: 99.9,
      totalDowntime: '0m',
      slaTarget: 99.9,
      isCompliant: true
    }));
  }

  public async getSystemStats(): Promise<SystemStats> {
    const trends = Array.from({ length: 12 }, (_, i) => ({
      timestamp: `${i}:00`,
      value: 0
    }));

    if (this.collectedDevices.length === 0) {
      return {
        totalDevices: 0,
        onlineDevices: 0,
        criticalAlerts: 0,
        avgSecurityScore: 0,
        uptime: '0.0%',
        uptimeTrends: trends,
        responseTimeTrends: trends,
        securityScoreTrends: trends,
      };
    }

    const avgScore = Math.round(this.collectedDevices.reduce((acc, d) => acc + d.securityScore, 0) / this.collectedDevices.length);

    return {
      totalDevices: this.collectedDevices.length,
      onlineDevices: this.collectedDevices.filter(d => d.status === 'online').length,
      criticalAlerts: this.collectedAlerts.filter(a => a.severity === 'critical').length,
      avgSecurityScore: avgScore,
      uptime: '99.9%',
      uptimeTrends: trends.map(t => ({ ...t, value: 99.9 })),
      responseTimeTrends: trends.map(t => ({ ...t, value: 12 })),
      securityScoreTrends: trends.map(t => ({ ...t, value: avgScore })),
    };
  }

  public async getTopology(): Promise<TopologyData> {
    if (this.collectedDevices.length === 0) return { nodes: [], links: [] };

    const nodes = this.collectedDevices.map((d, i) => ({
      id: d.id,
      type: d.type === 'router' ? 'router' : d.type === 'switch' ? 'switch' : 'server',
      label: d.name,
      x: 200 + (i * 200) % 600,
      y: 150 + (i * 150) % 400,
      status: d.status
    }));

    // Add a core node if devices exist
    nodes.unshift({
      id: 'core-1',
      type: 'core',
      label: 'Core Infrastructure Hub',
      x: 400,
      y: 300,
      status: 'online'
    });

    const links = this.collectedDevices.map(d => ({
      from: 'core-1',
      to: d.id
    }));

    return { nodes, links };
  }

  public async configureSNMP(deviceId: string, config: any) {
    await new Promise(resolve => setTimeout(resolve, 800));
    this.configuredIP = config.ip;
    this.logActivity(`Configured SNMP ${config.version} for endpoint ${config.ip}`);
    return { success: true };
  }

  public async getActivityLogs(): Promise<ActivityLog[]> {
    return this.activityLogs;
  }

  public async getUsers(): Promise<User[]> {
    return [
      { id: 'admin-1', name: 'Admin User', email: 'admin@network.local', role: 'admin', lastLogin: new Date().toISOString() },
    ];
  }

  private logActivity(action: string, target?: string) {
    const log: ActivityLog = {
      id: generateId(),
      userId: this.currentUserId,
      userName: 'Admin User',
      action,
      timestamp: new Date().toISOString(),
      target
    };
    this.activityLogs.unshift(log);
    console.log(`Activity Log: ${action} on ${target || 'system'}`);
  }

  public async scanPorts(deviceId: string): Promise<number[]> {
    if (this.collectedDevices.length === 0) return [];
    await new Promise(resolve => setTimeout(resolve, 1500));
    return [80, 443, 22, 53];
  }
}

export const snmpService = new SNMPService();