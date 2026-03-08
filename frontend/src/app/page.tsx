import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SessionRedirect from "@/components/SessionRedirect";
import KeyBenefits from "@/components/KeyBenefits";
import Segments from "@/components/Segments";
import FeaturedCourses from "@/components/FeaturedCourses";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import InstructorCTA from "@/components/InstructorCTA";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import LanguageSupport from "@/components/LanguageSupport";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      <SessionRedirect />
      <Navbar />
      <Hero />
      <KeyBenefits />
      <Segments />
      <FeaturedCourses />
      <HowItWorks />
      <Features />
      <InstructorCTA />
      <Testimonials />
      <Pricing />
      <LanguageSupport />
      <FinalCTA />
      <Footer />
    </main>
  );
}
