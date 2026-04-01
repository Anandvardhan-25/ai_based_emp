
import React, { useState } from "react";
import { api } from "../lib/api";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";

export function ApplyLeavePage() {
  const [type, setType] = useState("SICK");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const navigate = useNavigate();
  const { me } = useAuth(); // Assume we need employeeId but we don't have it in me, wait we can just send me.email or backend fetches it via Principal context, BUT original leave ApplyRequest takes employeeId

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Wait, how do we get employeeId? Usually from /api/employees/me or the backend shouldn't require it in request. Let's just fetch it first.
    try {
        const emp = await api.get("/api/employees/me");
        await api.post("/api/leaves", { employeeId: emp.data.id, type, startDate, endDate, reason });
        toast.success("Leave applied successfully");
        navigate("/my-leaves");
    } catch(err: any) {
        toast.error("Failed to apply: Make sure you have an employee profile linked to your account");
    }
  }

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold mb-4">Apply Leave</h1>
      <form onSubmit={onSubmit} className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium mb-1">Leave Type</label>
          <select value={type} onChange={e => setType(e.target.value)} className="w-full border p-2 rounded">
            <option value="SICK">SICK</option>
            <option value="CASUAL">CASUAL</option>
            <option value="PAID">PAID</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">From Date</label>
            <Input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To Date</label>
            <Input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Reason</label>
          <textarea required value={reason} onChange={e => setReason(e.target.value)} className="w-full border p-2 rounded" rows={3}></textarea>
        </div>
        <Button type="submit">Submit Request</Button>
      </form>
    </Card>
  );
}
