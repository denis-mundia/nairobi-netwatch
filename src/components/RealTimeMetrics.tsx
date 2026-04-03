import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  Database, 
  ArrowDown, 
  ArrowUp, 
  Settings2,
  Play,
  Pause,
  RefreshCw,
  Loader2,
  Signal,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { snmpService } from '../services/snmpService';
import { SNMPMetric } from '../types';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

const MetricCard = ({ title, value, unit, icon: Icon, color, history }: { 
  title: string; 
  value: number; 
  unit: string; 
  icon: any; 
  color: string;
  history: any[];
}) => (
  <motion.div 
    layout
    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 hover:shadow-md transition-all group"
  >
    <div className="flex items-center justify-between">
      <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110", color)}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="text-right">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <h3 className="text-xl font-black text-slate-900">{value}{unit}</h3>
      </div>
    </div>
    
    <div className="h-[60px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={history}>
          <defs>
            <linearGradient id={`color-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color.includes('blue') ? '#2563eb' : color.includes('emerald') ? '#10b981' : color.includes('indigo') ? '#4f46e5' : '#f97316'} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color.includes('blue') ? '#2563eb' : color.includes('emerald') ? '#10b981' : color.includes('indigo') ? '#4f46e5' : '#f97316'} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={color.includes('blue') ? '#2563eb' : color.includes('emerald') ? '#10b981' : color.includes('indigo') ? '#4f46e5' : '#f97316'} 
            fillOpacity={1} 
            fill={`url(#color-${title})`} 
            isAnimationActive={false}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);

export const RealTimeMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<SNMPMetric | null>(null);
  const [history, setHistory] = useState<{
    cpu: { value: number; time: string }[];
    memory: { value: number; time: string }[];
    traffic: { in: number; out: number; time: string }[];
  }>({ cpu: [], memory: [], traffic: [] });
  const [isLive, setIsLive] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [config, setConfig] = useState({ ip: '', community: 'public', version: 'v2c' });

  useEffect(() => {
    if (!isLive || !config.ip) return;

    const unsubscribe = snmpService.subscribe((newMetric) => {
      setMetrics(newMetric);
      setHistory(prev => {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const cpu = [...prev.cpu, { value: newMetric.cpuUsage, time }].slice(-20);
        const memory = [...prev.memory, { value: newMetric.memoryUsage, time }].slice(-20);
        const traffic = [...prev.traffic, { in: newMetric.inTraffic, out: newMetric.outTraffic, time }].slice(-20);
        return { cpu, memory, traffic };
      });
    });

    return () => unsubscribe();
  }, [isLive, config.ip]);

  const handleConfigure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.ip) {
      toast.error('Please enter a valid node IP');
      return;
    }
    try {
      await snmpService.configureSNMP(config.ip, config);
      toast.success('SNMP Protocol v2c/v3 Updated', {
        description: `Monitoring ${config.ip} with enhanced telemetry.`,
      });
      setIsConfiguring(false);
      setIsLive(true);
    } catch (err) {
      toast.error('Protocol mismatch', {
        description: 'Verify SNMP credentials and community strings.'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg", isLive ? "bg-blue-600 shadow-blue-200" : "bg-slate-200 shadow-none")}>
                <Activity className={cn("w-6 h-6", isLive ? "text-white" : "text-slate-400")} />
            </div>
            {isLive && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white animate-ping" />
            )}
          </div>
          <div>
            <h3 className="font-black text-slate-900 uppercase tracking-tight">Live SNMP Stream</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
              {config.ip ? `Node: ${config.ip} • Community: ${config.community} • v${config.version}` : 'No active endpoint selected'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-white border border-slate-200 rounded-xl shadow-sm">
          <button 
            onClick={() => config.ip ? setIsLive(!isLive) : setIsConfiguring(true)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
              isLive ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"
            )}
          >
            {isLive ? <Pause size={14} /> : <Play size={14} />}
            {isLive ? 'Pause Stream' : 'Start Stream'}
          </button>
          
          <button 
            onClick={() => setIsConfiguring(!isConfiguring)}
            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <Settings2 size={14} />
            Config Node
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isConfiguring && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleConfigure}
            className="bg-white p-6 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4 overflow-hidden shadow-inner"
          >
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Endpoint IP</label>
              <input 
                type="text" 
                value={config.ip}
                onChange={(e) => setConfig({...config, ip: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border-transparent rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                placeholder="e.g. 192.168.1.1"
              />
            </div>
            <div>
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">SNMP Version</label>
               <select 
                value={config.version}
                onChange={(e) => setConfig({...config, version: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border-transparent rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all outline-none"
               >
                 <option value="v2c">SNMP v2c</option>
                 <option value="v3">SNMP v3 (Secure)</option>
               </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Community/Auth</label>
              <input 
                type="text" 
                value={config.community}
                onChange={(e) => setConfig({...config, community: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border-transparent rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all outline-none"
                placeholder="public"
              />
            </div>
            <div className="flex items-end">
              <button 
                type="submit"
                className="w-full bg-slate-900 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
              >
                Initialize Collection
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {!metrics && isLive ? (
        <div className="bg-white p-16 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin shadow-blue-500" />
          <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Establishing SNMP Handshake...</p>
        </div>
      ) : !isLive && !metrics ? (
        <div className="bg-slate-50/50 p-16 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
           <Signal className="w-12 h-12 text-slate-200 mb-4" />
           <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Awaiting Telemetry Initialization</h4>
           <p className="text-xs text-slate-400 mt-1">Configure a node IP and start the stream to collect live data.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard 
              title="CPU Core Load" 
              value={metrics?.cpuUsage ?? 0} 
              unit="%" 
              icon={Cpu} 
              color="bg-blue-600" 
              history={history.cpu}
            />
            <MetricCard 
              title="Memory Stack" 
              value={metrics?.memoryUsage ?? 0} 
              unit="%" 
              icon={Database} 
              color="bg-indigo-600" 
              history={history.memory}
            />
            <MetricCard 
              title="Rx Throughput" 
              value={metrics?.inTraffic ?? 0} 
              unit=" Gbps" 
              icon={ArrowDown} 
              color="bg-emerald-600" 
              history={history.traffic.map(t => ({ value: t.in, time: t.time }))}
            />
            <MetricCard 
              title="Tx Throughput" 
              value={metrics?.outTraffic ?? 0} 
              unit=" Gbps" 
              icon={ArrowUp} 
              color="bg-orange-600" 
              history={history.traffic.map(t => ({ value: t.out, time: t.time }))}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="font-black text-slate-900 uppercase tracking-tight">Telemetry Waveform</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Real-time packet flow visualization</p>
                </div>
                <div className="flex items-center gap-6 bg-slate-50 px-4 py-2 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">INBOUND</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">OUTBOUND</span>
                  </div>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history.traffic}>
                    <defs>
                      <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 700}}
                      minTickGap={60}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 700}}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '16px', 
                        border: 'none', 
                        boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', 
                        padding: '12px',
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        color: '#fff'
                      }} 
                      itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="in" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorIn)" 
                      isAnimationActive={false}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="out" 
                      stroke="#f97316" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorOut)" 
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
               <h3 className="font-black text-slate-900 uppercase tracking-tight mb-2">Port Hierarchy</h3>
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-8">Interface Status Monitoring</p>
               
               <div className="space-y-3">
                 {metrics?.interfaceStats?.map((port, idx) => (
                   <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-all">
                      <div className="flex items-center gap-3">
                         <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            port.status === 'up' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                         )}>
                            <Signal size={14} />
                         </div>
                         <div>
                            <p className="text-xs font-black text-slate-900">{port.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Port Index: {idx + 1}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                         {port.status === 'up' ? (
                            <CheckCircle2 size={16} className="text-green-500" />
                         ) : (
                            <AlertCircle size={16} className="text-red-500 animate-pulse" />
                         )}
                         <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            port.status === 'up' ? "text-green-600" : "text-red-600"
                         )}>{port.status}</span>
                      </div>
                   </div>
                 )) || (
                   <div className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Initializing SNMP Scan...</p>
                   </div>
                 )}
               </div>

               <button className="w-full mt-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg">
                  Full Interface Audit
               </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};