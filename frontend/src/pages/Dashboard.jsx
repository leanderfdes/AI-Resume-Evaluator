import React, { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import PageFade from "../components/PageFade";
import Toast from "../components/Toast";
import { useAuth } from "../context/auth";
import { useNavigate } from "react-router-dom";

function SkeletonCard() {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="h-4 w-40 bg-zinc-100 rounded" />
      <div className="mt-3 h-3 w-64 bg-zinc-100 rounded" />
      <div className="mt-4 h-8 w-24 bg-zinc-100 rounded-xl" />
    </div>
  );
}

function RiskPill({ risk }) {
  const cls =
    risk === "High"
      ? "bg-red-50 text-red-700 border-red-200"
      : risk === "Medium"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-emerald-50 text-emerald-700 border-emerald-200";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${cls}`}>
      ATS Risk: {risk || "—"}
    </span>
  );
}

export default function Dashboard() {
  const { client } = useAuth();
  const nav = useNavigate();

  const [me, setMe] = useState(null);
  const [runs, setRuns] = useState([]);
  const [loadingRuns, setLoadingRuns] = useState(true);

  const [toast, setToast] = useState({ msg: "", type: "info" });

  const prettyDate = useMemo(() => (d) => new Date(d).toLocaleString(), []);

  const load = async () => {
    setLoadingRuns(true);
    try {
      const meRes = await client.get("/me");
      setMe(meRes.data);

      const runsRes = await client.get("/runs");
      setRuns(runsRes.data.items || []);
    } catch (e) {
      setToast({ msg: "Failed to load dashboard data", type: "error" });
    } finally {
      setLoadingRuns(false);
    }
  };

  // Optional dev helper (kept small + unobtrusive)
  const seed = async () => {
    try {
      await client.post("/dev/seed-run");
      setToast({ msg: "Sample report created ✅", type: "success" });
      load();
    } catch {
      setToast({ msg: "Could not create sample report", type: "error" });
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  return (
    <PageFade>
      <Toast
        message={toast.msg}
        type={toast.type}
        onClose={() => setToast({ msg: "", type: "info" })}
      />
      <AppShell>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-sm text-zinc-500 mt-1">
              {me ? `Welcome, ${me.name}` : "Loading profile..."}
            </p>
          </div>

          {/* ✅ Phase 3 primary CTA */}
          <button
            onClick={() => nav("/analyze")}
            className="rounded-xl bg-black text-white px-4 py-2 text-sm hover:opacity-90 transition active:scale-[0.99]"
          >
            + New Analysis
          </button>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Previous Reports</h2>
              <p className="text-xs text-zinc-500 mt-1">{runs.length} total</p>
            </div>

            {/* Tiny dev-only helper */}
            <button
              onClick={seed}
              className="text-sm underline text-zinc-600 hover:text-black transition"
              title="Dev helper: creates a sample run"
            >
              Create sample report
            </button>
          </div>

          {/* Loading */}
          {loadingRuns && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {/* Empty state */}
          {!loadingRuns && runs.length === 0 && (
            <div className="mt-4 rounded-2xl border bg-white p-8 text-center">
              <p className="text-lg font-semibold">No reports yet</p>
              <p className="text-sm text-zinc-500 mt-1">
                Run your first analysis to get section-wise feedback and an ATS-optimized rewrite.
              </p>

              <div className="mt-5 flex justify-center gap-3">
                <button
                  onClick={() => nav("/analyze")}
                  className="rounded-xl bg-black text-white px-4 py-2 text-sm hover:opacity-90 transition active:scale-[0.99]"
                >
                  Start analysis
                </button>
                <button
                  onClick={seed}
                  className="rounded-xl border bg-white px-4 py-2 text-sm hover:bg-zinc-50 transition active:scale-[0.99]"
                >
                  Create sample
                </button>
              </div>
            </div>
          )}

          {/* Runs list */}
          {!loadingRuns && runs.length > 0 && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {runs.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border bg-white p-5 hover:shadow-sm transition cursor-pointer active:scale-[0.995]"
                  onClick={() => nav(`/runs/${r.id}`)} // Phase 3.5 / Phase 4
                  title="Open report"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{r.job_title_guess || "Resume Analysis"}</p>
                      <p className="text-sm text-zinc-500 mt-1">
                        {r.resume_filename} • {prettyDate(r.created_at)}
                      </p>
                    </div>
                    <RiskPill risk={r.ats_risk} />
                  </div>

                  <div className="mt-4">
                    <button className="text-sm underline text-zinc-700 hover:text-black transition">
                      View details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </PageFade>
  );
}
