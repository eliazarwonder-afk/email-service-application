import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Zega Mail — Professional Business Email & Client Outreach | A product of ZegaCloud",
  description:
    "Ad-free, secure business email with verified delivery status ticks (Zoho style Sent / Delivered), AI proposal generator, cold outreach campaigns, and flat-rate pricing. A product of ZegaCloud.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem("zega-theme");
                  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                  if (stored === "dark" || (!stored && prefersDark)) {
                    document.documentElement.classList.add("dark");
                  } else {
                    document.documentElement.classList.remove("dark");
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="antialiased min-h-screen selection:bg-neutral-200 dark:selection:bg-neutral-800 bg-[#faf9f6] dark:bg-[#090a0f] text-[#121212] dark:text-[#f3f4f6]">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
