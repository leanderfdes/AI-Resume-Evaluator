import { useAuth } from "../context/auth";

export default function AppShell({ children }) {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div>
            <p className="font-semibold">AI Resume Evaluator</p>
            <p className="text-xs text-zinc-500">Phase 1: Auth + Dashboard shell</p>
          </div>
          <button
            onClick={logout}
            className="text-sm rounded-lg px-3 py-2 border hover:bg-zinc-50 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
