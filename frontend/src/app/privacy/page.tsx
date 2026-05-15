import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-20 w-full mt-16">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">Privacy Policy</h1>
        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 space-y-6">
          <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest">Last updated: May 2026</p>
          
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">1. Data Collection</h2>
            <p>
              We collect essential personal information (Name, Phone Number, Email) to provide personalized learning experiences and handle secure subscriptions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">2. Payment Security</h2>
            <p>
              Payment information is handled by specialized PCI-compliant providers like Stripe. Ethio-Digital-Academy does not store your full credit card or bank details on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">3. Tracking & Analytics</h2>
            <p>
              We use video streaming metrics and quiz activity logs to improve course delivery and provide academic insights to instructors.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">4. Your Rights</h2>
            <p>
              You have the right to access your academic data, request deletion of your account, and opt-out of marketing communications at any time.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
