import React, { useState } from "react";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { getErrorMessage } from "../lib/errors";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import type { SkillMatchResponse } from "../lib/types";

export function SkillsPage() {
  const [skills, setSkills] = useState("");
  const [results, setResults] = useState<SkillMatchResponse[]>([]);
  const [loading, setLoading] = useState(false);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!skills.trim()) return;
    setLoading(true);
    try {
      const parts = skills.split(",").map((s) => s.trim()).filter(Boolean);
      const res = await api.get<SkillMatchResponse[]>("/api/skills/match", {
        params: { skills: parts.join(",") },
      });
      setResults(res.data);
      if (res.data.length === 0) toast.error("No matches found");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Skill Dashboard & Matching</h1>
        <p className="text-slate-500">Find the right employees by required skills.</p>
      </div>

      <Card className="p-5">
        <form onSubmit={search} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <Input
              label="Required Skills (Comma separated)"
              placeholder="e.g. Java, Spring Boot, React"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>
          <Button disabled={loading} type="submit">{loading ? "Searching..." : "Search Match"}</Button>
        </form>
      </Card>

      {results.length > 0 && (
        <Card className="overflow-hidden">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-3 font-semibold">Employee</th>
                <th className="px-5 py-3 font-semibold">Match Score</th>
                <th className="px-5 py-3 font-semibold">Matched Skills</th>
                <th className="px-5 py-3 font-semibold">Missing Skills</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((r) => (
                <tr key={r.employeeId}>
                  <td className="px-5 py-3">
                    <div className="font-semibold text-slate-800">{r.employeeName}</div>
                    <div className="text-xs text-slate-500">{r.employeeEmail}</div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 font-bold rounded">
                      {Math.round(r.matchPercentage)}%
                    </span>
                  </td>
                  <td className="px-5 py-3 w-1/3">
                    <div className="flex flex-wrap gap-1">
                      {r.matchedSkills.length === 0 ? <span className="text-slate-400">None</span> : null}
                      {r.matchedSkills.map(s => <span key={s} className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">{s}</span>)}
                    </div>
                  </td>
                  <td className="px-5 py-3 w-1/3">
                    <div className="flex flex-wrap gap-1">
                      {r.missingSkills.length === 0 ? <span className="text-slate-400">None</span> : null}
                      {r.missingSkills.map(s => <span key={s} className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs">{s}</span>)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
