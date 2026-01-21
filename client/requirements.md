## Packages
framer-motion | Essential for smooth card flip animations and page transitions
lucide-react | Beautiful icons for UI elements
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility for merging Tailwind classes safely

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  sans: ["var(--font-sans)"],
  display: ["var(--font-display)"],
}
API requires `credentials: "include"` for all requests (handled by `apiRequest` in existing lib/queryClient).
