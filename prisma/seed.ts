import "dotenv/config";
import ws from "ws";
import { neonConfig } from "@neondatabase/serverless";
import {
  PrismaClient,
  ContentStatus,
  Frequency,
  OrgCategory,
} from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

// Required for Neon serverless driver in Node.js (not needed on Vercel edge)
neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Seed dates relative to today
const today = new Date();
const d = (daysFromNow: number, hour: number, minute = 0) => {
  const dt = new Date(today);
  dt.setDate(dt.getDate() + daysFromNow);
  dt.setHours(hour, minute, 0, 0);
  return dt;
};

async function main() {
  console.log("Seeding...");

  // ── Admin user (editorial team) ──────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@jam.meanjin" },
    update: {},
    create: {
      id: "seed-admin",
      name: "JAM Admin",
      email: "admin@jam.meanjin",
      emailVerified: true,
      role: "ADMIN",
    },
  });

  // ── Instruments ───────────────────────────────────────────────────────────
  const instrumentNames = [
    "bass",
    "guitar",
    "piano",
    "drums",
    "trumpet",
    "saxophone",
    "trombone",
    "vocals",
    "synth",
    "violin",
    "flute",
    "double bass",
  ];
  const instruments = await Promise.all(
    instrumentNames.map((name) =>
      prisma.instrument.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );
  const instrMap = Object.fromEntries(instruments.map((i) => [i.name, i]));

  // ── Tags ──────────────────────────────────────────────────────────────────
  const tagDefs = [
    { name: "sit-in-welcome", label: "Sit-in welcome" },
    { name: "modern-jazz", label: "Modern jazz" },
    { name: "hard-bop", label: "Hard bop" },
    { name: "free-jazz", label: "Free jazz" },
    { name: "nu-jazz", label: "Nu-jazz" },
    { name: "trad-jazz", label: "Trad jazz" },
    { name: "big-band", label: "Big band" },
    { name: "instrumental", label: "Instrumental" },
    { name: "vocal", label: "Vocal" },
    { name: "student-friendly", label: "Student friendly" },
    { name: "all-ages", label: "All ages" },
    { name: "free-entry", label: "Free entry" },
    { name: "bar", label: "Bar" },
    { name: "outdoor", label: "Outdoor" },
    { name: "latin", label: "Latin" },
    { name: "funk", label: "Funk" },
    { name: "soul", label: "Soul" },
    { name: "experimental", label: "Experimental" },
    { name: "improvised", label: "Improvised" },
    { name: "late-night", label: "Late night" },
    { name: "residency", label: "Residency" },
    { name: "original-music", label: "Original music" },
    { name: "standards", label: "Standards" },
    { name: "intimate-venue", label: "Intimate venue" },
    { name: "licensed", label: "Licensed" },
    { name: "seated", label: "Seated" },
    { name: "standing", label: "Standing" },
    { name: "afrobeat", label: "Afrobeat" },
    { name: "fusion", label: "Fusion" },
  ];
  const tags = await Promise.all(
    tagDefs.map((t) =>
      prisma.tag.upsert({
        where: { name: t.name },
        update: {},
        create: t,
      }),
    ),
  );
  const tagMap = Object.fromEntries(tags.map((t) => [t.name, t]));

  // ── Venues ────────────────────────────────────────────────────────────────
  const triffid = await prisma.venue.upsert({
    where: { slug: "the-triffid" },
    update: {},
    create: {
      name: "The Triffid",
      slug: "the-triffid",
      address: "Stratton St, Newstead QLD 4006",
      suburb: "Newstead",
      description:
        "A converted airline hangar turned music venue. One of Brisbane's best rooms for live jazz.",
      links: [{ label: "Website", url: "https://thetriffid.com.au" }],
      status: ContentStatus.PUBLISHED,
      createdById: admin.id,
    },
  });

  const mirrorball = await prisma.venue.upsert({
    where: { slug: "mirrorball-ministries" },
    update: {},
    create: {
      name: "Mirrorball Ministries",
      slug: "mirrorball-ministries",
      address: "Fortitude Valley QLD 4006",
      suburb: "Fortitude Valley",
      description:
        "Intimate late-night venue in the Valley. Strong on experimental and jazz-adjacent sounds.",
      status: ContentStatus.PUBLISHED,
      createdById: admin.id,
    },
  });

  const bjc = await prisma.venue.upsert({
    where: { slug: "brisbane-jazz-club" },
    update: {},
    create: {
      name: "Brisbane Jazz Club",
      slug: "brisbane-jazz-club",
      address: "1 Annie St, Kangaroo Point QLD 4169",
      suburb: "Kangaroo Point",
      description:
        "The heartbeat of Brisbane's traditional jazz scene since 1972.",
      links: [{ label: "Website", url: "https://brisbanejazzclub.com.au" }],
      status: ContentStatus.PUBLISHED,
      createdById: admin.id,
    },
  });

  const joynt = await prisma.venue.upsert({
    where: { slug: "the-joynt" },
    update: {},
    create: {
      name: "The Joynt",
      slug: "the-joynt",
      address: "West End QLD 4101",
      suburb: "West End",
      description:
        "Neighbourhood bar in West End. Casual, friendly, and reliably good music.",
      status: ContentStatus.PUBLISHED,
      createdById: admin.id,
    },
  });

  // ── People ────────────────────────────────────────────────────────────────
  const liv = await prisma.person.upsert({
    where: { slug: "liv-marlton" },
    update: {},
    create: {
      name: "Liv Marlton",
      slug: "liv-marlton",
      bio: "Saxophonist and bandleader. Runs the weekly session at Mirrorball.",
      createdById: admin.id,
    },
  });
  await prisma.personInstrument.upsert({
    where: {
      personId_instrumentId: {
        personId: liv.id,
        instrumentId: instrMap["saxophone"].id,
      },
    },
    update: {},
    create: { personId: liv.id, instrumentId: instrMap["saxophone"].id },
  });

  const melody = await prisma.person.upsert({
    where: { slug: "melody-graves" },
    update: {},
    create: {
      name: "Melody Graves",
      slug: "melody-graves",
      bio: "Vocalist and pianist. Known for her work across the modern and classic jazz repertoire.",
      createdById: admin.id,
    },
  });
  for (const instr of ["vocals", "piano"]) {
    await prisma.personInstrument.upsert({
      where: {
        personId_instrumentId: {
          personId: melody.id,
          instrumentId: instrMap[instr].id,
        },
      },
      update: {},
      create: { personId: melody.id, instrumentId: instrMap[instr].id },
    });
  }

  const jordy = await prisma.person.upsert({
    where: { slug: "jordy-stitt" },
    update: {},
    create: {
      name: "Jordy Stitt",
      slug: "jordy-stitt",
      bio: "Guitarist. Plays across multiple projects in the Brisbane scene.",
      createdById: admin.id,
    },
  });
  await prisma.personInstrument.upsert({
    where: {
      personId_instrumentId: {
        personId: jordy.id,
        instrumentId: instrMap["guitar"].id,
      },
    },
    update: {},
    create: { personId: jordy.id, instrumentId: instrMap["guitar"].id },
  });

  const joel = await prisma.person.upsert({
    where: { slug: "joel-von-treifeldt" },
    update: {},
    create: {
      name: "Joel von Treifeldt",
      slug: "joel-von-treifeldt",
      bio: "Bassist. Active across jazz, improvised, and experimental music in Meanjin.",
      createdById: admin.id,
    },
  });
  await prisma.personInstrument.upsert({
    where: {
      personId_instrumentId: {
        personId: joel.id,
        instrumentId: instrMap["bass"].id,
      },
    },
    update: {},
    create: { personId: joel.id, instrumentId: instrMap["bass"].id },
  });

  // ── Projects ──────────────────────────────────────────────────────────────
  const rumblePack = await prisma.project.upsert({
    where: { slug: "rumble-pack" },
    update: {},
    create: {
      name: "Rumble Pack",
      slug: "rumble-pack",
      bio: "A loose collective of improvisers from across the Meanjin scene. Expect noise, joy, and the occasional free-jazz freakout.",
      status: ContentStatus.PUBLISHED,
      createdById: admin.id,
    },
  });
  for (const personId of [liv.id, jordy.id, joel.id]) {
    await prisma.projectMember.upsert({
      where: { projectId_personId: { projectId: rumblePack.id, personId } },
      update: {},
      create: { projectId: rumblePack.id, personId },
    });
  }

  const melodyQuartet = await prisma.project.upsert({
    where: { slug: "melody-graves-quartet" },
    update: {},
    create: {
      name: "Melody Graves Quartet",
      slug: "melody-graves-quartet",
      bio: "Melody Graves leads this quartet through a repertoire spanning classic standards and original compositions.",
      status: ContentStatus.PUBLISHED,
      createdById: admin.id,
    },
  });
  for (const { personId, role } of [
    { personId: melody.id, role: "leader" },
    { personId: jordy.id, role: null },
    { personId: joel.id, role: null },
  ]) {
    await prisma.projectMember.upsert({
      where: { projectId_personId: { projectId: melodyQuartet.id, personId } },
      update: {},
      create: { projectId: melodyQuartet.id, personId, role },
    });
  }

  const obscureOrch = await prisma.project.upsert({
    where: { slug: "obscure-orchestra" },
    update: {},
    create: {
      name: "Obscure Orchestra",
      slug: "obscure-orchestra",
      bio: "Large ensemble exploring the edges of jazz and contemporary classical. 12+ players.",
      status: ContentStatus.PUBLISHED,
      createdById: admin.id,
    },
  });

  const liveAtLivs = await prisma.project.upsert({
    where: { slug: "live-at-livs" },
    update: {},
    create: {
      name: "Live at Liv's",
      slug: "live-at-livs",
      bio: "The house band for Liv Marlton's weekly session at Mirrorball Ministries.",
      status: ContentStatus.PUBLISHED,
      createdById: admin.id,
    },
  });
  for (const personId of [liv.id, joel.id]) {
    await prisma.projectMember.upsert({
      where: { projectId_personId: { projectId: liveAtLivs.id, personId } },
      update: {},
      create: { projectId: liveAtLivs.id, personId },
    });
  }

  // ── Residency ─────────────────────────────────────────────────────────────
  const livsResidency = await prisma.residency.upsert({
    where: { slug: "live-at-livs-sundays" },
    update: {},
    create: {
      name: "Live at Liv's",
      slug: "live-at-livs-sundays",
      description:
        "Every Sunday night Liv Marlton hosts an open session at Mirrorball. The house band kicks off at 7pm and the jam runs until late. All levels welcome — bring your axe.",
      dayOfWeek: 6,
      frequency: Frequency.WEEKLY,
      startTime: "19:00",
      active: true,
      venueId: mirrorball.id,
      projectId: liveAtLivs.id,
      createdById: admin.id,
    },
  });
  await prisma.residencyTag.createMany({
    data: [
      { residencyId: livsResidency.id, tagId: tagMap["sit-in-welcome"].id },
      { residencyId: livsResidency.id, tagId: tagMap["modern-jazz"].id },
      { residencyId: livsResidency.id, tagId: tagMap["free-entry"].id },
    ],
    skipDuplicates: true,
  });

  // ── Gigs ──────────────────────────────────────────────────────────────────

  // Tonight
  const gig1 = await prisma.gig.upsert({
    where: { slug: "rumble-pack-triffid-" + today.toISOString().slice(0, 10) },
    update: {},
    create: {
      title: "Rumble Pack",
      slug: "rumble-pack-triffid-" + today.toISOString().slice(0, 10),
      datetime: d(0, 20, 0),
      venueId: triffid.id,
      description:
        "The collective returns to The Triffid for a night of unhinged improvisation.",
      price: "$15 / $10 conc",
      featured: true,
      status: ContentStatus.PUBLISHED,
      createdById: admin.id,
    },
  });
  await prisma.gigLineup.upsert({
    where: { gigId_projectId: { gigId: gig1.id, projectId: rumblePack.id } },
    update: {},
    create: { gigId: gig1.id, projectId: rumblePack.id, order: 1 },
  });
  await prisma.gigTag.createMany({
    data: [
      { gigId: gig1.id, tagId: tagMap["free-jazz"].id },
      { gigId: gig1.id, tagId: tagMap["instrumental"].id },
    ],
    skipDuplicates: true,
  });

  const gig2 = await prisma.gig.upsert({
    where: { slug: "live-at-livs-" + today.toISOString().slice(0, 10) },
    update: {},
    create: {
      title: "Live at Liv's",
      slug: "live-at-livs-" + today.toISOString().slice(0, 10),
      datetime: d(0, 19, 0),
      venueId: mirrorball.id,
      description: "Weekly open session at Mirrorball. Sit-ins very welcome.",
      price: "Free",
      status: ContentStatus.PUBLISHED,
      residencyId: livsResidency.id,
      createdById: admin.id,
    },
  });
  await prisma.gigLineup.upsert({
    where: { gigId_projectId: { gigId: gig2.id, projectId: liveAtLivs.id } },
    update: {},
    create: { gigId: gig2.id, projectId: liveAtLivs.id, order: 1 },
  });
  await prisma.gigTag.createMany({
    data: [
      { gigId: gig2.id, tagId: tagMap["sit-in-welcome"].id },
      { gigId: gig2.id, tagId: tagMap["free-entry"].id },
    ],
    skipDuplicates: true,
  });

  // Tomorrow
  const gig3 = await prisma.gig.upsert({
    where: {
      slug: "melody-graves-quartet-bjc-" + d(1, 0).toISOString().slice(0, 10),
    },
    update: {},
    create: {
      title: "Melody Graves Quartet",
      slug: "melody-graves-quartet-bjc-" + d(1, 0).toISOString().slice(0, 10),
      datetime: d(1, 19, 30),
      venueId: bjc.id,
      description:
        "An evening of standards and originals with one of Brisbane's finest vocalists.",
      price: "$20 / $15 members",
      status: ContentStatus.PUBLISHED,
      createdById: admin.id,
    },
  });
  await prisma.gigLineup.upsert({
    where: { gigId_projectId: { gigId: gig3.id, projectId: melodyQuartet.id } },
    update: {},
    create: { gigId: gig3.id, projectId: melodyQuartet.id, order: 1 },
  });
  await prisma.gigTag.createMany({
    data: [
      { gigId: gig3.id, tagId: tagMap["modern-jazz"].id },
      { gigId: gig3.id, tagId: tagMap["vocal"].id },
    ],
    skipDuplicates: true,
  });

  // Day +2
  const gig4 = await prisma.gig.upsert({
    where: {
      slug: "obscure-orchestra-triffid-" + d(2, 0).toISOString().slice(0, 10),
    },
    update: {},
    create: {
      title: "Obscure Orchestra",
      slug: "obscure-orchestra-triffid-" + d(2, 0).toISOString().slice(0, 10),
      datetime: d(2, 20, 30),
      venueId: triffid.id,
      description:
        "Twelve players, zero plan. The Obscure Orchestra does it again.",
      price: "$25",
      status: ContentStatus.PUBLISHED,
      createdById: admin.id,
    },
  });
  await prisma.gigLineup.upsert({
    where: { gigId_projectId: { gigId: gig4.id, projectId: obscureOrch.id } },
    update: {},
    create: { gigId: gig4.id, projectId: obscureOrch.id, order: 1 },
  });
  await prisma.gigTag.createMany({
    data: [
      { gigId: gig4.id, tagId: tagMap["big-band"].id },
      { gigId: gig4.id, tagId: tagMap["free-jazz"].id },
    ],
    skipDuplicates: true,
  });

  // Day +4
  const gig5 = await prisma.gig.upsert({
    where: { slug: "rumble-pack-joynt-" + d(4, 0).toISOString().slice(0, 10) },
    update: {},
    create: {
      title: "Rumble Pack (acoustic set)",
      slug: "rumble-pack-joynt-" + d(4, 0).toISOString().slice(0, 10),
      datetime: d(4, 18, 0),
      venueId: joynt.id,
      description:
        "A rare stripped-back set from Rumble Pack — no amplification, full chaos.",
      price: "Free",
      status: ContentStatus.PUBLISHED,
      createdById: admin.id,
    },
  });
  await prisma.gigLineup.upsert({
    where: { gigId_projectId: { gigId: gig5.id, projectId: rumblePack.id } },
    update: {},
    create: { gigId: gig5.id, projectId: rumblePack.id, order: 1 },
  });
  await prisma.gigTag.createMany({
    data: [
      { gigId: gig5.id, tagId: tagMap["free-entry"].id },
      { gigId: gig5.id, tagId: tagMap["free-jazz"].id },
      { gigId: gig5.id, tagId: tagMap["all-ages"].id },
    ],
    skipDuplicates: true,
  });

  // Day +6
  const gig6 = await prisma.gig.upsert({
    where: { slug: "live-at-livs-" + d(6, 0).toISOString().slice(0, 10) },
    update: {},
    create: {
      title: "Live at Liv's",
      slug: "live-at-livs-" + d(6, 0).toISOString().slice(0, 10),
      datetime: d(6, 19, 0),
      venueId: mirrorball.id,
      description: "Weekly open session at Mirrorball. Sit-ins very welcome.",
      price: "Free",
      status: ContentStatus.PUBLISHED,
      residencyId: livsResidency.id,
      createdById: admin.id,
    },
  });
  await prisma.gigLineup.upsert({
    where: { gigId_projectId: { gigId: gig6.id, projectId: liveAtLivs.id } },
    update: {},
    create: { gigId: gig6.id, projectId: liveAtLivs.id, order: 1 },
  });
  await prisma.gigTag.createMany({
    data: [
      { gigId: gig6.id, tagId: tagMap["sit-in-welcome"].id },
      { gigId: gig6.id, tagId: tagMap["free-entry"].id },
    ],
    skipDuplicates: true,
  });

  // ── Venue tags ────────────────────────────────────────────────────────────
  await prisma.venueTag.createMany({
    data: [
      { venueId: triffid.id, tagId: tagMap["licensed"].id },
      { venueId: triffid.id, tagId: tagMap["standing"].id },
      { venueId: triffid.id, tagId: tagMap["all-ages"].id },
      { venueId: triffid.id, tagId: tagMap["modern-jazz"].id },
      { venueId: mirrorball.id, tagId: tagMap["late-night"].id },
      { venueId: mirrorball.id, tagId: tagMap["intimate-venue"].id },
      { venueId: mirrorball.id, tagId: tagMap["licensed"].id },
      { venueId: mirrorball.id, tagId: tagMap["experimental"].id },
      { venueId: mirrorball.id, tagId: tagMap["sit-in-welcome"].id },
      { venueId: bjc.id, tagId: tagMap["trad-jazz"].id },
      { venueId: bjc.id, tagId: tagMap["seated"].id },
      { venueId: bjc.id, tagId: tagMap["licensed"].id },
      { venueId: bjc.id, tagId: tagMap["standards"].id },
      { venueId: joynt.id, tagId: tagMap["free-entry"].id },
      { venueId: joynt.id, tagId: tagMap["intimate-venue"].id },
      { venueId: joynt.id, tagId: tagMap["bar"].id },
      { venueId: joynt.id, tagId: tagMap["all-ages"].id },
      { venueId: joynt.id, tagId: tagMap["nu-jazz"].id },
    ],
    skipDuplicates: true,
  });

  // ── Project tags ───────────────────────────────────────────────────────────
  await prisma.projectTag.createMany({
    data: [
      { projectId: rumblePack.id, tagId: tagMap["free-jazz"].id },
      { projectId: rumblePack.id, tagId: tagMap["experimental"].id },
      { projectId: rumblePack.id, tagId: tagMap["improvised"].id },
      { projectId: rumblePack.id, tagId: tagMap["instrumental"].id },
      { projectId: melodyQuartet.id, tagId: tagMap["modern-jazz"].id },
      { projectId: melodyQuartet.id, tagId: tagMap["vocal"].id },
      { projectId: melodyQuartet.id, tagId: tagMap["standards"].id },
      { projectId: melodyQuartet.id, tagId: tagMap["hard-bop"].id },
      { projectId: obscureOrch.id, tagId: tagMap["big-band"].id },
      { projectId: obscureOrch.id, tagId: tagMap["experimental"].id },
      { projectId: obscureOrch.id, tagId: tagMap["original-music"].id },
      { projectId: obscureOrch.id, tagId: tagMap["improvised"].id },
      { projectId: obscureOrch.id, tagId: tagMap["fusion"].id },
      { projectId: liveAtLivs.id, tagId: tagMap["sit-in-welcome"].id },
      { projectId: liveAtLivs.id, tagId: tagMap["modern-jazz"].id },
      { projectId: liveAtLivs.id, tagId: tagMap["free-entry"].id },
      { projectId: liveAtLivs.id, tagId: tagMap["late-night"].id },
    ],
    skipDuplicates: true,
  });

  // ── People tags ────────────────────────────────────────────────────────────
  await prisma.personTag.createMany({
    data: [
      { personId: liv.id, tagId: tagMap["modern-jazz"].id },
      { personId: liv.id, tagId: tagMap["sit-in-welcome"].id },
      { personId: liv.id, tagId: tagMap["original-music"].id },
      { personId: melody.id, tagId: tagMap["vocal"].id },
      { personId: melody.id, tagId: tagMap["standards"].id },
      { personId: melody.id, tagId: tagMap["hard-bop"].id },
      { personId: jordy.id, tagId: tagMap["nu-jazz"].id },
      { personId: jordy.id, tagId: tagMap["experimental"].id },
      { personId: jordy.id, tagId: tagMap["fusion"].id },
      { personId: joel.id, tagId: tagMap["improvised"].id },
      { personId: joel.id, tagId: tagMap["free-jazz"].id },
      { personId: joel.id, tagId: tagMap["experimental"].id },
    ],
    skipDuplicates: true,
  });

  // ── Gig tags (add more to existing gigs) ──────────────────────────────────
  await prisma.gigTag.createMany({
    data: [
      { gigId: gig1.id, tagId: tagMap["late-night"].id },
      { gigId: gig1.id, tagId: tagMap["standing"].id },
      { gigId: gig1.id, tagId: tagMap["licensed"].id },
      { gigId: gig2.id, tagId: tagMap["late-night"].id },
      { gigId: gig2.id, tagId: tagMap["modern-jazz"].id },
      { gigId: gig2.id, tagId: tagMap["intimate-venue"].id },
      { gigId: gig3.id, tagId: tagMap["seated"].id },
      { gigId: gig3.id, tagId: tagMap["licensed"].id },
      { gigId: gig3.id, tagId: tagMap["standards"].id },
      { gigId: gig4.id, tagId: tagMap["standing"].id },
      { gigId: gig4.id, tagId: tagMap["original-music"].id },
      { gigId: gig4.id, tagId: tagMap["licensed"].id },
      { gigId: gig5.id, tagId: tagMap["outdoor"].id },
      { gigId: gig5.id, tagId: tagMap["student-friendly"].id },
      { gigId: gig5.id, tagId: tagMap["improvised"].id },
      { gigId: gig6.id, tagId: tagMap["late-night"].id },
      { gigId: gig6.id, tagId: tagMap["modern-jazz"].id },
      { gigId: gig6.id, tagId: tagMap["intimate-venue"].id },
    ],
    skipDuplicates: true,
  });

  // ── Org tags ───────────────────────────────────────────────────────────────
  const jmiOrg = await prisma.organisation.findUnique({ where: { slug: "jmi" } });
  const qcguOrg = await prisma.organisation.findUnique({ where: { slug: "qcgu" } });
  const zzzOrg = await prisma.organisation.findUnique({ where: { slug: "4zzz" } });
  if (jmiOrg && qcguOrg && zzzOrg) {
    await prisma.orgTag.createMany({
      data: [
        { orgId: jmiOrg.id, tagId: tagMap["modern-jazz"].id },
        { orgId: jmiOrg.id, tagId: tagMap["student-friendly"].id },
        { orgId: jmiOrg.id, tagId: tagMap["original-music"].id },
        { orgId: qcguOrg.id, tagId: tagMap["student-friendly"].id },
        { orgId: qcguOrg.id, tagId: tagMap["trad-jazz"].id },
        { orgId: qcguOrg.id, tagId: tagMap["instrumental"].id },
        { orgId: zzzOrg.id, tagId: tagMap["all-ages"].id },
        { orgId: zzzOrg.id, tagId: tagMap["free-entry"].id },
        { orgId: zzzOrg.id, tagId: tagMap["nu-jazz"].id },
      ],
      skipDuplicates: true,
    });
  }

  // ── Extra venues ──────────────────────────────────────────────────────────
  const burrow = await prisma.venue.upsert({
    where: { slug: "the-burrow" },
    update: {},
    create: {
      name: "The Burrow",
      slug: "the-burrow",
      address: "West End QLD 4101",
      suburb: "West End",
      status: ContentStatus.PUBLISHED,
      createdById: admin.id,
    },
  });

  const emporium = await prisma.venue.upsert({
    where: { slug: "emporium-hotel" },
    update: {},
    create: {
      name: "Emporium Hotel",
      slug: "emporium-hotel",
      address: "1000 Ann St, Fortitude Valley QLD 4006",
      suburb: "Fortitude Valley",
      status: ContentStatus.PUBLISHED,
      createdById: admin.id,
    },
  });

  const hyatt = await prisma.venue.upsert({
    where: { slug: "hyatt-regency-brisbane" },
    update: {},
    create: {
      name: "Hyatt Regency Brisbane",
      slug: "hyatt-regency-brisbane",
      address: "Adelaide St, Brisbane City QLD 4000",
      suburb: "CBD",
      status: ContentStatus.PUBLISHED,
      createdById: admin.id,
    },
  });

  const jmiVenue = await prisma.venue.upsert({
    where: { slug: "jazz-music-institute" },
    update: {},
    create: {
      name: "Jazz Music Institute",
      slug: "jazz-music-institute",
      address: "South Brisbane QLD 4101",
      suburb: "South Brisbane",
      status: ContentStatus.PUBLISHED,
      createdById: admin.id,
    },
  });

  const deathAndCo = await prisma.venue.upsert({
    where: { slug: "death-and-co" },
    update: {},
    create: {
      name: "Death & Co",
      slug: "death-and-co",
      address: "Fortitude Valley QLD 4006",
      suburb: "Fortitude Valley",
      status: ContentStatus.PUBLISHED,
      createdById: admin.id,
    },
  });

  const alligator = await prisma.venue.upsert({
    where: { slug: "alligator-club" },
    update: {},
    create: {
      name: "Alligator Club",
      slug: "alligator-club",
      address: "New Farm QLD 4005",
      suburb: "New Farm",
      status: ContentStatus.PUBLISHED,
      createdById: admin.id,
    },
  });

  // ── Extra residencies ──────────────────────────────────────────────────────
  const cutTime = await prisma.residency.upsert({
    where: { slug: "cut-time-burrow" },
    update: {},
    create: {
      name: "Cut Time",
      slug: "cut-time-burrow",
      dayOfWeek: 1, // Tuesday
      frequency: Frequency.WEEKLY,
      startTime: "20:00",
      active: true,
      venueId: burrow.id,
      createdById: admin.id,
    },
  });

  const elRitmo = await prisma.residency.upsert({
    where: { slug: "el-ritmo-fridays" },
    update: {},
    create: {
      name: "El Ritmo",
      slug: "el-ritmo-fridays",
      dayOfWeek: 4, // Friday
      frequency: Frequency.WEEKLY,
      startTime: "21:00",
      active: true,
      createdById: admin.id,
    },
  });

  const mrVain = await prisma.residency.upsert({
    where: { slug: "mr-vain" },
    update: {},
    create: {
      name: "Mr Vain",
      slug: "mr-vain",
      dayOfWeek: 0, // Monday
      frequency: Frequency.WEEKLY,
      startTime: "20:00",
      active: true,
      createdById: admin.id,
    },
  });

  const emporiumSats = await prisma.residency.upsert({
    where: { slug: "emporium-saturdays" },
    update: {},
    create: {
      name: "Emporium Saturdays",
      slug: "emporium-saturdays",
      dayOfWeek: 5, // Saturday
      frequency: Frequency.WEEKLY,
      startTime: "19:00",
      active: true,
      venueId: emporium.id,
      createdById: admin.id,
    },
  });

  const andrewShaw = await prisma.residency.upsert({
    where: { slug: "andrew-shaw-hyatt" },
    update: {},
    create: {
      name: "Andrew Shaw",
      slug: "andrew-shaw-hyatt",
      dayOfWeek: 6, // Sunday
      frequency: Frequency.WEEKLY,
      startTime: "18:00",
      active: true,
      venueId: hyatt.id,
      createdById: admin.id,
    },
  });

  const jmiLive = await prisma.residency.upsert({
    where: { slug: "jmi-live-thursdays" },
    update: {},
    create: {
      name: "JMI Live",
      slug: "jmi-live-thursdays",
      dayOfWeek: 3, // Thursday
      frequency: Frequency.WEEKLY,
      startTime: "19:00",
      active: true,
      venueId: jmiVenue.id,
      createdById: admin.id,
    },
  });

  const deathCo = await prisma.residency.upsert({
    where: { slug: "death-and-co-wednesdays" },
    update: {},
    create: {
      name: "Death & Co Jazz",
      slug: "death-and-co-wednesdays",
      dayOfWeek: 2, // Wednesday
      frequency: Frequency.WEEKLY,
      startTime: "20:00",
      active: true,
      venueId: deathAndCo.id,
      createdById: admin.id,
    },
  });

  const alligatorRes = await prisma.residency.upsert({
    where: { slug: "alligator-club-thursdays" },
    update: {},
    create: {
      name: "Alligator Club",
      slug: "alligator-club-thursdays",
      dayOfWeek: 3, // Thursday
      frequency: Frequency.WEEKLY,
      startTime: "19:30",
      active: true,
      venueId: alligator.id,
      createdById: admin.id,
    },
  });

  // ── Extra residency tags ──────────────────────────────────────────────────
  await prisma.residencyTag.createMany({
    data: [
      { residencyId: cutTime.id, tagId: tagMap["modern-jazz"].id },
      { residencyId: cutTime.id, tagId: tagMap["sit-in-welcome"].id },
      { residencyId: elRitmo.id, tagId: tagMap["latin"].id },
      { residencyId: elRitmo.id, tagId: tagMap["late-night"].id },
      { residencyId: mrVain.id, tagId: tagMap["funk"].id },
      { residencyId: mrVain.id, tagId: tagMap["soul"].id },
      { residencyId: emporiumSats.id, tagId: tagMap["modern-jazz"].id },
      { residencyId: emporiumSats.id, tagId: tagMap["licensed"].id },
      { residencyId: andrewShaw.id, tagId: tagMap["trad-jazz"].id },
      { residencyId: andrewShaw.id, tagId: tagMap["standards"].id },
      { residencyId: jmiLive.id, tagId: tagMap["student-friendly"].id },
      { residencyId: jmiLive.id, tagId: tagMap["original-music"].id },
      { residencyId: deathCo.id, tagId: tagMap["late-night"].id },
      { residencyId: deathCo.id, tagId: tagMap["intimate-venue"].id },
      { residencyId: alligatorRes.id, tagId: tagMap["improvised"].id },
      { residencyId: alligatorRes.id, tagId: tagMap["free-entry"].id },
    ],
    skipDuplicates: true,
  });

  // ── Blogs ─────────────────────────────────────────────────────────────────
  await prisma.blog.upsert({
    where: { slug: "welcome-to-jam" },
    update: {},
    create: {
      slug: "welcome-to-jam",
      title: "Welcome to JAM",
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date("2026-02-01"),
      createdById: admin.id,
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "JAM — Jazz Almanac Meanjin — is a free, community-run guide to jazz and improvised music in Brisbane. No paywalls, no algorithms, no ads. Just gigs, venues, artists, and the people who love this music.",
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "This is a democratic place. Anyone can submit a gig, claim their artist profile, or write a post. The editorial team keeps the lights on, but the scene runs itself.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "What's here" }],
          },
          {
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [{ type: "paragraph", content: [{ type: "text", text: "Gigs — tonight, this week, further out" }] }],
              },
              {
                type: "listItem",
                content: [{ type: "paragraph", content: [{ type: "text", text: "Venues — where the music lives" }] }],
              },
              {
                type: "listItem",
                content: [{ type: "paragraph", content: [{ type: "text", text: "Artists and projects — who's playing" }] }],
              },
              {
                type: "listItem",
                content: [{ type: "paragraph", content: [{ type: "text", text: "Residencies — the regular nights worth knowing" }] }],
              },
            ],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "If you play, promote, or just show up — this is for you." }],
          },
        ],
      },
    },
  });

  // ── Organisations ─────────────────────────────────────────────────────────
  await prisma.organisation.upsert({
    where: { slug: "jmi" },
    update: {},
    create: {
      name: "Jazz Music Institute",
      slug: "jmi",
      category: OrgCategory.SCHOOL,
      description:
        "Brisbane's dedicated jazz conservatoire. Produces many of the working musicians in the Meanjin scene.",
      links: [{ label: "Website", url: "https://jmi.edu.au" }],
      createdById: admin.id,
    },
  });

  await prisma.organisation.upsert({
    where: { slug: "qcgu" },
    update: {},
    create: {
      name: "Queensland Conservatorium Griffith University",
      slug: "qcgu",
      category: OrgCategory.SCHOOL,
      description: "The Con. Classical and jazz training in South Bank.",
      links: [
        {
          label: "Website",
          url: "https://www.griffith.edu.au/arts-education-law/queensland-conservatorium",
        },
      ],
      createdById: admin.id,
    },
  });

  await prisma.organisation.upsert({
    where: { slug: "4zzz" },
    update: {},
    create: {
      name: "4ZZZ Community Radio",
      slug: "4zzz",
      category: OrgCategory.RADIO,
      description:
        "Brisbane's independent community radio station. Home to several jazz and improvised music programs.",
      links: [{ label: "Website", url: "https://4zzz.org.au" }],
      createdById: admin.id,
    },
  });

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
