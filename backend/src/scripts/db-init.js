import "dotenv/config";
import mongoose  from "mongoose";
import bcrypt    from "bcryptjs";

import { connectDB }  from "../config/db.js";
import User           from "../models/User.js";
import Profile        from "../models/Profile.js";
import JobApplication from "../models/JobApplication.js";

const DROP_DB       = process.env.DROP_DB === "true";
const DEMO_EMAIL    = "demo@jobtracker.dev";
const DEMO_PASSWORD = "Demo@1234!";


async function main() {
  console.log("═══════════════════════════════════════════");
  console.log("  Job Tracker — MongoDB Seed Script");
  console.log(`  Mode        : ${DROP_DB ? "DROP + RESEED" : "SAFE SEED"}`);
  console.log("═══════════════════════════════════════════\n");

  await connectDB();

  if (DROP_DB) {
    await dropCollections();
  }

  await seedDemoData();

  await mongoose.disconnect();
  console.log("\n✅  Done. MongoDB connection closed.\n");
  process.exit(0);
}

async function dropCollections() {
  console.log("🗑️   Dropping collections...");
  const collections = ["users", "profiles", "jobapplications"];

  for (const name of collections) {
    try {
      await mongoose.connection.dropCollection(name);
      console.log(`   dropped: ${name}`);
    } catch (err) {
      if (err.code !== 26) throw err;
      console.log(`   skipped: ${name} (does not exist)`);
    }
  }
  console.log();
}

