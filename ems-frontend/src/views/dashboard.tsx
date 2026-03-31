import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import type { DashboardSummary } from "../lib/types";
import { getErrorMessage } from "../lib/errors";
import { Card } from "../ui/card";
import { Spinner } from "../ui/spinner";

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
  }, []);

  const max = useMemo(
    () => Math.max(1, ...(data?.departmentDistribution ?? []).map((d) => d.employeeCount)),
    [data]
  );

  if (loading && !data) return <Spinner />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="text-sm text-slate-500 font-medium">Total Employees</div>
          <div className="mt-2 text-3xl font-bold">{data.totalEmployees}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-slate-500 font-medium">Departments</div>
          <div className="mt-2 text-3xl font-bold">{data.departmentDistribution.length}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-slate-500 font-medium">Leaves Taken</div>
          <div className="mt-2 text-3xl font-bold text-orange-600">{data.totalLeavesTaken}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-slate-500 font-medium">Total Login Hours</div>
          <div className="mt-2 text-3xl font-bold text-blue-600">
            {data.totalLoginHours} <span className="text-sm font-normal text-slate-400">hrs</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 col-span-1 bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-xl shadow-indigo-500/20 text-center flex flex-col justify-between">
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

        <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5">
            <div className="text-base font-semibold">Department Distribution</div>
            <div className="mt-4 space-y-3">
              {data.departmentDistribution.map((d) => (
                <div key={d.departmentId} className="flex items-center gap-3">
                  <div className="w-32 text-sm font-medium text-slate-700 truncate">{d.departmentName}</div>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-2 bg-indigo-500 rounded-full"
                      style={{ width: `${Math.round((d.employeeCount / max) * 100)}%` }}
                    />
                  </div>
                  <div className="w-10 text-right text-sm text-slate-600 font-medium">{d.employeeCount}</div>
                </div>
              ))}
              {data.departmentDistribution.length === 0 ? (
                <div className="text-sm text-slate-500">No departments yet.</div>
              ) : null}
            </div>
          </Card>

          <Card className="p-5">
            <div className="text-base font-semibold">Recent Activity</div>
            <div className="mt-4 divide-y divide-slate-100">
              {data.recentActivity.map((a, idx) => (
                <div key={idx} className="py-2.5">
                  <div className="text-sm font-medium text-slate-800">{a.message}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{new Date(a.at).toLocaleString()}</div>
                </div>
              ))}
              {data.recentActivity.length === 0 ? (
                <div className="py-3 text-sm text-slate-500">No activity yet.</div>
              ) : null}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

