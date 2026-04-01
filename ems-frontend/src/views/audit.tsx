import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card } from "../ui/card";

export function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    api.get("/api/audit").then(res => setLogs(res.data));
  }, []);

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold mb-4">Audit Logs</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-medium">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Entity</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log: any) => (
              <tr key={log.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-3 px-4 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="py-3 px-4 font-medium">{log.userEmail}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${log.action === 'DELETE' ? 'bg-red-100 text-red-800' : log.action === 'UPDATE' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                    {log.action}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-500">{log.entityName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
