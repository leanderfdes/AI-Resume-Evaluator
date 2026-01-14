export default function Button({ children, loading, className = "", ...props }) {
  return (
    <button
      className={[
        "w-full rounded-xl px-4 py-2 font-medium",
        "bg-black text-white hover:opacity-90 active:scale-[0.99]",
        "transition disabled:opacity-60 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}
