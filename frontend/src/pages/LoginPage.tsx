import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";
import Alert from "../components/Alert";
import AuthShell from "../components/AuthShell";
import { AuthData, Role } from "../types/auth";
import { setAuthSession } from "../utils/authStorage";

function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<Role>("USER");
    const [adminSecret, setAdminSecret] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [authData, setAuthData] = useState<AuthData | null>(null);

    const roleHint = useMemo(
        () =>
            role === "ADMIN"
                ? "ADMIN requires adminSecret exactly as backend expects."
                : "USER login requires email, password, and role=USER.",
        [role]
    );

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setSuccess("");
        setAuthData(null);

        if (!email.trim() || !password) {
            setError("Email and password are required.");
            return;
        }

        if (role === "ADMIN" && !adminSecret.trim()) {
            setError("Admin secret is required for ADMIN login.");
            return;
        }

        setSubmitting(true);

        try {
            const response = await loginUser({
                email: email.trim(),
                password,
                role,
                adminSecret: role === "ADMIN" ? adminSecret.trim() : undefined
            });

            setSuccess(response.message);
            setAuthData(response.data);
            setAuthSession(response.data.token, response.data.user);
            setPassword("");
            navigate("/dashboard", { replace: true });
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : "Login failed.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthShell
            title="Login to VectraSlot"
            subtitle="This form maps to POST /api/auth/login and supports USER and ADMIN roles."
        >
            <form className="space-y-4" onSubmit={onSubmit}>
                <label className="block space-y-1">
                    <span className="text-sm font-medium text-slate-700">Email</span>
                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-ink outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/25"
                        placeholder="you@example.com"
                        autoComplete="email"
                    />
                </label>

                <label className="block space-y-1">
                    <span className="text-sm font-medium text-slate-700">Password</span>
                    <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-ink outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/25"
                        placeholder="********"
                        autoComplete="current-password"
                    />
                </label>

                <label className="block space-y-1">
                    <span className="text-sm font-medium text-slate-700">Role</span>
                    <select
                        value={role}
                        onChange={(event) => setRole(event.target.value as Role)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-ink outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/25"
                    >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                    </select>
                </label>

                <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">{roleHint}</p>

                {role === "ADMIN" && (
                    <label className="block space-y-1 animate-rise-fade">
                        <span className="text-sm font-medium text-slate-700">Admin Secret</span>
                        <input
                            type="password"
                            value={adminSecret}
                            onChange={(event) => setAdminSecret(event.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-ink outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/25"
                            placeholder="Enter ADMIN secret"
                        />
                    </label>
                )}

                {error && <Alert kind="error" message={error} />}
                {success && <Alert kind="success" message={success} />}

                {authData && (
                    <div className="animate-rise-fade rounded-xl border border-mint/40 bg-mint/10 p-4 text-sm text-slate-700">
                        <p className="font-semibold text-ink">Session ready</p>
                        <p>User: {authData.user.name}</p>
                        <p>Role: {authData.user.role}</p>
                        <p className="truncate">Token: {authData.token}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-flare px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {submitting ? "Signing in..." : "Login"}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
                Need an account?{" "}
                <Link className="font-semibold text-ocean hover:text-sky-900" to="/signup">
                    Go to Sign Up
                </Link>
            </p>
        </AuthShell>
    );
}

export default LoginPage;
