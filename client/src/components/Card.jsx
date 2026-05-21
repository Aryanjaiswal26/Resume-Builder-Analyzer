import { cn } from "../utils/cn";

export default function Card({ className, children }) {
  return <div className={cn("glass rounded-2xl p-4 md:p-6", className)}>{children}</div>;
}
