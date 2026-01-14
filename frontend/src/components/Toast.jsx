import React, { useEffect } from "react";

export default function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, 2200);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;

  const style =
    type === "error"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-emerald-50 text-emerald-700 border-emerald-200";

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`border ${style} rounded-xl px-4 py-3 shadow-sm`}>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}
