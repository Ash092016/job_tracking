import "dotenv/config";
import mongoose  from "mongoose";
import bcrypt    from "bcryptjs";

import { connectDB }  from "../config/db.js";
import User           from "../models/User.js";
import Profile        from "../models/Profile.js";
import JobApplication from "../models/JobApplication.js";

const DROP_DB    = process.env.DROP_DB === "true";
const DEMO_EMAIL = "candidate@jobtracker.dev";
const DEMO_PASS  = "Candidate@1234!";

async function main() {
  console.log("════════════════════════════════════════════");
  console.log("  Job Tracker — DB Seed Script");
  console.log(`  Mode     : ${DROP_DB ? "⚠️  DROP + RESEED" : "SAFE SEED"}`);
  console.log("════════════════════════════════════════════\n");

  await connectDB();

  if (DROP_DB) {
    await dropCollections();
  }

  await seedCandidate();

  await mongoose.disconnect();
  console.log("\n✅  Done. Connection closed.\n");
  process.exit(0);
}

async function dropCollections() {
  console.log("🗑️   Dropping collections...");

  const targets = ["users", "profiles", "jobapplications"];

  for (const name of targets) {
    try {
      await mongoose.connection.dropCollection(name);
      console.log(`   ✓  dropped: ${name}`);
    } catch (err) {
      if (err.code === 26) {
        console.log(`   –  skipped: ${name} (does not exist)`);
      } else {
        throw err;
      }
    }
  }
  console.log();
}

