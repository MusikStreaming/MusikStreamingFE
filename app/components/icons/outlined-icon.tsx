import { twMerge } from "tailwind-merge";

export default function OutlinedIcon({ icon, className }: { icon: string, className?: string }) {
  return (
    <span className={twMerge("material-symbols-outlined", className)}>{icon}</span>
  );
}