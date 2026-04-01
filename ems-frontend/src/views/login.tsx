import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../state/auth";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";

type FormValues = { email: string; password: string };

export function LoginPage() {
  const { me, login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as any;
  const from = loc.state?.from ?? "/";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({ defaultValues: { email: "", password: "" } });

  useEffect(() => {
    if (me) nav("/", { replace: true });
  }, [me, nav]);

  async function onSubmit(v: FormValues) {
    await login(v.email, v.password);
    toast.success("Welcome back!");
    nav(from, { replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-slate-900 text-white grid place-items-center font-bold">E</div>
          <div>
            <div className="text-lg font-semibold">EMS Login</div>
            <div className="text-sm text-slate-500">Session-based secure access</div>
          </div>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email"
            placeholder="admin@ems.local"
            autoComplete="username"
            error={errors.email?.message}
            {...register("email", { required: "Email is required" })}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password", { required: "Password is required" })}
          />

          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">Forgot Password?</Link>
        </div>

        <div className="mt-6 text-xs text-slate-500">
          Default admin is created on backend startup. Update via backend env vars or create employees to generate user accounts.
        </div>
      </Card>
    </div>
  );
}

