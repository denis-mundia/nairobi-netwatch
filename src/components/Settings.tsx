import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Database, 
  RotateCcw, 
  Save, 
  BellRing, 
  Shield, 
  Clock, 
  Server, 
  Key, 
  Cpu, 
  Zap, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  HardDrive,
  Cloud,
  FileText,
  Terminal,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'snmp' | 'backup' | 'alerts' | 'scheduler'>('snmp');
  const [isSaving, setIsSaving] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Configuration saved successfully');
    }, 1000);
  };

  const handleBackup = () => {
    setIsBackingUp(true);
    toast.loading('Initializing system recovery point...', { duration: 2000 });
    setTimeout(() => {
      setIsBackingUp(false);
      toast.success('System backup completed and encrypted');
    }, 2500);
  };

  const tabs = [
    { id: 'snmp', label: 'SNMP & Discovery', icon: Server },
    { id: 'backup', label: 'Backup & Recovery', icon: RotateCcw },
    { id: 'alerts', label: 'Alerting Policies', icon: BellRing },
    { id: 'scheduler', label: 'Task Automation', icon: Clock },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Configuration</h1>
          <p className="text-slate-500 mt-1 font-medium flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-slate-400" />
            Global parameters, recovery controls, and automated task scheduling
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-200"
        >
          <Save className={cn("w-4 h-4", isSaving && "animate-spin")} />
          {isSaving ? 'Saving Changes...' : 'Save All Changes'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:w-72 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                activeTab === tab.id 
                  ? "bg-white text-blue-600 shadow-sm border border-slate-100" 
                  : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "text-blue-600" : "text-slate-400")} />
              {tab.label}
              {activeTab === tab.id && <ChevronRight className="ml-auto w-4 h-4" />}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 min-h-[500px]">
            {activeTab === 'snmp' && (
              <div className="space-y-8 max-w-2xl">
                <section>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Key className="w-5 h-5 text-blue-600" /> Global SNMP Credentials
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">SNMP Version</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none">
                        <option>SNMP v3 (Recommended)</option>
                        <option>SNMP v2c</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Auth Protocol</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none">
                        <option>SHA-256</option>
                        <option>MD5</option>
                      </select>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-indigo-600" /> Auto-Discovery Subnets
                  </h3>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-700">192.168.1.0/24</span>
                      <span className="text-[10px] font-black uppercase text-green-600 bg-green-50 px-2 py-1 rounded">Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-700">10.0.0.0/16</span>
                      <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-1 rounded">Paused</span>
                    </div>
                    <button className="w-full py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-blue-600 hover:bg-slate-50 transition-colors">
                      + Add Discovery Subnet
                    </button>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'backup' && (
              <div className="space-y-8 max-w-2xl">
                <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl flex items-start gap-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm">
                    <Database className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">System Recovery State</h4>
                    <p className="text-sm text-slate-500 mt-1">Automatic backups are running daily at 02:00 AM. 4 active recovery points stored in encrypted cloud storage.</p>
                  </div>
                </div>

                <section>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <RotateCcw className="w-5 h-5 text-amber-600" /> Manual Recovery Points
                  </h3>
                  <div className="space-y-3">
                    {[
                      { date: 'Yesterday, 02:00 AM', size: '124 MB', type: 'Full System' },
                      { date: '2 days ago, 02:00 AM', size: '122 MB', type: 'Full System' },
                    ].map((backup, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <HardDrive className="w-5 h-5 text-slate-300" />
                          <div>
                            <p className="text-sm font-bold text-slate-900">{backup.date}</p>
                            <p className="text-xs text-slate-500">{backup.type} \u2022 {backup.size}</p>
                          </div>
                        </div>
                        <button className="text-xs font-bold text-blue-600 hover:underline opacity-0 group-hover:opacity-100 transition-opacity">Restore</button>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={handleBackup}
                    disabled={isBackingUp}
                    className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg"
                  >
                    <Save className={cn("w-3.5 h-3.5", isBackingUp && "animate-spin")} />
                    {isBackingUp ? 'Creating Backup...' : 'Create Instant Recovery Point'}
                  </button>
                </section>
              </div>
            )}

            {activeTab === 'alerts' && (
              <div className="space-y-8 max-w-2xl">
                <section>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <BellRing className="w-5 h-5 text-rose-600" /> Performance Thresholds
                  </h3>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-700">Critical CPU Usage</span>
                        <span className="text-sm font-extrabold text-blue-600 px-3 py-1 bg-blue-50 rounded-lg">90%</span>
                      </div>
                      <input type="range" className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-700">Memory Pressure Alert</span>
                        <span className="text-sm font-extrabold text-blue-600 px-3 py-1 bg-blue-50 rounded-lg">85%</span>
                      </div>
                      <input type="range" className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-700">Latency Warning</span>
                        <span className="text-sm font-extrabold text-blue-600 px-3 py-1 bg-blue-50 rounded-lg">150ms</span>
                      </div>
                      <input type="range" className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'scheduler' && (
              <div className="space-y-8 max-w-2xl">
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-emerald-600" /> Automated Task Schedules
                    </h3>
                    <button className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-colors">Schedule New Task</button>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { name: 'Security Vulnerability Scan', frequency: 'Every 24 Hours', lastRun: '2 hours ago', nextRun: 'in 22 hours', status: 'active' },
                      { name: 'Inventory Reconciliation', frequency: 'Every 6 Hours', lastRun: '15 mins ago', nextRun: 'in 5h 45m', status: 'active' },
                      { name: 'Performance Log Rotation', frequency: 'Every 7 Days', lastRun: '4 days ago', nextRun: 'in 3 days', status: 'active' },
                      { name: 'Policy Compliance Audit', frequency: 'Monthly', lastRun: '2 weeks ago', nextRun: 'in 2 weeks', status: 'paused' },
                    ].map((task, i) => (
                      <div key={i} className="p-5 bg-slate-50/50 border border-slate-100 rounded-3xl flex items-center justify-between group hover:bg-white hover:shadow-lg hover:shadow-slate-100 transition-all duration-300">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "p-3 rounded-2xl",
                            task.status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                          )}>
                            <Zap className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{task.name}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{task.frequency}</span>
                              <span className="text-[10px] text-slate-300">\u2022</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last: {task.lastRun}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded",
                            task.status === 'active' ? "text-emerald-600 bg-emerald-50" : "text-slate-400 bg-slate-100"
                          )}>{task.status}</span>
                          <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors bg-white rounded-xl border border-slate-100 shadow-sm opacity-0 group-hover:opacity-100">
                            <SettingsIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;