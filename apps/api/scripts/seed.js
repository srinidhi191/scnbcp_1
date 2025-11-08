// apps/api/scripts/seed.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

(async () => {
  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI missing. Put it in apps/api/.env");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);

  const { Schema, model } = mongoose;
  const Department = model("Department", new Schema({ code: String, name: String }));
  const Program = model("Program", new Schema({ code: String, name: String, departmentId: Schema.Types.ObjectId }));
  const Batch = model("Batch", new Schema({ year: String, section: String, programId: Schema.Types.ObjectId }));
  const User = model("User", new Schema({
    name: String,
    email: { type: String, unique: true },
    passwordHash: String,
    roles: [String],
    departmentId: Schema.Types.ObjectId,
    programId: Schema.Types.ObjectId,
    batchId: Schema.Types.ObjectId
  }));

  // wipe duplicates if you re-run
  await Promise.all([
    User.deleteMany({ email: { $in: ["admin@college.edu","faculty@college.edu","student@college.edu"] } }),
    Department.deleteMany({ code: "CSE" }),
    Program.deleteMany({ code: "BTECH-CSE" }),
    Batch.deleteMany({ year: "2026", section: "A" }),
  ]);

  const dept = await Department.create({ code: "CSE", name: "Computer Science" });
  const prog = await Program.create({ code: "BTECH-CSE", name: "B.Tech CSE", departmentId: dept._id });
  const batch = await Batch.create({ year: "2026", section: "A", programId: prog._id });

  const hash = await bcrypt.hash("pass", 10);

  await User.create([
    { name: "Admin",   email: "admin@college.edu",   passwordHash: hash, roles: ["admin"] },
    { name: "Faculty", email: "faculty@college.edu", passwordHash: hash, roles: ["faculty"], departmentId: dept._id, programId: prog._id },
    { name: "Student", email: "student@college.edu", passwordHash: hash, roles: ["student"], departmentId: dept._id, programId: prog._id, batchId: batch._id }
  ]);

  console.log("✅ Seed data inserted successfully!");
  process.exit(0);
})();
