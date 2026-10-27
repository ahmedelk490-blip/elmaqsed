import Providers from "@/components/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AfterScroll from "@/components/AfterScroll";
import CallFloat from "@/components/CallFloat";
import ContactTracker from "@/components/ContactTracker";
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
        <AfterScroll><CallFloat /></AfterScroll>
        <ContactTracker />
      </Providers>
    </ContentProvider>
  );
}
