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

  const sam = await prisma.person.upsert({
    where: { slug: "sam-okafor" },
    update: {},
    create: {
      name: "Sam Okafor",
      slug: "sam-okafor",
      bio: "Drummer rooted in Afrobeat and funk. Holds down the pocket for multiple West End projects.",
      createdById: admin.id,
    },
  });
  await prisma.personInstrument.upsert({
    where: { personId_instrumentId: { personId: sam.id, instrumentId: instrMap["drums"].id } },
    update: {},
    create: { personId: sam.id, instrumentId: instrMap["drums"].id },
  });

  const priya = await prisma.person.upsert({
    where: { slug: "priya-sharma" },
    update: {},
    create: {
      name: "Priya Sharma",
      slug: "priya-sharma",
      bio: "Pianist with a hard bop vocabulary and a soft spot for the Blue Note back catalogue.",
      createdById: admin.id,
    },
  });
  await prisma.personInstrument.upsert({
    where: { personId_instrumentId: { personId: priya.id, instrumentId: instrMap["piano"].id } },
    update: {},
    create: { personId: priya.id, instrumentId: instrMap["piano"].id },
  });

  const cleo = await prisma.person.upsert({
    where: { slug: "cleo-bassett" },
    update: {},
    create: {
      name: "Cleo Bassett",
      slug: "cleo-bassett",
      bio: "Double bassist. BJC regular and first-call for trad sessions around town.",
      createdById: admin.id,
    },
  });
  await prisma.personInstrument.upsert({
    where: { personId_instrumentId: { personId: cleo.id, instrumentId: instrMap["double bass"].id } },
    update: {},
    create: { personId: cleo.id, instrumentId: instrMap["double bass"].id },
  });

  const marcus = await prisma.person.upsert({
    where: { slug: "marcus-webb" },
    update: {},
    create: {
      name: "Marcus Webb",
      slug: "marcus-webb",
      bio: "Trumpeter. Hard bop is his language; Miles circa '64 is his north star.",
      createdById: admin.id,
    },
  });
  await prisma.personInstrument.upsert({
    where: { personId_instrumentId: { personId: marcus.id, instrumentId: instrMap["trumpet"].id } },
    update: {},
    create: { personId: marcus.id, instrumentId: instrMap["trumpet"].id },
  });

  const yuki = await prisma.person.upsert({
    where: { slug: "yuki-tanaka" },
    update: {},
    create: {
      name: "Yuki Tanaka",
      slug: "yuki-tanaka",
      bio: "Violinist and flautist. Moves between jazz, contemporary classical, and free improvisation.",
      createdById: admin.id,
    },
  });
  for (const instr of ["violin", "flute"]) {
    await prisma.personInstrument.upsert({
      where: { personId_instrumentId: { personId: yuki.id, instrumentId: instrMap[instr].id } },
      update: {},
      create: { personId: yuki.id, instrumentId: instrMap[instr].id },
    });
  }

  const dario = await prisma.person.upsert({
    where: { slug: "dario-reyes" },
    update: {},
    create: {
      name: "Dario Reyes",
      slug: "dario-reyes",
      bio: "Trombonist. Plays Latin and big band with equal commitment; co-leads El Ritmo.",
      createdById: admin.id,
    },
  });
  await prisma.personInstrument.upsert({
    where: { personId_instrumentId: { personId: dario.id, instrumentId: instrMap["trombone"].id } },
    update: {},
    create: { personId: dario.id, instrumentId: instrMap["trombone"].id },
  });

  const sasha = await prisma.person.upsert({
    where: { slug: "sasha-moir" },
    update: {},
    create: {
      name: "Sasha Moir",
      slug: "sasha-moir",
      bio: "Free jazz drummer. If the pulse is uncomfortable, that's the point.",
      createdById: admin.id,
    },
  });
  await prisma.personInstrument.upsert({
    where: { personId_instrumentId: { personId: sasha.id, instrumentId: instrMap["drums"].id } },
    update: {},
    create: { personId: sasha.id, instrumentId: instrMap["drums"].id },
  });

  const rowan = await prisma.person.upsert({
    where: { slug: "rowan-kite" },
    update: {},
    create: {
      name: "Rowan Kite",
      slug: "rowan-kite",
      bio: "Guitarist and bassist. Splits time between nu-jazz projects and funk gigs across the city.",
      createdById: admin.id,
    },
  });
  for (const instr of ["guitar", "bass"]) {
    await prisma.personInstrument.upsert({
      where: { personId_instrumentId: { personId: rowan.id, instrumentId: instrMap[instr].id } },
      update: {},
      create: { personId: rowan.id, instrumentId: instrMap[instr].id },
    });
  }

  const harriet = await prisma.person.upsert({
    where: { slug: "harriet-chu" },
    update: {},
    create: {
      name: "Harriet Chu",
      slug: "harriet-chu",
      bio: "Saxophonist. Studied at JMI, now leading her own quartet through hard bop territory.",
      createdById: admin.id,
    },
  });
  await prisma.personInstrument.upsert({
    where: { personId_instrumentId: { personId: harriet.id, instrumentId: instrMap["saxophone"].id } },
    update: {},
    create: { personId: harriet.id, instrumentId: instrMap["saxophone"].id },
  });

  const teo = await prisma.person.upsert({
    where: { slug: "teo-ferraro" },
    update: {},
    create: {
      name: "Teo Ferraro",
      slug: "teo-ferraro",
      bio: "Trumpeter with roots in Brazilian jazz and soul. A staple of the El Ritmo Fridays lineup.",
      createdById: admin.id,
    },
  });
  await prisma.personInstrument.upsert({
    where: { personId_instrumentId: { personId: teo.id, instrumentId: instrMap["trumpet"].id } },
    update: {},
    create: { personId: teo.id, instrumentId: instrMap["trumpet"].id },
  });

  const bex = await prisma.person.upsert({
    where: { slug: "bex-hollis" },
    update: {},
    create: {
      name: "Bex Hollis",
      slug: "bex-hollis",
      bio: "Synth player. Works in the space between nu-jazz, ambient, and electroacoustic improvisation.",
      createdById: admin.id,
    },
  });
  await prisma.personInstrument.upsert({
    where: { personId_instrumentId: { personId: bex.id, instrumentId: instrMap["synth"].id } },
    update: {},
    create: { personId: bex.id, instrumentId: instrMap["synth"].id },
  });

  const dom = await prisma.person.upsert({
    where: { slug: "dom-cavalcanti" },
    update: {},
    create: {
      name: "Dom Cavalcanti",
      slug: "dom-cavalcanti",
      bio: "Pianist. Raised on bossa nova, now playing Latin jazz and fusion around Meanjin.",
      createdById: admin.id,
    },
  });
  await prisma.personInstrument.upsert({
    where: { personId_instrumentId: { personId: dom.id, instrumentId: instrMap["piano"].id } },
    update: {},
    create: { personId: dom.id, instrumentId: instrMap["piano"].id },
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
  for (const personId of [
    liv.id, jordy.id, joel.id, yuki.id, dario.id, sasha.id,
    marcus.id, harriet.id, cleo.id, bex.id,
  ]) {
    await prisma.projectMember.upsert({
      where: { projectId_personId: { projectId: obscureOrch.id, personId } },
      update: {},
      create: { projectId: obscureOrch.id, personId },
    });
  }

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

  const elRitmoProject = await prisma.project.upsert({
    where: { slug: "el-ritmo" },
    update: {},
    create: {
      name: "El Ritmo",
      slug: "el-ritmo",
      bio: "Latin jazz collective co-led by Dario Reyes and Teo Ferraro. Friday nights are their domain.",
      status: ContentStatus.PUBLISHED,
      createdById: admin.id,
    },
  });
  for (const { personId, role } of [
    { personId: dario.id, role: "co-leader" },
    { personId: teo.id, role: "co-leader" },
    { personId: dom.id, role: null },
    { personId: sam.id, role: null },
    { personId: rowan.id, role: null },
  ]) {
    await prisma.projectMember.upsert({
      where: { projectId_personId: { projectId: elRitmoProject.id, personId } },
      update: {},
      create: { projectId: elRitmoProject.id, personId, role },
    });
  }

  const harrietQuartet = await prisma.project.upsert({
    where: { slug: "harriet-chu-quartet" },
    update: {},
    create: {
      name: "Harriet Chu Quartet",
      slug: "harriet-chu-quartet",
      bio: "Hard bop from Harriet Chu — Blue Note-era vocabulary with a Brisbane accent.",
      status: ContentStatus.PUBLISHED,
      createdById: admin.id,
    },
  });
  for (const { personId, role } of [
    { personId: harriet.id, role: "leader" },
    { personId: priya.id, role: null },
    { personId: cleo.id, role: null },
    { personId: marcus.id, role: null },
  ]) {
    await prisma.projectMember.upsert({
      where: { projectId_personId: { projectId: harrietQuartet.id, personId } },
      update: {},
      create: { projectId: harrietQuartet.id, personId, role },
    });
  }

  const nightSignal = await prisma.project.upsert({
    where: { slug: "night-signal" },
    update: {},
    create: {
      name: "Night Signal",
      slug: "night-signal",
      bio: "Nu-jazz trio built on synth textures, electric guitar, and heavy grooves.",
      status: ContentStatus.PUBLISHED,
      createdById: admin.id,
    },
  });
  for (const { personId, role } of [
    { personId: rowan.id, role: "leader" },
    { personId: bex.id, role: null },
    { personId: sam.id, role: null },
  ]) {
    await prisma.projectMember.upsert({
      where: { projectId_personId: { projectId: nightSignal.id, personId } },
      update: {},
      create: { projectId: nightSignal.id, personId, role },
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
      { projectId: elRitmoProject.id, tagId: tagMap["latin"].id },
      { projectId: elRitmoProject.id, tagId: tagMap["funk"].id },
      { projectId: elRitmoProject.id, tagId: tagMap["soul"].id },
      { projectId: elRitmoProject.id, tagId: tagMap["late-night"].id },
      { projectId: harrietQuartet.id, tagId: tagMap["hard-bop"].id },
      { projectId: harrietQuartet.id, tagId: tagMap["modern-jazz"].id },
      { projectId: harrietQuartet.id, tagId: tagMap["standards"].id },
      { projectId: harrietQuartet.id, tagId: tagMap["instrumental"].id },
      { projectId: nightSignal.id, tagId: tagMap["nu-jazz"].id },
      { projectId: nightSignal.id, tagId: tagMap["experimental"].id },
      { projectId: nightSignal.id, tagId: tagMap["fusion"].id },
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
      { personId: sam.id, tagId: tagMap["afrobeat"].id },
      { personId: sam.id, tagId: tagMap["funk"].id },
      { personId: sam.id, tagId: tagMap["soul"].id },
      { personId: priya.id, tagId: tagMap["hard-bop"].id },
      { personId: priya.id, tagId: tagMap["standards"].id },
      { personId: cleo.id, tagId: tagMap["trad-jazz"].id },
      { personId: cleo.id, tagId: tagMap["standards"].id },
      { personId: marcus.id, tagId: tagMap["hard-bop"].id },
      { personId: marcus.id, tagId: tagMap["modern-jazz"].id },
      { personId: yuki.id, tagId: tagMap["fusion"].id },
      { personId: yuki.id, tagId: tagMap["experimental"].id },
      { personId: yuki.id, tagId: tagMap["improvised"].id },
      { personId: dario.id, tagId: tagMap["latin"].id },
      { personId: dario.id, tagId: tagMap["big-band"].id },
      { personId: sasha.id, tagId: tagMap["free-jazz"].id },
      { personId: sasha.id, tagId: tagMap["improvised"].id },
      { personId: rowan.id, tagId: tagMap["nu-jazz"].id },
      { personId: rowan.id, tagId: tagMap["funk"].id },
      { personId: harriet.id, tagId: tagMap["hard-bop"].id },
      { personId: harriet.id, tagId: tagMap["modern-jazz"].id },
      { personId: teo.id, tagId: tagMap["latin"].id },
      { personId: teo.id, tagId: tagMap["soul"].id },
      { personId: bex.id, tagId: tagMap["nu-jazz"].id },
      { personId: bex.id, tagId: tagMap["experimental"].id },
      { personId: dom.id, tagId: tagMap["latin"].id },
      { personId: dom.id, tagId: tagMap["fusion"].id },
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
      projectId: elRitmoProject.id,
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
  const blog1 = await prisma.blog.upsert({
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
            content: [{ type: "text", text: "JAM — Jazz Almanac Meanjin — is a free, community-run guide to jazz and improvised music in Brisbane. No paywalls, no algorithms, no ads. Just gigs, venues, artists, and the people who love this music." }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "This is a democratic place. Anyone can submit a gig, claim their artist profile, or write a post. The editorial team keeps the lights on, but the scene runs itself." }],
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "What's here" }],
          },
          {
            type: "bulletList",
            content: [
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Gigs — tonight, this week, further out" }] }] },
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Venues — where the music lives" }] }] },
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Artists and projects — who's playing" }] }] },
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Residencies — the regular nights worth knowing" }] }] },
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

  const blog2 = await prisma.blog.upsert({
    where: { slug: "why-residencies-matter" },
    update: {},
    create: {
      slug: "why-residencies-matter",
      title: "Why residencies matter",
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date("2026-02-08"),
      createdById: admin.id,
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "A one-off gig is exciting. A residency is how a scene actually builds itself." }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "When a band holds down a weekly or fortnightly slot, something different happens. Audiences start to trust the night. Musicians get to take risks. The room develops a personality. It becomes a place — not just an event." }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Brisbane has always had a handful of residencies that function this way. Liv Marlton's Sunday session at Mirrorball. JMI Live on Thursdays. The Sunday afternoon sets at the Hyatt. These nights are the connective tissue of the scene — they're where students hear working musicians up close, where sit-ins happen, where the informal mentorship that defines a jazz community takes place." }],
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "The sit-in tradition" }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Most of Brisbane's open residencies operate on a loose sit-in model. You bring your axe, you introduce yourself to the bandleader, you wait for the nod. It's informal, but there's an etiquette to it — listen before you play, lock in with the rhythm section, read the room." }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "If you're new to the scene, these nights are the fastest way in. Show up, listen, play when invited, come back next week." }],
          },
        ],
      },
    },
  });

  const blog3 = await prisma.blog.upsert({
    where: { slug: "a-guide-to-the-valley" },
    update: {},
    create: {
      slug: "a-guide-to-the-valley",
      title: "A guide to jazz in the Valley",
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date("2026-02-15"),
      createdById: admin.id,
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Fortitude Valley has always been Brisbane's nightlife hub, but it's also quietly become one of the better jazz precincts in the city. Here's where to look." }],
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Mirrorball Ministries" }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Late-night, intimate, and reliably adventurous. Mirrorball is where you go when you want the music to be the main event. Sundays are anchored by Liv Marlton's open session — sit-ins welcome, no cover." }],
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Emporium Hotel" }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "The Emporium Saturday nights lean more polished — think smart casual, proper sound system, full bar. A good option if you want to bring someone who hasn't been to a jazz gig before." }],
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Death & Co" }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "More cocktail bar than music venue, but the Wednesday night jazz sets are worth knowing about. Low key, good drinks, the kind of vibe where nobody's checking their phone." }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "The Valley rewards the curious. Walk around on a Friday night and you'll hear more live jazz than you expect." }],
          },
        ],
      },
    },
  });

  // ── Blog tags ──────────────────────────────────────────────────────────────
  await prisma.blogTag.createMany({
    data: [
      { blogId: blog1.id, tagId: tagMap["all-ages"].id },
      { blogId: blog1.id, tagId: tagMap["free-entry"].id },
      { blogId: blog1.id, tagId: tagMap["modern-jazz"].id },
      { blogId: blog2.id, tagId: tagMap["residency"].id },
      { blogId: blog2.id, tagId: tagMap["sit-in-welcome"].id },
      { blogId: blog2.id, tagId: tagMap["improvised"].id },
      { blogId: blog3.id, tagId: tagMap["late-night"].id },
      { blogId: blog3.id, tagId: tagMap["bar"].id },
      { blogId: blog3.id, tagId: tagMap["modern-jazz"].id },
    ],
    skipDuplicates: true,
  });

  // ── Missing venue tags ─────────────────────────────────────────────────────
  await prisma.venueTag.createMany({
    data: [
      { venueId: burrow.id, tagId: tagMap["intimate-venue"].id },
      { venueId: burrow.id, tagId: tagMap["sit-in-welcome"].id },
      { venueId: burrow.id, tagId: tagMap["bar"].id },
      { venueId: emporium.id, tagId: tagMap["modern-jazz"].id },
      { venueId: emporium.id, tagId: tagMap["licensed"].id },
      { venueId: emporium.id, tagId: tagMap["seated"].id },
      { venueId: hyatt.id, tagId: tagMap["trad-jazz"].id },
      { venueId: hyatt.id, tagId: tagMap["standards"].id },
      { venueId: hyatt.id, tagId: tagMap["licensed"].id },
      { venueId: jmiVenue.id, tagId: tagMap["student-friendly"].id },
      { venueId: jmiVenue.id, tagId: tagMap["original-music"].id },
      { venueId: jmiVenue.id, tagId: tagMap["all-ages"].id },
      { venueId: deathAndCo.id, tagId: tagMap["late-night"].id },
      { venueId: deathAndCo.id, tagId: tagMap["intimate-venue"].id },
      { venueId: deathAndCo.id, tagId: tagMap["bar"].id },
      { venueId: alligator.id, tagId: tagMap["improvised"].id },
      { venueId: alligator.id, tagId: tagMap["free-entry"].id },
      { venueId: alligator.id, tagId: tagMap["late-night"].id },
    ],
    skipDuplicates: true,
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
