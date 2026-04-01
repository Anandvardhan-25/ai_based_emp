import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import type { DashboardSummary } from "../lib/types";
import { getErrorMessage } from "../lib/errors";
import { Card } from "../ui/card";
import { Spinner } from "../ui/spinner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'];

export function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get<DashboardSummary>("/api/dashboard/summary");
      setData(res.data);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    
    const onUpdate = () => load();
    window.addEventListener("ws:dashboard-update", onUpdate);
    return () => window.removeEventListener("ws:dashboard-update", onUpdate);
  }, []);

  const exportCsv = () => {
    if (!data) return;
    const rows = [
      ["Metric", "Value"],
      ["Total Employees", data.totalEmployees],
      ["Active Employees", data.activeEmployees],
      ["Inactive Employees", data.inactiveEmployees],
      ["Employees On Leave Today", data.employeesOnLeaveToday],
      ["Total Leaves Taken", data.totalLeavesTaken],
      ["Total Login Hours", data.totalLoginHours]
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ems_dashboard_summary.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success("Dashboard data exported successfully!");
  };

  if (loading && !data) return <div className="p-10 flex justify-center"><Spinner /></div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-slate-800">Executive Dashboard</h1>
        <button
          onClick={exportCsv}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Export CSV Report
        </button>
      </div>

      {/* KPI Cards Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <Card className="p-5 border-l-4 border-l-blue-500">
          <div className="text-sm text-slate-500 font-medium">Active Employees</div>
          <div className="mt-2 text-3xl font-bold text-slate-800">{data.activeEmployees}</div>
        </Card>
        <Card className="p-5 border-l-4 border-l-rose-500">
          <div className="text-sm text-slate-500 font-medium">Inactive Employees</div>
          <div className="mt-2 text-3xl font-bold text-slate-800">{data.inactiveEmployees}</div>
        </Card>
        <Card className="p-5 border-l-4 border-l-amber-500">
          <div className="text-sm text-slate-500 font-medium">On Leave Today</div>
          <div className="mt-2 text-3xl font-bold text-slate-800">{data.employeesOnLeaveToday}</div>
        </Card>
        <Card className="p-5 border-l-4 border-l-indigo-500">
          <div className="text-sm text-slate-500 font-medium">Total Leaves Taken</div>
          <div className="mt-2 text-3xl font-bold text-slate-800">{data.totalLeavesTaken}</div>
        </Card>
        <Card className="p-5 border-l-4 border-l-emerald-500">
          <div className="text-sm text-slate-500 font-medium">Avg Login Hours</div>
          <div className="mt-2 text-3xl font-bold text-slate-800">
            {data.totalLoginHours} <span className="text-sm font-normal text-slate-400">hrs</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <Card className="p-5 col-span-1 lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-800 mb-6">Employee Growth (Monthly)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.employeeGrowth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="count" stroke="#6366f1" fill="#e0e7ff" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Best Employee spotlight */}
        <Card className="p-6 col-span-1 bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-xl flex flex-col justify-between">
          <div>
            <div className="text-indigo-100 text-xs font-semibold tracking-widest uppercase mb-8">★ Employee of the Month ★</div>
            <div className="w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold shadow-inner ring-4 ring-white/10 mb-6">
              {data.bestEmployee ? data.bestEmployee.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="text-3xl font-bold tracking-tight">{data.bestEmployee?.name || 'No Data'}</div>
            <div className="text-indigo-200 font-medium mt-1">{data.bestEmployee?.department || '-'}</div>
          </div>
          
          {data.bestEmployee && (
            <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center px-4 bg-white/5 rounded-xl pb-2">
              <div className="text-left">
                <div className="text-[10px] text-indigo-200 uppercase tracking-widest font-semibold mb-1">Performance</div>
                <div className="text-2xl font-bold">{data.bestEmployee.performanceScore} <span className="text-sm font-normal text-indigo-200">/ 10</span></div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-indigo-200 uppercase tracking-widest font-semibold mb-1">Status</div>
                <div className="text-sm font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">Top Tier</div>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h2 className="text-base font-semibold text-slate-800 mb-6">Leave Trends (Categories)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.leaveTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" />
                <Bar dataKey="sick" name="Sick Leave" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} />
                <Bar dataKey="casual" name="Casual" stackId="a" fill="#f59e0b" />
                <Bar dataKey="paid" name="Paid Leave" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-base font-semibold text-slate-800 mb-6">Weekly Attendance</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.attendanceSummary} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="present" name="Present" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="absent" name="Absent" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="late" name="Late" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      
      {/* Footer info blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="text-base font-semibold border-b border-slate-100 pb-3">Department Distribution</div>
          <div className="mt-4 space-y-3">
            {data.departmentDistribution.map((d, index) => (
              <div key={d.departmentId} className="flex items-center gap-3">
                <div className="w-32 text-sm font-medium text-slate-700 truncate">{d.departmentName}</div>
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${Math.round((d.employeeCount / Math.max(1, data.totalEmployees)) * 100)}%`, backgroundColor: COLORS[index % COLORS.length] }}
                  />
                </div>
                <div className="w-10 text-right text-sm text-slate-600 font-medium">{d.employeeCount}</div>
              </div>
            ))}
            {data.departmentDistribution.length === 0 ? <div className="text-sm text-slate-500">No departments.</div> : null}
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-base font-semibold border-b border-slate-100 pb-3">Recent Activity</div>
          <div className="mt-4 divide-y divide-slate-50 overflow-y-auto max-h-48 pr-2">
            {data.recentActivity.map((a, idx) => (
              <div key={idx} className="py-2.5">
                <div className="text-sm font-medium text-slate-800">{a.message}</div>
                <div className="text-xs text-slate-400 mt-0.5">{new Date(a.at).toLocaleString()}</div>
              </div>
            ))}
            {data.recentActivity.length === 0 ? <div className="py-3 text-sm text-slate-500">No activity yet.</div> : null}
          </div>
        </Card>
      </div>

    </div>
  );
}
