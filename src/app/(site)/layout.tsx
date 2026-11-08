import Providers from "@/components/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AfterScroll from "@/components/AfterScroll";
import CallFloat from "@/components/CallFloat";
import ContactTracker from "@/components/ContactTracker";
import { ContentProvider } from "@/components/ContentProvider";
import { getLocalContent } from "@/lib/content";
import { getLang } from "@/lib/i18n";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [content, lang] = await Promise.all([getLocalContent(), getLang()]);
  return (
    <ContentProvider value={content} lang={lang}>
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
