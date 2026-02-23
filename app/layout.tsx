import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "Twill Mini CRM",
  description: "Mini CRM",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
