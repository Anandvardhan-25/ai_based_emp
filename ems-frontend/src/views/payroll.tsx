import React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";

export function PayrollPage() {
  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold mb-4">Payroll Administration</h1>
      <p className="text-sm text-slate-500 mb-4">Run monthly payroll and generate payslips.</p>
      <div className="flex gap-4">
        <Button onClick={() => alert("Payroll generated successfully for current month.")}>Run Monthly Payroll</Button>
      </div>
    </Card>
  );
}
