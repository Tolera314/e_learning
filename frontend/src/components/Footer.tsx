import Link from "next/link";
import { BookOpen, Twitter, Facebook, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="bg-emerald-600 p-2 rounded-lg text-white">
                <BookOpen size={24} />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
                Ethio<span className="text-emerald-600">Digital</span>Academy
              </span>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-sm">
              The premier subscription-based digital learning platform dedicated to the Ethiopian education ecosystem. Learn seamlessly, grow limitlessly.
            </p>
            <div className="flex gap-4 text-gray-400 hover:text-emerald-500 transition-colors">
              <a href="#" className="hover:text-emerald-500"><Twitter size={20} /></a>
              <a href="#" className="hover:text-emerald-500"><Facebook size={20} /></a>
              <a href="#" className="hover:text-emerald-500"><Instagram size={20} /></a>
              <a href="#" className="hover:text-emerald-500"><Linkedin size={20} /></a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-6">Segments</h4>
            <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="/programs/kg-g5" className="hover:text-emerald-500 transition-colors">KG – Grade 5</Link></li>
              <li><Link href="/programs/g6-g12" className="hover:text-emerald-500 transition-colors">Grade 6 – 12</Link></li>
              <li><Link href="/programs/university" className="hover:text-emerald-500 transition-colors">University / College</Link></li>
              <li><Link href="/programs/trial" className="hover:text-emerald-500 transition-colors">3-Day Free Trial</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="/about" className="hover:text-emerald-500 transition-colors">About Us</Link></li>
              <li><Link href="/instructors" className="hover:text-emerald-500 transition-colors">Become an Instructor</Link></li>
              <li><Link href="/contact" className="hover:text-emerald-500 transition-colors">Contact Support</Link></li>
              <li><Link href="/partnerships" className="hover:text-emerald-500 transition-colors">School Partnerships</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-6">Legal & Payments</h4>
            <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
              <li><Link href="/privacy" className="hover:text-emerald-500 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-emerald-500 transition-colors">Terms of Service</Link></li>
              <li className="flex items-center gap-2 mt-6">
                <span className="w-10 h-6 bg-gray-200 dark:bg-gray-800 rounded flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-400">TELE</span>
                <span className="w-10 h-6 bg-gray-200 dark:bg-gray-800 rounded flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-400">CBE</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} Ethio-Digital-Academy. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Optimized for Ethiopia 🇪🇹</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
