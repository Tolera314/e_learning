import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PartnershipsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-20 w-full mt-16 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6">School Partnerships</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Partner with Ethio-Digital-Academy to bring world-class digital learning infrastructure to your institution.
        </p>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Why Partner With Us?</h2>
          <ul className="text-left space-y-4 text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              Comprehensive curriculum alignment
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              Advanced student analytics and tracking
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              Dedicated support and training for your educators
            </li>
          </ul>
        </div>
        <button className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-3 px-8 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm">
          Request Partnership Details
        </button>
      </main>
      <Footer />
    </div>
  );
}
