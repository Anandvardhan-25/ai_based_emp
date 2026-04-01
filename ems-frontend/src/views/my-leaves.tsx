
import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card } from "../ui/card";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

export function MyLeavesPage() {
  const [leaves, setLeaves] = useState<any[]>([]);

  useEffect(() => {
    // Wait, backend api is /api/leaves/employee/{id}
    api.get("/api/employees/me").then(res => {
      if(res.data?.id) {
          api.get(`/api/leaves/employee/${res.data.id}?page=0&size=100`).then(l => setLeaves(l.data.content));
      }
    });
  }, []);

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">My Leaves</h1>
        <Link to="/apply-leave"><Button>Apply Leave</Button></Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b text-slate-500">
              <th className="py-2 px-2">Type</th>
              <th className="py-2 px-2">From</th>
              <th className="py-2 px-2">To</th>
              <th className="py-2 px-2">Status</th>
              <th className="py-2 px-2">Reason</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((l: any) => (
              <tr key={l.id} className="border-b hover:bg-slate-50 transition-colors">
                <td className="py-2 px-2">{l.type}</td>
                <td className="py-2 px-2">{l.startDate}</td>
                <td className="py-2 px-2">{l.endDate}</td>
                <td className="py-2 px-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${l.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : l.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {l.status}
                  </span>
                </td>
                <td className="py-2 px-2 truncate max-w-xs">{l.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {leaves.length === 0 && <p className="text-center py-4 text-slate-500">No leaves found.</p>}
      </div>
    </Card>
  );
}