async function seedDemoData() {
  console.log("🌱  Seeding demo data...\n");

  const existing = await User.findOne({ email: DEMO_EMAIL });
  if (existing) {
    console.log("ℹ️   Demo user already exists — skipping seed.");
    console.log("    Run `npm run db:drop` to wipe and reseed.\n");
    return;
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const user = await User.create({ email: DEMO_EMAIL, passwordHash });
  console.log(`   👤  User created        : ${user.email} (${user._id})`);

  const profile = await Profile.create({
    userId:      user._id,
    firstName:   "Jane",
    lastName:    "Doe",
    phone:       "+1-555-000-0000",
    githubUrl:   "https://github.com/janedoe",
    linkedinUrl: "https://linkedin.com/in/janedoe",
    resumeText:  [
      "Jane Doe | Full-Stack Software Engineer",
      "Skills: React, Node.js, PostgreSQL, MongoDB, AWS, Docker, TypeScript, REST APIs, GraphQL",
      "",
      "Experience:",
      "Acme Corp — Software Engineer II (July 2020 – Present)",
      "Built and maintained React + Node.js micro-services serving 500k MAU.",
      "Led migration from monolith to micro-services, reducing p99 latency by 40%.",
      "Implemented CI/CD pipeline with GitHub Actions + AWS ECS.",
      "",
      "Education:",
      "State University — B.Sc. Computer Science (2016–2020), GPA 3.8",
      "",
      "Certifications:",
      "AWS Certified Solutions Architect – Associate (2022)",
    ].join("\n"),

    qualifications: [
      {
        type:        "EDUCATION",
        institution: "State University",
        major:       "B.Sc. Computer Science",
        startDate:   new Date("2016-09-01"),
        endDate:     new Date("2020-05-31"),
        gpa:         3.8,
      },
      {
        type:        "CERTIFICATION",
        institution: "Amazon Web Services",
        major:       "AWS Certified Solutions Architect – Associate",
        startDate:   new Date("2022-03-01"),
        endDate:     new Date("2025-03-01"),
      },
    ],

    experiences: [
      {
        company:     "Acme Corp",
        role:        "Software Engineer II",
        startDate:   new Date("2020-07-01"),
        endDate:     null, // current role
        description: "Built and maintained React + Node.js micro-services serving 500k MAU. Led migration from monolith to micro-services, reducing p99 latency by 40%. Implemented CI/CD pipeline with GitHub Actions + AWS ECS.",
        skillsUsed:  ["React", "Node.js", "PostgreSQL", "AWS", "Docker", "TypeScript", "GitHub Actions"],
      },
      {
        company:     "StartupXYZ",
        role:        "Junior Frontend Developer",
        startDate:   new Date("2019-06-01"),
        endDate:     new Date("2020-06-30"),
        description: "Developed customer-facing React dashboards. Integrated Stripe payments and Twilio SMS notifications.",
        skillsUsed:  ["React", "JavaScript", "Stripe", "Twilio", "CSS"],
      },
    ],
  });
  console.log(`   📋  Profile created      : ${profile.firstName} ${profile.lastName} (${profile._id})`);
  console.log(`       Qualifications       : ${profile.qualifications.length}`);
  console.log(`       Experiences          : ${profile.experiences.length}`);

  const applications = await JobApplication.insertMany([
    {
      userId:            user._id,
      companyName:       "Stripe",
      jobTitle:          "Senior Software Engineer, Payments Infrastructure",
      jobUrl:            "https://stripe.com/jobs/listing/123",
      rawJobDescription: "We are looking for a senior engineer to join our Payments Infrastructure team. You will build systems that process billions of dollars daily. Strong distributed systems, Go, Java, and React knowledge required. Experience with high-throughput event-driven architectures and on-call rotations expected.",
      status:            "WISHLIST",
      salaryExpectation: 18000000, 
      notes:             "Dream company — referral through LinkedIn contact.",
    },
    {
      userId:            user._id,
      companyName:       "Vercel",
      jobTitle:          "Full-Stack Engineer",
      jobUrl:            "https://vercel.com/careers/456",
      rawJobDescription: "Join the Vercel team to build the future of frontend deployment. You will work on Next.js, our global edge network, and developer tooling. React, TypeScript, and Rust experience preferred. Remote-friendly.",
      status:            "APPLIED",
      salaryExpectation: 15000000, 
      appliedDate:       new Date(),
      notes:             "Applied via careers page. Received auto-confirmation email.",
      aiAnalysis: {
        matchScore:       72,
        missingKeywords:  ["TypeScript", "Edge Computing", "Rust", "Next.js App Router"],
        dos: [
          "Add a dedicated TypeScript section — highlight any TS migration work at Acme.",
          "Mention the CI/CD pipeline as an example of DevOps / edge deployment experience.",
          "Quantify the 500k MAU claim with specific uptime or latency metrics.",
          "Add a 'Next.js' project to your GitHub and link it in the application.",
        ],
        donts: [
          "Remove the StartupXYZ Twilio project — it's irrelevant to a deployment platform role.",
          "Avoid listing 'REST APIs' as a skill without context — it reads as filler.",
        ],
        tailoringSuggestions: "Rewrite the Acme bullet from 'Led migration from monolith to micro-services' to 'Architected and shipped a micro-service decomposition that reduced p99 latency by 40% — directly comparable to Vercel's edge function routing work.\n\nChange 'Implemented CI/CD pipeline' to 'Designed a zero-downtime GitHub Actions + AWS ECS deployment pipeline, mirroring Vercel's own build and deploy infrastructure.'",
        analyzedAt: new Date(),
      },
    },
    {
      userId:            user._id,
      companyName:       "Figma",
      jobTitle:          "Software Engineer, Collaboration Infrastructure",
      jobUrl:            "https://figma.com/careers/789",
      rawJobDescription: "Build the real-time collaboration infrastructure powering Figma. You'll work on CRDTs, WebSockets, and Operational Transform algorithms. Strong computer science fundamentals and experience with highly concurrent systems required.",
      status:            "INTERVIEWING",
      salaryExpectation: 19500000,
      appliedDate:       new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
      notes:             "Passed phone screen. Technical loop scheduled for next week.",
    },
    {
      userId:      user._id,
      companyName: "Outdated Startup Inc.",
      jobTitle:    "PHP Developer",
      status:      "REJECTED",
      notes:       "No response after 3 follow-ups.",
    },
  ]);

  console.log(`\n   📨  Job applications     : ${applications.length} created`);
  applications.forEach((app) => {
    const analysis = app.aiAnalysis ? ` [AI score: ${app.aiAnalysis.matchScore}]` : "";
    console.log(`       • [${app.status.padEnd(12)}] ${app.companyName} — ${app.jobTitle}${analysis}`);
  });

  console.log(`\n─────────────────────────────────────────────`);
  console.log(`   Demo credentials`);
  console.log(`   Email    : ${DEMO_EMAIL}`);
  console.log(`   Password : ${DEMO_PASSWORD}`);
  console.log(`─────────────────────────────────────────────`);
}

main().catch((err) => {
  console.error("❌  Seed script failed:", err);
  process.exit(1);
});
