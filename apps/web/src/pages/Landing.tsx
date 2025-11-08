import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="h-[420px] bg-gradient-to-br from-sky-100 via-white to-indigo-100"
          />
          <motion.div
            className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-sky-200/60 blur-3xl"
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-indigo-200/60 blur-3xl"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <motion.h1
            className="text-4xl sm:text-5xl font-extrabold tracking-tight"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            SCNBCP — <span className="text-sky-600">Connecting Campus Smarter</span>
          </motion.h1>
          <motion.p
            className="mt-4 text-slate-600 max-w-2xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            One place for notices, departments, and students — real-time, organized, and mobile-friendly.
          </motion.p>
          <motion.div
            className="mt-8 flex items-center justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/signup" className="px-5 py-2 rounded-lg bg-sky-600 text-white">
              Get Started
            </Link>
            <Link to="/login" className="px-5 py-2 rounded-lg border">
              Login
            </Link>
          </motion.div>
        </div>
      </section>

      {/* About */}
      <section className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-6">
        {[
          { t: "Admins", d: "Manage users and publish campus-wide notices." },
          { t: "Faculty", d: "Create department notices. Edit or remove your posts." },
          { t: "Students", d: "View relevant notices, filter by category, and search." }
        ].map((c, i) => (
          <motion.div
            key={i}
            className="rounded-2xl border bg-white p-6 shadow-sm"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 * i }}
          >
            <h3 className="font-semibold text-lg">{c.t}</h3>
            <p className="text-slate-600 mt-2">{c.d}</p>
          </motion.div>
        ))}
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 pb-16 text-center">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <h3 className="text-xl font-semibold">Ready to join?</h3>
          <p className="text-slate-600 mt-2">Create your account and start posting or viewing notices.</p>
          <div className="mt-5 flex gap-3 justify-center">
            <Link to="/signup" className="px-4 py-2 rounded-lg bg-sky-600 text-white">Join Now</Link>
            <a href="#top" className="px-4 py-2 rounded-lg border">Learn more</a>
          </div>
        </div>
      </section>
    </div>
  );
}
