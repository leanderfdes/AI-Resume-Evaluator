import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Toast from "../components/Toast";
import PageFade from "../components/PageFade";
import { useAuth } from "../context/auth";

export default function Signup() {
  const nav = useNavigate();
  const { client, loginWithToken } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "info" });
  const [shake, setShake] = useState(false);

  const triggerError = (msg) => {
    setToast({ msg, type: "error" });
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToast({ msg: "", type: "info" });

    try {
      const res = await client.post("/auth/signup", { name, email, password });
      loginWithToken(res.data.access_token);
      setToast({ msg: "Account created ✅", type: "success" });
      setTimeout(() => nav("/dashboard"), 350);
    } catch (err) {
      triggerError(err?.response?.data?.detail || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageFade>
      <Toast message={toast.msg} type={toast.type} onClose={() => setToast({ msg: "", type: "info" })} />
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
        <div className={`w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm ${shake ? "shake" : ""}`}>
          <h1 className="text-xl font-semibold">Create account</h1>
          <p className="text-sm text-zinc-500 mt-1">Start optimizing your resume for ATS.</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            <div>
              <label className="text-sm font-medium">Name</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                type="email"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Password (min 8)</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                type="password"
                required
                minLength={8}
              />
            </div>

            <Button loading={loading}>Create account</Button>
          </form>

          <p className="text-sm text-zinc-600 mt-4">
            Already have an account?{" "}
            <Link className="underline" to="/login">
              Login
            </Link>
          </p>
        </div>
      </div>
    </PageFade>
  );
}
