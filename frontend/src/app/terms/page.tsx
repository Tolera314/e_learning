import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-20 w-full mt-16">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">Terms of Service</h1>
        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 space-y-6">
          <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest">Effective Date: May 2026</p>
          
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Ethio-Digital-Academy, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">2. Subscription & Payments</h2>
            <p>
              Access to core course content requires an active subscription. We offer monthly and yearly plans. Payments are processed securely via local partners (Telebirr, CBE Birr) and international providers (Stripe). Subscriptions renew automatically unless cancelled via the billing dashboard.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">3. User Conduct</h2>
            <p>
              Users are prohibited from sharing account credentials, scraping platform data, or uploading malicious content. Ethio-Digital-Academy reserves the right to suspend accounts that violate academic integrity or engage in fraudulent activities.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">4. Intellectual Property</h2>
            <p>
              All course materials, videos, and platform code are the property of Ethio-Digital-Academy or its contributing instructors. Unauthorized distribution is strictly prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">5. Limitation of Liability</h2>
            <p>
              Ethio-Digital-Academy provides educational services "as is." We do not guarantee specific academic results or continuous uptime during maintenance windows.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
