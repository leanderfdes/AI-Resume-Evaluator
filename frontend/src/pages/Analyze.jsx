import React, { useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import PageFade from "../components/PageFade";
import Toast from "../components/Toast";
import Button from "../components/Button";
import { useAuth } from "../context/auth";

const STEPS = ["Upload", "Parsing", "Sectioning", "Ready"];

function Stepper({ step }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((s, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <div key={s} className="flex items-center gap-2">
            <div
              className={[
                "h-7 w-7 rounded-full border flex items-center justify-center text-xs font-semibold transition",
                done
                  ? "bg-black text-white border-black"
                  : active
                  ? "bg-white border-black"
                  : "bg-white border-zinc-200 text-zinc-400",
              ].join(" ")}
            >
              {done ? "✓" : i + 1}
            </div>
            <span
              className={[
                "text-sm",
                done ? "text-black" : active ? "text-black" : "text-zinc-400",
              ].join(" ")}
            >
              {s}
            </span>
            {i !== STEPS.length - 1 && <div className="w-8 h-px bg-zinc-200" />}
          </div>
        );
      })}
    </div>
  );
}

function SectionCard({ title, text }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const preview = text?.slice(0, 260) || "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 900);
    } catch {
      // ignore
    }
  };

  return (
    <div className="rounded-2xl border p-4 hover:bg-zinc-50 transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold capitalize">{title}</p>
          <p className="text-xs text-zinc-500 mt-1">{text ? `${text.length} chars` : "empty"}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copy}
            className="rounded-lg border px-2.5 py-1 text-xs hover:bg-white transition active:scale-[0.99]"
            title="Copy section"
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg border px-2.5 py-1 text-xs hover:bg-white transition active:scale-[0.99]"
          >
            {open ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>

      <p className="mt-3 text-sm text-zinc-700 whitespace-pre-line break-words">
        {text ? (open ? text : preview + (text.length > 260 ? "…" : "")) : "—"}
      </p>
    </div>
  );
}

export default function Analyze() {
  const { client } = useAuth();

  const [jd, setJd] = useState("");
  const [file, setFile] = useState(null);

  const [dragOver, setDragOver] = useState(false);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "info" });

  const canSubmit = useMemo(
    () => jd.trim().length >= 30 && !!file && !loading,
    [jd, file, loading]
  );

  const onPick = (f) => {
    if (!f) return;
    const ok = /\.(pdf|docx|doc)$/i.test(f.name);
    if (!ok) {
      setToast({ msg: "Upload a PDF or DOCX file", type: "error" });
      return;
    }
    setFile(f);
  };

  const submit = async () => {
    if (!canSubmit) return;

    setLoading(true);
    setResult(null);
    setToast({ msg: "", type: "info" });

    setStep(1);
    setTimeout(() => setStep(2), 450);

    try {
      const fd = new FormData();
      fd.append("jd_text", jd);
      fd.append("resume", file);

      const res = await client.post("/analyze", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(res.data);
      setStep(3);
      setToast({ msg: "Resume parsed successfully ✅", type: "success" });
    } catch (e) {
      setStep(0);
      setToast({ msg: e?.response?.data?.detail || "Analyze failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-2xl font-semibold">New Analysis</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Upload your resume and paste the job description.
            </p>
          </div>
          <Stepper step={step} />
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Upload Card */}
          <div className="rounded-2xl border bg-white p-6">
            <p className="font-semibold">Resume file</p>
            <p className="text-sm text-zinc-500 mt-1">PDF or DOCX. Keep it under 5MB.</p>

            <div
              onDragEnter={() => setDragOver(true)}
              onDragLeave={() => setDragOver(false)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                onPick(e.dataTransfer.files?.[0]);
              }}
              className={[
                "mt-4 rounded-2xl border-2 border-dashed p-6 transition",
                dragOver ? "border-black bg-zinc-50" : "border-zinc-200 bg-white",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">
                    {file ? file.name : "Drag & drop your resume here"}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {file ? `${Math.round(file.size / 1024)} KB` : "or choose a file"}
                  </p>
                </div>

                <label className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50 transition cursor-pointer active:scale-[0.99]">
                  Choose
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    className="hidden"
                    onChange={(e) => onPick(e.target.files?.[0])}
                  />
                </label>
              </div>

              {file && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setFile(null)}
                    className="text-sm underline text-zinc-600 hover:text-black transition"
                  >
                    Remove file
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6">
              <p className="font-semibold">Job description</p>
              <p className="text-sm text-zinc-500 mt-1">Paste the JD text (min ~30 chars).</p>
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                rows={10}
                className="mt-3 w-full rounded-2xl border px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                placeholder="Paste job description here..."
              />
              <div className="mt-2 text-xs text-zinc-500 flex justify-between">
                <span>{jd.trim().length} chars</span>
                {jd.trim().length < 30 && <span className="text-amber-600">Add more JD text</span>}
              </div>
            </div>

            <div className="mt-6">
              <Button loading={loading} disabled={!canSubmit} onClick={submit}>
                Analyze
              </Button>
              {!file && (
                <p className="text-xs text-zinc-500 mt-2">
                  Upload a resume file to enable Analyze.
                </p>
              )}
            </div>
          </div>

          {/* Preview Card */}
          <div className="rounded-2xl border bg-white p-6">
            <p className="font-semibold">Parsed Sections Preview</p>
            <p className="text-sm text-zinc-500 mt-1">
              Phase 3 shows what the parser extracted. Phase 4 will score + rewrite each section.
            </p>

            {!result && (
              <div className="mt-5 rounded-2xl border bg-zinc-50 p-5">
                <p className="text-sm text-zinc-600">
                  Run an analysis to see the detected sections here.
                </p>
              </div>
            )}

            {result?.parsed_sections && (
              <div className="mt-5 space-y-3 max-h-[540px] overflow-auto pr-1">
                {Object.entries(result.parsed_sections).map(([k, v]) => (
                  <SectionCard key={k} title={k} text={v} />
                ))}
              </div>
            )}

            {result?.debug && (
              <div className="mt-4 rounded-2xl border bg-zinc-50 p-4 text-xs text-zinc-600">
                <p className="font-semibold text-zinc-700">Debug</p>
                <pre className="mt-2 whitespace-pre-wrap break-words">
                  {JSON.stringify(result.debug, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </PageFade>
  );
}
