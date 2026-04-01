import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card } from "../ui/card";

export function DocumentsPage() {
  const [docs, setDocs] = useState<any[]>([]);

  // We could fetch actual employeeId or hardcode one for demo purposes
  useEffect(() => {
    // Demo implementation
  }, []);

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold mb-4">Document Management</h1>
      <p className="text-sm text-slate-500 mb-4">Upload and manage employee resumes, offer letters, and payslips.</p>
      <div className="p-8 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-500 bg-slate-50">
        Drag and Drop documents here to upload
      </div>
    </Card>
  );
}
