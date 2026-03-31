import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-3">
        <div className="text-3xl font-bold">404</div>
        <div className="text-slate-600">This page does not exist.</div>
        <Link to="/">
          <Button>Go home</Button>
        </Link>
      </div>
    </div>
  );
}

