import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generates a random company name
export function generateRandomCompanyName() {
  const adjectives = [
    "Global", "Dynamic", "Innovative", "NextGen", "Prime", "Visionary", "Pioneer", "Elite", "Quantum", "Synergy"
  ];
  const nouns = [
    "Solutions", "Technologies", "Systems", "Enterprises", "Networks", "Industries", "Ventures", "Dynamics", "Concepts", "Labs"
  ];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun}`;
}
