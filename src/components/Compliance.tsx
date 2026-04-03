import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldQuestion, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Search, 
  Filter, 
  Download, 
  ExternalLink, 
  Clock, 
  ArrowRight,
  Shield,
  Lock,
  Zap,
  Fingerprint,
  RefreshCw,
  Server,
  Activity,
  Eye,
  FileText,
  ShieldOff,
  AlertCircle,
  Database
} from 'lucide-react';
import { cn, getStatusColor, formatTimestamp, exportToCSV } from '../lib/utils';
import { snmpService } from '../services/snmpService';
import { ComplianceItem, Device, SecurityCheckResult } from '../types';
import { toast } from 'sonner';

const Compliance: React.FC = () => {
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'standards' | 'vulnerabilities' | 'devices'>('standards');
  const [scanning, setScanning] = useState(false);

  const fetchData = async () => {
    try {
      const [items, devList] = await Promise.all([
        snmpService.getComplianceItems(),
        snmpService.getDevices()
      ]);
      setComplianceItems(items);
      setDevices(devList);
    } catch (error) {
      toast.error('Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const runFullScan = async () => {
    setScanning(true);
    toast.loading('Initializing system-wide audit scan...', { duration: 3000 });
    
    try {
      // If inventory is empty, trigger discovery first
      if (devices.length === 0) {
        await snmpService.discoverDevices('192.168.1.0/24');
      }
      await fetchData();
      toast.success('Audit complete. System compliance status updated.');
    } catch (err) {
      toast.error('Audit failed');
    } finally {
      setScanning(false);
    }
  };

  const handleExport = () => {
    if (complianceItems.length === 0) {
      toast.error('No compliance data available for export');
      return;
    }
    const data = complianceItems.map(item => ({
      Category: item.category,
      Requirement: item.requirement,
      Status: item.status,
      Score: item.score,
      'Last Audit': item.lastAudit,
      Owner: item.owner
    }));
    exportToCSV(data, 'compliance_report');
    toast.success('Compliance report exported as CSV');
  };

  const getComplianceStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'compliant': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'non-compliant': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'in-progress': return <Clock className="w-5 h-5 text-amber-500" />;
      default: return <ShieldQuestion className="w-5 h-5 text-slate-400" />;
    }
  };

  const overallScore = complianceItems.length > 0 
    ? Math.round(complianceItems.reduce((acc, curr) => acc + curr.score, 0) / (complianceItems.length || 1))
    : 0;

  if (!loading && devices.length === 0) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Compliance & Security</h1>
            <p className="text-slate-500 mt-1 font-medium">Governance, Risk, and Compliance Management</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-20 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <Shield className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">System Not Audited</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2 mb-8">
            No compliance data or security checks have been performed. 
            Run a system-wide security scan to collect compliance metrics.
          </p>
          <button 
            onClick={runFullScan}
            disabled={scanning}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            <RefreshCw className={cn("w-5 h-5", scanning && "animate-spin")} />
            {scanning ? 'Initializing Scan...' : 'Run Security Scan'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Compliance & Security</h1>
          <p className="text-slate-500 mt-1 font-medium flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-500" />
            Governance, Risk, and Compliance Management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export Audit
          </button>
          <button 
            onClick={runFullScan}
            disabled={scanning}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-200",
              scanning && "opacity-80 cursor-not-allowed"
            )}
          >
            <RefreshCw className={cn("w-4 h-4", scanning && "animate-spin")} />
            {scanning ? 'Scanning...' : 'Run Security Scan'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-[0.05] group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-24 h-24 text-blue-600" />
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Overall Compliance Score</p>
          <div className="flex items-end gap-3">
            <h2 className="text-5xl font-extrabold text-slate-900 tracking-tight">{overallScore}%</h2>
          </div>
          <div className="mt-6 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-1000"
              style={{ width: `${overallScore}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Security Posture Summary</p>
          <div className="space-y-4">
            {complianceItems.length > 0 ? complianceItems.map(item => (
              <div key={item.id} className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600 truncate max-w-[180px]">{item.requirement}</span>
                <span className={cn(
                  "text-sm font-bold",
                  item.status === 'compliant' ? "text-green-600" : "text-amber-600"
                )}>
                  {item.status === 'compliant' ? 'Met' : 'In Review'}
                </span>
              </div>
            )) : (
              <p className="text-slate-400 text-sm italic">No posture data available</p>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Audit Frequency</p>
            <h3 className="text-xl font-extrabold text-slate-900">Real-Time Monitoring</h3>
            <p className="text-xs text-slate-400 mt-1">Continuous automated infrastructure review</p>
          </div>
          <button className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline mt-4">
            View Audit History <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 px-8">
          <button 
            onClick={() => setActiveTab('standards')}
            className={cn(
              "py-4 px-6 text-sm font-bold transition-all relative",
              activeTab === 'standards' ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
            )}
          >
            ICT Security Policies
            {activeTab === 'standards' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('vulnerabilities')}
            className={cn(
              "py-4 px-6 text-sm font-bold transition-all relative",
              activeTab === 'vulnerabilities' ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Vulnerability Scanner
            {activeTab === 'vulnerabilities' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('devices')}
            className={cn(
              "py-4 px-6 text-sm font-bold transition-all relative",
              activeTab === 'devices' ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Device Compliance
            {activeTab === 'devices' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>}
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'standards' && (
            <div className="space-y-6">
              {complianceItems.length > 0 ? complianceItems.map((item) => (
                <div key={item.id} className="p-6 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all group bg-slate-50/50">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "p-3 rounded-xl",
                        item.status === 'compliant' ? "bg-green-100 text-green-600" :
                        item.status === 'non-compliant' ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                      )}>
                        {getComplianceStatusIcon(item.status)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-white border border-slate-200 text-slate-400 rounded-full">{item.category}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Audit: {item.lastAudit}</span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900">{item.requirement}</h4>
                        <p className="text-sm text-slate-500 mt-1">Responsible: {item.owner}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900">{item.score}/100</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Policy Index</div>
                      </div>
                      <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                        <ExternalLink className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 text-slate-400">No policy data collected</div>
              )}
            </div>
          )}

          {activeTab === 'vulnerabilities' && (
            <div className="space-y-8">
               <div className="grid grid-cols-1 gap-4">
                {devices.some(d => d.isOutdated) ? devices.filter(d => d.isOutdated).map((device) => (
                  <div key={device.id} className="p-6 rounded-3xl border border-slate-100 bg-white hover:shadow-xl transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 rounded text-[10px] font-black uppercase bg-amber-100 text-amber-600">Medium Priority</span>
                        <span className="text-xs font-bold text-slate-400">CVE-SYSTEM-DETECTED</span>
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">Outdated OS Software Detected</h4>
                    <p className="text-sm text-slate-500 mt-1">Found on <span className="font-bold text-slate-700">{device.name}</span></p>
                    <p className="text-sm text-slate-600 mt-3">Running version {device.osVersion}. Security updates may be missing.</p>
                  </div>
                )) : (
                  <div className="p-20 bg-emerald-50/50 rounded-3xl border border-dashed border-emerald-200 text-center">
                    <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-slate-900">No Vulnerabilities Identified</h4>
                    <p className="text-sm text-slate-500">System health check passed all security protocols.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'devices' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {devices.map((device) => (
                  <div key={device.id} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                          <Server className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{device.name}</h4>
                          <p className="text-xs font-mono text-slate-500">{device.ip}</p>
                        </div>
                      </div>
                      <div className={cn(
                        "w-12 h-12 rounded-full border-4 flex items-center justify-center text-xs font-black",
                        device.securityScore >= 80 ? "border-green-100 text-green-600" : 
                        device.securityScore >= 60 ? "border-amber-100 text-amber-600" : "border-red-100 text-red-600"
                      )}>
                        {device.securityScore}%
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Check Results</h5>
                      {device.securityChecks.map((check) => (
                        <div key={check.id} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-50 shadow-sm">
                          <div className={cn(
                            "mt-0.5",
                            check.status === 'pass' ? "text-green-500" : 
                            check.status === 'fail' ? "text-red-500" : "text-amber-500"
                          )}>
                            {check.status === 'pass' ? <CheckCircle2 className="w-4 h-4" /> : 
                             check.status === 'fail' ? <XCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-0.5">
                              <p className="text-xs font-bold text-slate-900">{check.name}</p>
                              <span className={cn(
                                "text-[9px] font-bold uppercase",
                                check.status === 'pass' ? "text-green-600" : 
                                check.status === 'fail' ? "text-red-600" : "text-amber-600"
                              )}>{check.status}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{check.details}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Compliance;