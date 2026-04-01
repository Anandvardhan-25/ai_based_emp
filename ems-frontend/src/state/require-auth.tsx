import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./auth";
import { Spinner } from "../ui/spinner";

export function RequireAuth({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { me, loading } = useAuth();
  const loc = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!me) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }

  if (roles && !roles.includes(me.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

