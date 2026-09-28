import type { Metadata } from "next";
import { Cormorant_Garamond, Alexandria } from "next/font/google";
import "flag-icons/css/flag-icons.min.css";
import "./globals.css";
import { getContent } from "@/lib/content";

// Alexandria: one geometric Arabic family for the whole site (closest free match to the brand's Co Headline)
const alex = Alexandria({ variable: "--font-alex", subsets: ["arabic", "latin"], weight: ["300", "400", "500", "600", "700", "800"] });
const serif = Cormorant_Garamond({ variable: "--font-serif", subsets: ["latin"], weight: ["500", "600"] });

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getContent();
  let base: URL | undefined;
  try { base = new URL(site.url); } catch { base = undefined; }
  return {
    metadataBase: base,
    title: { default: `${site.name} | استشارات تأشيرات السفر`, template: `%s | ${site.name}` },
    description: site.description,
    openGraph: { title: `${site.name} ${site.nameEn}`, description: site.description, locale: "ar_SA", type: "website", siteName: site.name },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${serif.variable} ${alex.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <noscript><style>{`[data-r],[data-h],.hero-title,.split-h{opacity:1}`}</style></noscript>
        {children}
      </body>
    </html>
  );
}
