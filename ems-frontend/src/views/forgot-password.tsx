
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
