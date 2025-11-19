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

        <div className="container-max mx-auto px-4 py-24 text-center">
          <motion.h1
            className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            SCNBCP — <span className="text-indigo-600">Connecting Campus Smarter</span>
          </motion.h1>
          <motion.p
            className="mt-4 text-muted max-w-2xl mx-auto text-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            One place for notices, departments, and students — real-time, organized, and mobile-friendly. Built for quick announcements, targeted distribution, and easy acknowledgements.
          </motion.p>

          <motion.div
            className="mt-8 flex items-center justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/signup" className="btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Get Started
            </Link>
            <Link to="/login" className="px-5 py-2 rounded-lg border hover:shadow-sm">
              Login
            </Link>
          </motion.div>

          {/* Feature row */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="card p-6 text-left">
              <h4 className="font-semibold">Real-time delivery</h4>
              <p className="muted mt-2">Instant notifications via websockets to keep students and staff informed.</p>
            </div>
            <div className="card p-6 text-left">
              <h4 className="font-semibold">Targeted audiences</h4>
              <p className="muted mt-2">Send notices to whole campus, departments, programs, or individual users.</p>
            </div>
            <div className="card p-6 text-left">
              <h4 className="font-semibold">Email & audit</h4>
              <p className="muted mt-2">Automatic email notifications and acknowledgement tracking for compliance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="container-max mx-auto px-4 py-12 grid md:grid-cols-3 gap-6">
        {[
          { t: "Admins", d: "Manage users and publish campus-wide notices." },
          { t: "Faculty", d: "Create department notices. Edit or remove your posts." },
          { t: "Students", d: "View relevant notices, filter by category, and search." }
        ].map((c, i) => (
          <Link key={i} to="/login" className="block">
            <motion.div
              className="card p-6 hover:shadow-lg transform hover:-translate-y-1 transition"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 * i }}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-600">{c.t[0]}</div>
                <h3 className="font-semibold text-lg">{c.t}</h3>
              </div>
              <p className="muted mt-3">{c.d}</p>
              <div className="mt-4 text-sm text-indigo-600">Click to login</div>
            </motion.div>
          </Link>
        ))}
      </section>

      {/* CTA */}
      <section className="container-max mx-auto px-4 pb-16 text-center">
        <div className="card p-8">
          <h3 className="text-xl font-semibold">Ready to join?</h3>
          <p className="muted mt-2">Create your account and start posting or viewing notices.</p>
          <div className="mt-5 flex gap-3 justify-center">
            <Link to="/login" className="btn-primary">Join Now</Link>
            <a href="#top" className="px-4 py-2 rounded-lg border hover:shadow-sm">Learn more</a>
          </div>
        </div>
      </section>
    </div>
  );
}
