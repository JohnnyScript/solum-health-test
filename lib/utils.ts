import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function getScoreColor(score: number): string {
  if (score > 0.8) return "text-green-600";
  if (score < 0.5) return "text-red-600";
  return "text-amber-600";
}

export function getScoreBg(score: number): string {
  if (score > 0.8) return "bg-green-50";
  if (score < 0.5) return "bg-red-50";
  return "bg-amber-50";
}

export function calculateDifference(value1: number, value2: number): number {
  return Math.abs(value1 - value2);
}

export function isDifferenceSignificant(
  value1: number,
  value2: number
): boolean {
  return calculateDifference(value1, value2) > 10;
}
