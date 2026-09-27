import Providers from "@/components/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Cursor from "@/components/Cursor";
import { ContentProvider } from "@/components/ContentProvider";
import { getContent } from "@/lib/content";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const content = await getContent();
  return (
    <ContentProvider value={content}>
      <Providers>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppFloat />
        <Cursor />
      </Providers>
    </ContentProvider>
  );
}
