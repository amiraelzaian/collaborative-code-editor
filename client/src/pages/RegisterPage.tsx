
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { registerSchema, type RegisterForm } from "../schemas/auth.schema";
import { getErrorMessage } from "../lib/errors";

export default function RegisterPage() {
  const { loading, register: createNewAccount } = useAuth();
const navigate=useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });


  const onSubmit = async (values: RegisterForm) => {
    try {
      await createNewAccount(
        values.name,
        values.email,
        values.password
      );
      navigate("/workspaces")
    } catch (err) {
      setError("root", {
        message: getErrorMessage(err),
      });
    }
  };

  if (loading) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F1117] p-4 text-slate-200">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="w-full max-w-md space-y-5 rounded-2xl border border-white/10 bg-[#171A23] p-8"
      >
        <div>
          <h1 className="text-2xl font-semibold">
            Welcome to CodeSync
          </h1>
          <p className="text-sm text-slate-400">
            Create your account and start coding with your team.
          </p>
        </div>

        {errors.root && (
          <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
            {errors.root.message}
          </p>
        )}

        {/* Name */}
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm text-slate-400">
            Name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            {...register("name")}
            className="w-full rounded-lg border border-white/10 bg-[#0F1117] px-3 py-2 outline-none focus:border-indigo-500"
          />
          {errors.name && (
            <p className="text-sm text-red-400">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm text-slate-400">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            className="w-full rounded-lg border border-white/10 bg-[#0F1117] px-3 py-2 outline-none focus:border-indigo-500"
          />
          {errors.email && (
            <p className="text-sm text-red-400">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm text-slate-400">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
            className="w-full rounded-lg border border-white/10 bg-[#0F1117] px-3 py-2 outline-none focus:border-indigo-500"
          />
          {errors.password && (
            <p className="text-sm text-red-400">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label
            htmlFor="passwordConfirm"
            className="text-sm text-slate-400"
          >
            Confirm Password
          </label>
          <input
            id="passwordConfirm"
            type="password"
            autoComplete="new-password"
            {...register("passwordConfirm")}
            className="w-full rounded-lg border border-white/10 bg-[#0F1117] px-3 py-2 outline-none focus:border-indigo-500"
          />
          {errors.passwordConfirm && (
            <p className="text-sm text-red-400">
              {errors.passwordConfirm.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-indigo-500 py-2 font-medium text-white hover:bg-indigo-400 disabled:opacity-60"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>

        <p className="text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