async function seedCandidate() {
  console.log("🌱  Seeding dummy candidate...\n");

  const existing = await User.findOne({ email: DEMO_EMAIL });
  if (existing) {
    console.log("ℹ️   Candidate already exists — skipping.");
    console.log("    Run `npm run db:drop` to wipe and reseed.\n");
    return;
  }

  const passwordHash = await bcrypt.hash(DEMO_PASS, 12);
  const user = await User.create({ email: DEMO_EMAIL, passwordHash });
  console.log(`   👤  User          : ${user.email}`);
  console.log(`       _id           : ${user._id}`);

  const profile = await Profile.create({
    userId:      user._id,
    firstName:   "Alex",
    lastName:    "Candidate",
    phone:       "+1-555-123-4567",
    githubUrl:   "https://github.com/alexcandidate",
    linkedinUrl: "https://linkedin.com/in/alexcandidate",

    resumeText: [
      "Alex Candidate | Full-Stack Software Engineer",
      "Skills: React, Node.js, Express, MongoDB, PostgreSQL, REST APIs, Docker, AWS, Git",
      "",
      "Experience:",
      "TechStartup Inc. — Software Engineer (Jan 2021 – Present)",
      "Built React dashboards and Node.js REST APIs serving 200k monthly active users.",
      "Reduced API response time by 35% through query optimisation and Redis caching.",
      "Led a team of 3 engineers to migrate from a monolith to a micro-service architecture.",
      "",
      "CodeAgency LLC — Junior Developer (Jun 2019 – Dec 2020)",
      "Delivered 12 client projects using React, Express, and MySQL.",
      "Integrated third-party APIs including Stripe, Twilio, and Google Maps.",
      "",
      "Education:",
      "State University — B.Sc. Computer Science, 2019, GPA: 3.6",
      "",
      "Certifications:",
      "AWS Certified Developer – Associate (2022)",
    ].join("\n"),

    qualifications: [
      {
        type:        "EDUCATION",
        institution: "State University",
        major:       "B.Sc. Computer Science",
        startDate:   new Date("2015-09-01"),
        endDate:     new Date("2019-05-15"),
        gpa:         3.6,
      },
      {
        type:        "CERTIFICATION",
        institution: "Amazon Web Services",
        major:       "AWS Certified Developer – Associate",
        startDate:   new Date("2022-06-01"),
        endDate:     new Date("2025-06-01"),
      },
    ],

    experiences: [
      {
        company:     "TechStartup Inc.",
        role:        "Software Engineer",
        startDate:   new Date("2021-01-15"),
        endDate:     null, 
        description: "Built and maintained React dashboards and Node.js REST APIs serving 200k MAU. Reduced API response time by 35% via query optimisation and Redis caching. Led team of 3 in monolith-to-microservices migration.",
        skillsUsed:  ["React", "Node.js", "Express", "MongoDB", "Redis", "Docker", "AWS"],
      },
      {
        company:     "CodeAgency LLC",
        role:        "Junior Developer",
        startDate:   new Date("2019-06-01"),
        endDate:     new Date("2020-12-31"),
        description: "Delivered 12 client projects using React, Express, and MySQL. Integrated Stripe, Twilio, and Google Maps APIs.",
        skillsUsed:  ["React", "Express", "MySQL", "Stripe", "JavaScript"],
      },
    ],
  });
  console.log(`\n   📋  Profile       : ${profile.firstName} ${profile.lastName}`);
  console.log(`       Qualifications : ${profile.qualifications.length}`);
  console.log(`       Experiences    : ${profile.experiences.length}`);

  const apps = await JobApplication.insertMany([
    {
      userId:            user._id,
      companyName:       "Stripe",
      jobTitle:          "Senior Software Engineer – Payments Infrastructure",
      jobUrl:            "https://stripe.com/jobs/listing/demo-1",
      rawJobDescription: "Join Stripe's Payments Infrastructure team. Build systems processing billions of dollars daily. Requirements: distributed systems expertise, Go or Java, React, strong CS fundamentals, experience with high-throughput event-driven architectures.",
      status:            "WISHLIST",
      salaryExpectation: 18000000,   
      notes:             "Top target. Referral from LinkedIn contact pending.",
    },
    {
      userId:            user._id,
      companyName:       "Vercel",
      jobTitle:          "Full-Stack Engineer",
      jobUrl:            "https://vercel.com/careers/demo-2",
      rawJobDescription: "Help build the future of frontend deployment at Vercel. Work on Next.js, our edge network, and developer tooling. TypeScript, React, and infrastructure experience preferred. Remote-friendly position.",
      status:            "APPLIED",
      salaryExpectation: 15000000,   
      appliedDate:       new Date(),
      notes:             "Application submitted. Awaiting recruiter response.",
      aiAnalysis: {
        matchScore:       68,
        missingKeywords:  ["TypeScript", "Next.js", "Edge Runtime", "Rust", "Infrastructure as Code"],
        dos: [
          "Add TypeScript to your skills — highlight any TS migration work at TechStartup.",
          "Build and link a Next.js project on GitHub before the interview.",
          "Quantify the 200k MAU claim with specific uptime SLA or latency metrics.",
          "Mention Docker and AWS as edge/deployment experience.",
        ],
        donts: [
          "Remove the Twilio and Google Maps integrations — irrelevant to a deployment platform.",
          "Avoid generic phrases like 'delivered client projects' — replace with measurable outcomes.",
        ],
        tailoringSuggestions: `Rewrite "Built React dashboards and Node.js REST APIs serving 200k MAU" to "Architected and shipped a React + Node.js platform serving 200k MAU with 99.9% uptime — directly comparable to Vercel's deployment reliability requirements."\n\nChange "Led team of 3 in monolith-to-microservices migration" to "Led a 3-engineer decomposition of a monolith into independently deployable services, reducing deploy risk — mirroring Vercel's own edge function architecture."`,
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
      appliedDate:       new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), 
      notes:             "Passed phone screen. Technical loop scheduled for next week.",
    },
    {
      userId:            user._id,
      companyName:       "Linear",
      jobTitle:          "Software Engineer – Frontend",
      status:            "WISHLIST",
      salaryExpectation: 14000000,   
      notes:             "Found via Twitter. Worth applying — strong product culture.",
    },
    {
      userId:      user._id,
      companyName: "Outdated Startup Inc.",
      jobTitle:    "PHP Developer",
      status:      "REJECTED",
      notes:       "No response after 3 follow-ups.",
    },
  ]);

  console.log(`\n   📨  Applications  : ${apps.length} created`);
  apps.forEach((a) => {
    const salary  = a.salaryExpectation ? `$${(a.salaryExpectation / 100).toLocaleString()}` : "—";
    const aiFlag  = a.aiAnalysis ? ` [AI ✓ score: ${a.aiAnalysis.matchScore}]` : "";
    console.log(`       • [${a.status.padEnd(12)}]  ${a.companyName.padEnd(20)} ${salary}${aiFlag}`);
  });

  console.log(`\n   ─────────────────────────────────────────`);
  console.log(`   Smoke test credentials`);
  console.log(`   Email    : ${DEMO_EMAIL}`);
  console.log(`   Password : ${DEMO_PASS}`);
  console.log(`   ─────────────────────────────────────────`);
}

main().catch((err) => {
  console.error("\n❌  Seed script failed:", err.message);
  process.exit(1);
});
