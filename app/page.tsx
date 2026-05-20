import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-yellow-50">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b bg-white">
        <h1 className="text-2xl font-bold text-yellow-600">
          Sticky Notes
        </h1>

        <div className="flex gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg border hover:bg-gray-100 transition"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-500 transition font-medium"
          >
            Register
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24">
        <div className="max-w-2xl">
          <h2 className="text-5xl font-bold leading-tight text-gray-800">
            Organize Your Ideas
            <span className="text-yellow-500"> Effortlessly</span>
          </h2>

          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            Create personal sticky notes, search instantly,
            and manage your thoughts in one clean place.
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 transition font-semibold"
            >
              Get Started
            </Link>

            <Link
              href="/login"
              className="px-6 py-3 rounded-xl border hover:bg-gray-100 transition"
            >
              Login
            </Link>
          </div>
        </div>

        {/* Sticky Preview */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="w-64 h-64 bg-yellow-200 rounded-2xl shadow-lg rotate-[-3deg] p-5 text-left">
            <h3 className="font-bold text-lg">
              Shopping List
            </h3>

            <p className="mt-3 text-gray-700">
              - Milk
              <br />
              - Keyboard
              <br />
              - Monitor
            </p>
          </div>

          <div className="w-64 h-64 bg-pink-200 rounded-2xl shadow-lg rotate-[2deg] p-5 text-left">
            <h3 className="font-bold text-lg">
              Project Ideas
            </h3>

            <p className="mt-3 text-gray-700">
              Build a personal notes app using Next.js and
              Supabase.
            </p>
          </div>

          <div className="w-64 h-64 bg-green-200 rounded-2xl shadow-lg rotate-[-2deg] p-5 text-left">
            <h3 className="font-bold text-lg">
              Reminder
            </h3>

            <p className="mt-3 text-gray-700">
              Finish React practice before weekend.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}