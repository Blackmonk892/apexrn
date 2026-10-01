import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ComponentTicker from "@/components/ComponentTicker";
import ExploreSection from "@/components/ExploreSection";
import PhilosophySection from "@/components/PhilosophySection";
import InstallationSection from "@/components/InstallationSection";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/context/ThemeContext";

export default function Home() {
  return (
    <ThemeProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <HeroSection />
          <ComponentTicker />
          <ExploreSection />
          <PhilosophySection />
          <InstallationSection />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
