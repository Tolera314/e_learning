import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-20 w-full mt-16">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6">About Us</h1>
        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400">
          <p className="text-lg">
            Ethio-Digital-Academy is the premier digital learning platform dedicated to the Ethiopian education ecosystem. We provide a comprehensive curriculum ranging from KG to University level.
          </p>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Our Mission</h2>
          <p>
            To democratize high-quality education across Ethiopia by leveraging modern technology, empowering students and educators alike.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
