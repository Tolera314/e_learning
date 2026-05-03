import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-20 w-full mt-16">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6">Terms of Service</h1>
        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400">
          <p>Last updated: May 2026</p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Ethio-Digital-Academy website, you agree to be bound by these Terms of Service and all applicable laws and regulations.
          </p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">2. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials (information or software) on Ethio-Digital-Academy's website for personal, non-commercial transitory viewing only.
          </p>
          {/* More placeholder text can go here */}
        </div>
      </main>
      <Footer />
    </div>
  );
}
