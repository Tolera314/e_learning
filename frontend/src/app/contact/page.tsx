import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-20 w-full mt-16 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6">Contact Support</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          We're here to help! If you have any questions or run into any issues, please reach out to us.
        </p>
        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm text-left">
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input type="text" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl bg-transparent dark:text-white" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl bg-transparent dark:text-white" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
              <textarea rows={4} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl bg-transparent dark:text-white" placeholder="How can we help?"></textarea>
            </div>
            <button type="button" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-colors">
              Send Message
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
