// Backup of the original landing page, accessible at /landing-v1.
// If the new design doesn't work out, swap src/app/page.tsx to import
// from components/landing-v1 instead of components/landing.
import Navbar from "@/components/landing-v1/Navbar";
import Hero from "@/components/landing-v1/Hero";
import Problem from "@/components/landing-v1/Problem";
import HowItWorks from "@/components/landing-v1/HowItWorks";
import Benefits from "@/components/landing-v1/Benefits";
import SocialProof from "@/components/landing-v1/SocialProof";
import Pricing from "@/components/landing-v1/Pricing";
import FAQ from "@/components/landing-v1/FAQ";
import FinalCTA from "@/components/landing-v1/FinalCTA";
import Footer from "@/components/landing-v1/Footer";

export default function LandingV1() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <Problem />
        <HowItWorks />
        <Benefits />
        <FAQ />
        <FinalCTA />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
