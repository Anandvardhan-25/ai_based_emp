
import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import toast from "react-hot-toast";

export function AdminLeavesPage() {
  const [leaves, setLeaves] = useState<any[]>([]);

  const fetchLeaves = () => {
    api.get(`/api/leaves?page=0&size=100`).then(res => setLeaves(res.data.items || []));
  }

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleStatus = async (id: string, status: string) => {
      try {
         await api.put(`/api/leaves/${id}/status?status=${status}`);
         toast.success("Leave updated");
         fetchLeaves();
      } catch(e) { toast.error("Failed to update status"); }
  }

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold mb-4">Leave Administration</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b text-slate-500">
              <th className="py-2 px-2">Employee</th>
              <th className="py-2 px-2">Type</th>
              <th className="py-2 px-2">Dates</th>
              <th className="py-2 px-2">Reason</th>
              <th className="py-2 px-2">Status</th>
              <th className="py-2 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((l: any) => (
              <tr key={l.id} className="border-b hover:bg-slate-50 transition-colors">
                <td className="py-2 px-2 font-medium">{l.employeeName}</td>
                <td className="py-2 px-2">{l.type}</td>
                <td className="py-2 px-2">{l.startDate} to {l.endDate}</td>
                <td className="py-2 px-2 truncate max-w-xs">{l.reason}</td>
                <td className="py-2 px-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${l.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : l.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {l.status}
                  </span>
                </td>
                <td className="py-2 px-2 space-x-2 flex">
                    {l.status === 'PENDING' && (
                        <>
                          <Button onClick={() => handleStatus(l.id, 'APPROVED')} className="bg-green-600 hover:bg-green-700 px-3 py-1 text-sm h-8">Approve</Button>
                          <Button onClick={() => handleStatus(l.id, 'REJECTED')} variant="danger" className="px-3 py-1 text-sm h-8">Reject</Button>
                        </>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {leaves.length === 0 && <p className="text-center py-4 text-slate-500">No leaves found.</p>}
      </div>
    </Card>
  );
}
