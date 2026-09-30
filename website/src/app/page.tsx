import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PhoneStorySection from "@/components/PhoneStorySection";
import CodeSection from "@/components/CodeSection";
import ComponentShowcase from "@/components/ComponentShowcase";
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
          <PhoneStorySection />
          <CodeSection />
          <ComponentShowcase />
          <PhilosophySection />
          <InstallationSection />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
