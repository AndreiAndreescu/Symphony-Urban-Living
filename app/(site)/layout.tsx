import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { MobileReserveBar } from "@/components/site/MobileReserveBar";
import { RestaurantJsonLd } from "@/components/site/RestaurantJsonLd";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { getBookingSettings } from "@/lib/settings";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getBookingSettings();
  return (
    <MotionProvider>
      <RestaurantJsonLd settings={settings} />
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer settings={settings} />
      <MobileReserveBar />
    </MotionProvider>
  );
}
