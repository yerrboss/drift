import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Drift — Seoul Travel Dashboard",
  description: "A chic minimalist itinerary planner for visitors in Seoul.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
