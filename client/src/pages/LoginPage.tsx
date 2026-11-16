import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { loginSchema, type LoginForm } from "../schemas/auth.schema";
import { getErrorMessage } from "../lib/errors";

export default function LoginPage() {
  const { user, loading, login } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  if (!loading && user) return <Navigate to="/workspaces" replace />;

  const onSubmit = async (values: LoginForm) => {
    try {
      await login(values.email, values.password);
    } catch (err) {
      setError("root", { message: getErrorMessage(err) });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F1117] p-4 text-slate-200">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="w-full max-w-md space-y-5 rounded-2xl border border-white/10 bg-[#171A23] p-8"
      >
        <div>
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-sm text-slate-400">Sign in to your workspace.</p>
        </div>

        {errors.root && (
          <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
            {errors.root.message}
          </p>
        )}

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm text-slate-400">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            className="w-full rounded-lg border border-white/10 bg-[#0F1117] px-3 py-2 outline-none focus:border-indigo-500"
          />
          {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm text-slate-400">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
            className="w-full rounded-lg border border-white/10 bg-[#0F1117] px-3 py-2 outline-none focus:border-indigo-500"
          />
          {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-indigo-500 py-2 font-medium text-white hover:bg-indigo-400 disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>

        <p className="text-center text-sm text-slate-400">
          New here? <Link to="/register" className="text-indigo-400">Create account</Link>
        </p>
      </form>
    </div>
  );
}