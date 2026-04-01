import os

frontend_views = r"c:\Users\banan\OneDrive\Desktop\tt project\ems-frontend\src\views"
frontend_ui = r"c:\Users\banan\OneDrive\Desktop\tt project\ems-frontend\src\ui"
base_pkg = r"c:\Users\banan\OneDrive\Desktop\tt project\ems-backend\src\main\java\com\example\ems"

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

# 1. Update AuthController for resetting password
auth_controller_path = os.path.join(base_pkg, "auth/AuthController.java")
with open(auth_controller_path, "r", encoding="utf-8") as f:
    text = f.read()

# Add UserAccountRepository import
if "com.example.ems.repository.UserAccountRepository" not in text:
    text = text.replace("import com.example.ems.repository.EmployeeRepository;", "import com.example.ems.repository.EmployeeRepository;\nimport com.example.ems.repository.UserAccountRepository;\nimport com.example.ems.domain.UserAccount;")

# Modify AuthController constructor to include UserAccountRepository
if "UserAccountRepository userAccountRepository" not in text:
    text = text.replace("private final EmployeeRepository employeeRepository;", "private final EmployeeRepository employeeRepository;\n  private final UserAccountRepository userAccountRepository;")
    text = text.replace("EmployeeRepository employeeRepository,", "EmployeeRepository employeeRepository,\n      UserAccountRepository userAccountRepository,")
    text = text.replace("this.employeeRepository = employeeRepository;", "this.employeeRepository = employeeRepository;\n    this.userAccountRepository = userAccountRepository;")

# Replace the reset-password block
import re
text = re.sub(r'Employee emp = employeeRepository.findByEmailIgnoreCaseAndDeletedFalse.*?\}', 
              r'''UserAccount account = userAccountRepository.findByEmailIgnoreCase(email).orElse(null);
      if (account != null) {
          account.setPasswordHash(passwordEncoder.encode(newPassword));
          userAccountRepository.save(account);
      }''', text, flags=re.DOTALL)
write(auth_controller_path, text)

# 2. Add React Forgot Password
write(os.path.join(frontend_views, "forgot-password.tsx"), """
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import toast from "react-hot-toast";
import { getErrorMessage } from "../lib/errors";

export function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/auth/forgot-password", { email });
      toast.success("OTP sent to your email (check console)");
      setStep(2);
    } catch (err: any) {
      toast.error("Failed to send OTP or email not found");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/api/auth/verify-otp", { email, otp });
      if (res.data.valid) {
          toast.success("OTP Verified");
          setStep(3);
      } else {
          toast.error("Invalid or expired OTP");
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/auth/reset-password", { email, newPassword });
      toast.success("Password reset successfully. Please login.");
      navigate("/login");
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
      <Card className="w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <Input required type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} />
            <Button className="w-full" type="submit" disabled={loading}>Send OTP</Button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <Input required type="text" placeholder="Enter 6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} />
            <Button className="w-full" type="submit" disabled={loading}>Verify</Button>
          </form>
        )}
        {step === 3 && (
          <form onSubmit={handleReset} className="space-y-4">
            <Input required type="password" placeholder="Enter new password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            <Button className="w-full" type="submit" disabled={loading}>Reset Password</Button>
          </form>
        )}
      </Card>
    </div>
  );
}
""")

# 3. Add React Leave Pages
write(os.path.join(frontend_views, "apply-leave.tsx"), """
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
""")

write(os.path.join(frontend_views, "my-leaves.tsx"), """
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
""")

write(os.path.join(frontend_views, "admin-leaves.tsx"), """
import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import toast from "react-hot-toast";

export function AdminLeavesPage() {
  const [leaves, setLeaves] = useState<any[]>([]);

  const fetchLeaves = () => {
    api.get(`/api/leaves?page=0&size=100`).then(res => setLeaves(res.data.content));
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
                          <Button size="sm" onClick={() => handleStatus(l.id, 'APPROVED')} className="bg-green-600 hover:bg-green-700">Approve</Button>
                          <Button size="sm" onClick={() => handleStatus(l.id, 'REJECTED')} variant="destructive">Reject</Button>
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
""")

print("Generated frontend view files and updated auth controller")
