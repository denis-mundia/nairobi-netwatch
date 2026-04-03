export type NetworkStatus = 'online' | 'offline' | 'warning' | 'degraded';

export type UserRole = 'admin' | 'engineer' | 'auditor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  lastLogin: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
  target?: string;
  details?: string;
}

export interface DeviceService {
  name: 'HTTP' | 'HTTPS' | 'DNS' | 'SSH' | 'FTP' | 'TELNET';
  port: number;
  status: 'up' | 'down';
  responseTime: number;
}

export interface SecurityCheckResult {
  id: string;
  name: 'Open Ports' | 'Default Password' | 'Software Version' | 'Firewall Config' | 'Encryption';
  status: 'pass' | 'fail' | 'warning';
  details: string;
  recommendation: string;
}

export interface NetworkInterface {
  id: string;
  name: string;
  status: 'up' | 'down';
  utilization: number; // percentage
  speed: string;
  inOctets: number;
  outOctets: number;
}

export interface Device {
  id: string;
  name: string;
  type: 'router' | 'switch' | 'server' | 'access-point' | 'workstation';
  ip: string;
  location: string;
  status: NetworkStatus;
  uptime: string;
  lastChecked: string;
  snmpEnabled?: boolean;
  snmpConfig?: {
    version: 'v1' | 'v2c' | 'v3';
    community?: string;
    v3Auth?: {
      username: string;
      authProtocol: 'MD5' | 'SHA';
      authKey: string;
      privProtocol: 'DES' | 'AES';
      privKey: string;
    };
  };
  responseTime: number; // ms
  latencyHistory: { timestamp: string; value: number }[];
  services: DeviceService[];
  securityScore: number; // 0-100
  securityChecks: SecurityCheckResult[];
  osVersion: string;
  isOutdated: boolean;
  cpuUsage: number;
  memoryUsage: number;
  interfaces: NetworkInterface[];
}

export interface SNMPMetric {
  deviceId: string;
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  inTraffic: number;
  outTraffic: number;
  interfaceStats: {
    name: string;
    inOctets: number;
    outOctets: number;
    status: 'up' | 'down';
    utilization: number;
  }[];
}

export interface ComplianceItem {
  id: string;
  category: 'Access Control' | 'Network Security' | 'Data Protection' | 'Software Maintenance';
  requirement: string;
  status: 'compliant' | 'non-compliant' | 'in-progress';
  lastAudit: string;
  owner: string;
  score: number;
}

export interface Alert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  source: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface HistoricalTrend {
  timestamp: string;
  uptime: number;
  avgResponseTime: number;
  securityScore: number;
  traffic: number;
  peakUsage: number;
}

export interface SLAReport {
  deviceId: string;
  deviceName: string;
  period: '7d' | '30d';
  uptimePercentage: number;
  totalDowntime: string;
  slaTarget: number;
  isCompliant: boolean;
}

export interface SystemStats {
  totalDevices: number;
  onlineDevices: number;
  criticalAlerts: number;
  avgSecurityScore: number;
  uptime: string;
  uptimeTrends: { timestamp: string; value: number }[];
  responseTimeTrends: { timestamp: string; value: number }[];
  securityScoreTrends: { timestamp: string; value: number }[];
}

export interface TopologyNode {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  status: NetworkStatus;
}

export interface TopologyLink {
  from: string;
  to: string;
}

export interface TopologyData {
  nodes: TopologyNode[];
  links: TopologyLink[];
}