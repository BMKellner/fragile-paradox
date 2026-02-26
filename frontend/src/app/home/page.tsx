import dynamic from "next/dynamic";
import Header from "@/components/Header";
import HeroSection from "@/components/home/HeroSection";

const HomeSections = dynamic(() => import("@/components/home/HomeSections"), {
  loading: () => (
    <section className="container-base py-10 sm:py-14">
      <div className="home-surface-panel animate-pulse h-[220px]" />
    </section>
  ),
});

export default function MarketingHomePage() {
  return (
    <div className="home-theme soft-surface min-h-screen relative">
      <div className="floating-orb floating-orb-1" aria-hidden />
      <div className="floating-orb floating-orb-2" aria-hidden />
      <Header currentPage="home" />
      <main className="overflow-x-clip">
        <HeroSection primaryHref="/dashboard" secondaryHref="/templates" />
        <HomeSections ctaHref="/dashboard" />
      </main>
    </div>
  );
}
