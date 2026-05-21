import { motion } from "framer-motion";

export default function ActionButton({
  children,
  loading = false,
  className = "",
  variant = "primary",
  disabled = false,
  title,
  ...props
}) {
  const base = variant === "primary" ? "btn" : "btn-secondary";
  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.05 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
      disabled={disabled || loading}
      className={`${base} inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      title={title}
      {...props}
    >
      {loading && <span className="spinner" />}
      <span>{children}</span>
    </motion.button>
  );
}
