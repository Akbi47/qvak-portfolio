import { ThemeProvider } from "@/features/theme/theme-provider";
import { ThemeScript } from "@/features/theme/theme-script";

import "@/styles/globals.css";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-theme="light" lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
