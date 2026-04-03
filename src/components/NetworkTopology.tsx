import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Minus, 
  RefreshCw, 
  Maximize2,
  Server,
  Router,
  Wifi,
  Laptop,
  Cpu,
  Search,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { snmpService } from '../services/snmpService';
import { TopologyNode, TopologyLink } from '../types';
import { toast } from 'sonner';

const NodeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'core': return <Cpu size={24} />;
    case 'router': return <Router size={24} />;
    case 'switch': return <Server size={24} />;
    case 'server': return <Server size={24} />;
    case 'wifi': return <Wifi size={24} />;
    default: return <Laptop size={24} />;
  }
};

export const NetworkTopology: React.FC = () => {
  const [nodes, setNodes] = useState<TopologyNode[]>([]);
  const [links, setLinks] = useState<TopologyLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [discovering, setDiscovering] = useState(false);

  const fetchTopology = async () => {
    try {
      setLoading(true);
      const data = await snmpService.getTopology();
      setNodes(data.nodes);
      setLinks(data.links);
    } catch (error) {
      console.error('Failed to fetch topology:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopology();
  }, []);

  const handleDiscover = async () => {
    setDiscovering(true);
    try {
      await snmpService.discoverDevices('192.168.1.0/24');
      toast.success('Network discovery complete. Topology mapped.');
      await fetchTopology();
    } catch (error) {
      toast.error('Discovery failed');
    } finally {
      setDiscovering(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-12rem)] flex items-center justify-center bg-white rounded-2xl border border-slate-200">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Loading Topology...</p>
        </div>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="h-[calc(100vh-12rem)] flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <Search className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900">Topology Map Unavailable</h3>
        <p className="text-slate-500 max-w-sm mx-auto mt-2 mb-8">
          No infrastructure nodes have been identified. Run a discovery scan to map your network topology.
        </p>
        <button 
          onClick={handleDiscover}
          disabled={discovering}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <RefreshCw className={cn("w-5 h-5", discovering && "animate-spin")} />
          {discovering ? 'Mapping Network...' : 'Run Discovery'}
        </button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Network Topology</h2>
          <p className="text-slate-500">Visual mapping of identified infrastructure nodes.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setScale(s => Math.min(s + 0.1, 2))}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
          >
            <Plus size={20} />
          </button>
          <button 
            onClick={() => setScale(s => Math.max(s - 0.1, 0.5))}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
          >
            <Minus size={20} />
          </button>
          <div className="w-px h-6 bg-slate-200 mx-1" />
          <button onClick={fetchTopology} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
            <RefreshCw size={20} />
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
            <Maximize2 size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden bg-grid-slate-100/50">
        <div 
          className="absolute inset-0 transition-transform duration-300 ease-out origin-center"
          style={{ transform: `scale(${scale})` }}
        >
          {/* SVG Connections */}
          <svg className="absolute inset-0 w-full h-full">
            {links.map((conn, i) => {
              const from = nodes.find(n => n.id === conn.from);
              const to = nodes.find(n => n.id === conn.to);
              if (!from || !to) return null;
              return (
                <line
                  key={i}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="#cbd5e1"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <motion.div
              key={node.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              onClick={() => setSelectedNode(node)}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group",
                "w-16 h-16 rounded-2xl bg-white border-2 flex flex-col items-center justify-center shadow-lg transition-colors",
                selectedNode?.id === node.id ? "border-blue-600 ring-4 ring-blue-100" : "border-slate-200",
                node.status === 'warning' ? "border-amber-400" : ""
              )}
              style={{ left: node.x, top: node.y }}
            >
              <div className={cn(
                "mb-1",
                node.status === 'online' ? "text-blue-600" : "text-amber-500"
              )}>
                <NodeIcon type={node.type} />
              </div>
              <div className="absolute top-full mt-2 whitespace-nowrap bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {node.label}
              </div>
              {node.status === 'warning' && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Node Detail Sidebar (Overlay) */}
        {selectedNode && (
          <motion.div 
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            className="absolute top-4 right-4 bottom-4 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl p-6 z-20"
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-slate-900">{selectedNode.label}</h3>
              <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-slate-600">
                <Plus className="rotate-45" size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    selectedNode.status === 'online' ? "bg-green-500" : "bg-amber-500"
                  )} />
                  <span className="text-sm font-semibold capitalize">{selectedNode.status}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Device ID</p>
                <p className="text-sm font-mono">{selectedNode.id}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Category</p>
                <p className="text-sm font-semibold capitalize">{selectedNode.type}</p>
              </div>

              <button className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
                View Details
              </button>
            </div>
          </motion.div>
        )}

        <div className="absolute bottom-6 left-6 p-4 bg-white/80 backdrop-blur-md rounded-xl border border-slate-200">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600" />
              <span className="text-xs font-semibold text-slate-600">Active Node</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-xs font-semibold text-slate-600">Latency Warning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-300" />
              <span className="text-xs font-semibold text-slate-600">Offline Node</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};