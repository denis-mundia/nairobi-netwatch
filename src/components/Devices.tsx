import React, { useState, useEffect, useMemo } from 'react';
import { 
  Server, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Wifi, 
  WifiOff, 
  Clock, 
  Activity, 
  Database, 
  Monitor, 
  Cpu, 
  ChevronRight, 
  RefreshCw,
  Zap,
  ShieldCheck,
  ExternalLink,
  ShieldAlert,
  Globe,
  Settings2,
  Lock,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { cn, getStatusColor, formatTimestamp } from '../lib/utils';
import { snmpService } from '../services/snmpService';
import { Device, DeviceService, NetworkInterface } from '../types';
import { toast } from 'sonner';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

const Devices: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const data = await snmpService.getDevices();
      setDevices(data);
    } catch (error) {
      toast.error('Failed to load device inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
    const interval = setInterval(async () => {
      const data = await snmpService.getDevices();
      setDevices(data);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleDiscover = async () => {
    setIsDiscovering(true);
    toast.promise(snmpService.discoverDevices('192.168.1.0/24'), {
      loading: 'Scanning network for new devices...',
      success: (newDevices) => {
        setDevices(prev => [...prev, ...newDevices.filter(nd => !prev.find(pd => pd.id === nd.id))]);
        setIsDiscovering(false);
        return 'Network scan complete. New devices discovered.';
      },
      error: () => {
        setIsDiscovering(false);
        return 'Network discovery failed.';
      }
    });
  };

  const filteredDevices = useMemo(() => {
    return devices.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.ip.includes(searchQuery);
      const matchesFilter = filterType === 'all' || d.type === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [devices, searchQuery, filterType]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Network Inventory</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage and monitor all connected infrastructure</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDiscover}
            disabled={isDiscovering}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm",
              isDiscovering ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            )}
          >
            <RefreshCw className={cn("w-4 h-4", isDiscovering && "animate-spin")} />
            {isDiscovering ? 'Scanning...' : 'Network Discovery'}
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-200">
            <Plus className="w-4 h-4" />
            Add Device
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Device List Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4 sticky top-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name or IP..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>
            
            <div className="space-y-1">
              {['all', 'router', 'switch', 'server'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold capitalize transition-colors",
                    filterType === type ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {type === 'all' ? <Activity className="w-4 h-4" /> : 
                     type === 'router' ? <Zap className="w-4 h-4" /> :
                     type === 'switch' ? <Monitor className="w-4 h-4" /> : <Database className="w-4 h-4" />}
                    {type}
                  </div>
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded font-bold",
                    filterType === type ? "bg-blue-100" : "bg-slate-100"
                  )}>
                    {type === 'all' ? devices.length : devices.filter(d => d.type === type).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Device Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500 font-medium">Synchronizing inventory...</p>
            </div>
          ) : filteredDevices.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-slate-50 rounded-full mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No devices found</h3>
              <p className="text-slate-500 max-w-xs mt-1">Try adjusting your filters or run a network scan to discover new assets.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDevices.map((device) => (
                <div 
                  key={device.id} 
                  onClick={() => setSelectedDevice(device)}
                  className={cn(
                    "bg-white p-5 rounded-3xl border transition-all cursor-pointer group relative overflow-hidden",
                    selectedDevice?.id === device.id ? "border-blue-500 ring-2 ring-blue-500/10 shadow-lg shadow-blue-100" : "border-slate-200 hover:border-slate-300 shadow-sm"
                  )}
                >
                  {/* Status Indicator Bar */}
                  <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-1.5",
                    device.status === 'online' ? "bg-green-500" : 
                    device.status === 'warning' ? "bg-amber-500" : "bg-red-500"
                  )}></div>

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2.5 rounded-2xl",
                        device.type === 'router' ? "bg-blue-50 text-blue-600" :
                        device.type === 'switch' ? "bg-indigo-50 text-indigo-600" : "bg-purple-50 text-purple-600"
                      )}>
                        {device.type === 'router' ? <Zap className="w-5 h-5" /> : 
                         device.type === 'switch' ? <Monitor className="w-5 h-5" /> : <Database className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{device.name}</h4>
                        <p className="text-xs font-mono text-slate-500">{device.ip}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
                      getStatusColor(device.status)
                    )}>
                      {device.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-slate-50 p-2 rounded-xl text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">CPU</p>
                      <p className="text-xs font-bold text-slate-700">{device.cpuUsage}%</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Ping</p>
                      <p className="text-xs font-bold text-slate-700">{device.responseTime}ms</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Security</p>
                      <p className={cn(
                        "text-xs font-bold",
                        device.securityScore > 80 ? "text-green-600" : device.securityScore > 60 ? "text-amber-600" : "text-red-600"
                      )}>{device.securityScore}%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                      <Clock className="w-3 h-3" />
                      UP: {device.uptime}
                    </div>
                    <ChevronRight className={cn(
                      "w-4 h-4 text-slate-300 transition-transform",
                      selectedDevice?.id === device.id ? "rotate-90 text-blue-500" : "group-hover:translate-x-1"
                    )} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Device Detail Overlay/Panel */}
          {selectedDevice && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <Server className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">{selectedDevice.name}</h2>
                    <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      {selectedDevice.location} • {selectedDevice.ip}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                    <Settings2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => setSelectedDevice(null)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                    <Plus className="w-5 h-5 rotate-45" />
                  </button>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Left Column: Metrics & Services */}
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Health Monitoring</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-semibold text-slate-700">Ping Stability</span>
                          </div>
                          <span className="text-sm font-bold text-green-600">Stable</span>
                        </div>
                        <div className="h-16 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={selectedDevice.latencyHistory}>
                              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
                              <Tooltip />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Critical Services</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedDevice.services.map((service, i) => (
                          <div key={i} className="p-3 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-slate-400">{service.port}</span>
                              <span className="text-xs font-bold text-slate-700">{service.name}</span>
                            </div>
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              service.status === 'up' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-red-500"
                            )}></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Center Column: SNMP & Interfaces */}
                  <div className="md:col-span-2 space-y-8">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Interface Status</h3>
                        <span className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">View All Ports</span>
                      </div>
                      <div className="overflow-hidden border border-slate-100 rounded-2xl">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Interface</th>
                              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Status</th>
                              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Speed</th>
                              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Utilization</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {selectedDevice.interfaces.map((int) => (
                              <tr key={int.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-3 text-sm font-bold text-slate-700">{int.name}</td>
                                <td className="px-4 py-3">
                                  <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                                    int.status === 'up' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                  )}>{int.status}</span>
                                </td>
                                <td className="px-4 py-3 text-xs font-medium text-slate-500">{int.speed}</td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[60px]">
                                      <div 
                                        className={cn(
                                          "h-full rounded-full transition-all duration-1000",
                                          int.utilization > 80 ? "bg-red-500" : int.utilization > 50 ? "bg-amber-500" : "bg-blue-500"
                                        )}
                                        style={{ width: `${int.utilization}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-700">{int.utilization}%</span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-5 rounded-3xl border border-slate-100 bg-slate-50 space-y-3">
                        <div className="flex items-center gap-3 text-slate-500">
                          <ShieldCheck className="w-5 h-5 text-blue-600" />
                          <h4 className="text-sm font-bold uppercase tracking-wider">Security Score</h4>
                        </div>
                        <div className="flex items-end gap-2">
                          <span className="text-3xl font-extrabold text-slate-900">{selectedDevice.securityScore}%</span>
                          <span className="text-xs font-bold text-green-600 mb-1 flex items-center gap-0.5">
                            <TrendingUp className="w-3 h-3" /> +2.4%
                          </span>
                        </div>
                        <button className="w-full py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                          Run Security Scan
                        </button>
                      </div>

                      <div className="p-5 rounded-3xl border border-slate-100 bg-slate-50 space-y-3">
                        <div className="flex items-center gap-3 text-slate-500">
                          <Cpu className="w-5 h-5 text-indigo-600" />
                          <h4 className="text-sm font-bold uppercase tracking-wider">Hardware Info</h4>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-900">OS: {selectedDevice.osVersion}</p>
                          <p className={cn(
                            "text-[10px] font-bold uppercase",
                            selectedDevice.isOutdated ? "text-amber-600" : "text-green-600"
                          )}>
                            {selectedDevice.isOutdated ? 'Update Recommended' : 'System Up-to-date'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 w-[64%]"></div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">RAM: 64%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Devices;