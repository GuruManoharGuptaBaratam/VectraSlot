import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";
import Alert from "../components/Alert";
import AuthShell from "../components/AuthShell";
import { AuthData } from "../types/auth";
import { setAuthSession } from "../utils/authStorage";

function SignupPage() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [authData, setAuthData] = useState<AuthData | null>(null);

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setSuccess("");
        setAuthData(null);

        if (!name.trim() || !email.trim() || !password) {
            setError("Name, email, and password are required.");
            return;
        }

        setSubmitting(true);

        try {
            const response = await registerUser({
                name: name.trim(),
                email: email.trim(),
                password
            });

            setSuccess(response.message);
            setAuthData(response.data);
            setAuthSession(response.data.token, response.data.user);
            setPassword("");
            navigate("/dashboard", { replace: true });
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : "Registration failed.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthShell
            title="Create User Account"
            subtitle="This form maps to POST /api/auth/register and creates USER accounts only."
        >
            <form className="space-y-4" onSubmit={onSubmit}>
                <label className="block space-y-1">
                    <span className="text-sm font-medium text-slate-700">Full name</span>
                    <input
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-ink outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/25"
                        placeholder="Jane Driver"
                        autoComplete="name"
                    />
                </label>

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
                        autoComplete="new-password"
                    />
                </label>

                {error && <Alert kind="error" message={error} />}
                {success && <Alert kind="success" message={success} />}

                {authData && (
                    <div className="animate-rise-fade rounded-xl border border-ocean/20 bg-ocean/5 p-4 text-sm text-slate-700">
                        <p className="font-semibold text-ink">Authenticated user</p>
                        <p>Name: {authData.user.name}</p>
                        <p>Email: {authData.user.email}</p>
                        <p>Role: {authData.user.role}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-ocean px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {submitting ? "Creating account..." : "Sign Up"}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
                Already registered?{" "}
                <Link className="font-semibold text-ocean hover:text-sky-900" to="/login">
                    Go to Login
                </Link>
            </p>
        </AuthShell>
    );
}

export default SignupPage;
