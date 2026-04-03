import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-KE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return;
  const q = String.fromCharCode(34);
  const qq = q + q;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj => 
    Object.values(obj).map(val => {
      const stringVal = String(val).split(q).join(qq);
      return q + stringVal + q;
    }).join(',')
  ).join(String.fromCharCode(10));
  
  const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + String.fromCharCode(10) + rows);
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', filename + ".csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(data: any[], title: string, filename: string) {
  const doc = new jsPDF();
  doc.text(title, 14, 15);
  
  const headers = Object.keys(data[0]);
  const rows = data.map(obj => Object.values(obj));

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 20,
    theme: 'striped',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [51, 65, 85] }
  });

  doc.save(`${filename}.pdf`);
}

export function calculateSLA(uptimeMinutes: number, totalMinutes: number): number {
  if (totalMinutes === 0) return 0;
  return Number(((uptimeMinutes / totalMinutes) * 100).toFixed(2));
}

export function getStatusColor(status: string) {
  const s = status.toLowerCase();
  if (s === 'online' || s === 'up' || s === 'pass' || s === 'compliant') return 'text-green-600 bg-green-50 border-green-200';
  if (s === 'offline' || s === 'down' || s === 'fail' || s === 'non-compliant' || s === 'critical') return 'text-red-600 bg-red-50 border-red-200';
  if (s === 'warning' || s === 'degraded' || s === 'medium') return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-slate-600 bg-slate-50 border-slate-200';
}