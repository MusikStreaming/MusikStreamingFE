import { twMerge } from "tailwind-merge";

export default function OutlinedFilledIcon({ icon, className }: { icon: string, className?: string }) {
  return (
    <span className={twMerge("material-symbols-outlined-filled", className)}>{icon}</span>
  );
}