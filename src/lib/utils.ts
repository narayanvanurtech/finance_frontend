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

// Helper function to get full logo/image URL from backend
export function getLogoUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null;
  // If it's already a full URL, return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  // If it's a relative path from backend, prepend the API base URL
  const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
  // Remove trailing slash from baseURL if exists
  const cleanBaseURL = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;
  // Ensure imagePath starts with /
  const cleanImagePath = imagePath.startsWith("/")
    ? imagePath
    : `/${imagePath}`;
  // Prepend base URL - backend should return the correct path structure
  return `${cleanBaseURL}${cleanImagePath}`;
}
