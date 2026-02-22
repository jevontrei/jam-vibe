import "dotenv/config"
import ws from "ws"
import { neonConfig } from "@neondatabase/serverless"
import { PrismaClient, ContentStatus, Frequency, OrgCategory } from "../src/generated/prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"

// Required for Neon serverless driver in Node.js (not needed on Vercel edge)
neonConfig.webSocketConstructor = ws

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// Seed dates relative to today
const today = new Date()
const d = (daysFromNow: number, hour: number, minute = 0) => {
  const dt = new Date(today)
  dt.setDate(dt.getDate() + daysFromNow)
  dt.setHours(hour, minute, 0, 0)
  return dt
}

async function main() {
  console.log("Seeding...")

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
  })

  // ── Instruments ───────────────────────────────────────────────────────────
  const instrumentNames = [
    "bass", "guitar", "piano", "drums", "trumpet", "saxophone",
    "trombone", "vocals", "synth", "violin", "flute", "double bass",
  ]
  const instruments = await Promise.all(
    instrumentNames.map(name =>
      prisma.instrument.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  )
  const instrMap = Object.fromEntries(instruments.map(i => [i.name, i]))

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
  ]
  const tags = await Promise.all(
    tagDefs.map(t =>
      prisma.tag.upsert({
        where: { name: t.name },
        update: {},
        create: t,
      })
    )
  )
  const tagMap = Object.fromEntries(tags.map(t => [t.name, t]))

  // ── Venues ────────────────────────────────────────────────────────────────
  const triffid = await prisma.venue.upsert({
    where: { slug: "the-triffid" },
    update: {},
    create: {
      name: "The Triffid",
      slug: "the-triffid",
      address: "Stratton St, Newstead QLD 4006",
      suburb: "Newstead",
      description: "A converted airline hangar turned music venue. One of Brisbane's best rooms for live jazz.",
      links: [{ label: "Website", url: "https://thetriffid.com.au" }],
      status: ContentStatus.PUBLISHED,
      createdById: admin.id,
    },
  })

  const mirrorball = await prisma.venue.upsert({
    where: { slug: "mirrorball-ministries" },
    update: {},
    create: {
      name: "Mirrorball Ministries",
      slug: "mirrorball-ministries",
      address: "Fortitude Valley QLD 4006",
      suburb: "Fortitude Valley",
      description: "Intimate late-night venue in the Valley. Strong on experimental and jazz-adjacent sounds.",
      status: ContentStatus.PUBLISHED,
      createdById: admin.id,
    },
  })

  const bjc = await prisma.venue.upsert({
    where: { slug: "brisbane-jazz-club" },
    update: {},
    create: {
      name: "Brisbane Jazz Club",
      slug: "brisbane-jazz-club",
      address: "1 Annie St, Kangaroo Point QLD 4169",
      suburb: "Kangaroo Point",
      description: "The heartbeat of Brisbane's traditional jazz scene since 1972.",
      links: [{ label: "Website", url: "https://brisbanejazzclub.com.au" }],
      status: ContentStatus.PUBLISHED,
      createdById: admin.id,
    },
  })

  const joynt = await prisma.venue.upsert({
    where: { slug: "the-joynt" },
    update: {},
    create: {
      name: "The Joynt",
      slug: "the-joynt",
      address: "West End QLD 4101",
      suburb: "West End",
      description: "Neighbourhood bar in West End. Casual, friendly, and reliably good music.",
      status: ContentStatus.PUBLISHED,
      createdById: admin.id,
    },
  })

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
  })
  await prisma.personInstrument.upsert({
    where: { personId_instrumentId: { personId: liv.id, instrumentId: instrMap["saxophone"].id } },
    update: {},
    create: { personId: liv.id, instrumentId: instrMap["saxophone"].id },
  })

  const melody = await prisma.person.upsert({
    where: { slug: "melody-graves" },
    update: {},
    create: {
      name: "Melody Graves",
      slug: "melody-graves",
      bio: "Vocalist and pianist. Known for her work across the modern and classic jazz repertoire.",
      createdById: admin.id,
    },
  })
  for (const instr of ["vocals", "piano"]) {
    await prisma.personInstrument.upsert({
      where: { personId_instrumentId: { personId: melody.id, instrumentId: instrMap[instr].id } },
      update: {},
      create: { personId: melody.id, instrumentId: instrMap[instr].id },
    })
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
  })
  await prisma.personInstrument.upsert({
    where: { personId_instrumentId: { personId: jordy.id, instrumentId: instrMap["guitar"].id } },
    update: {},
    create: { personId: jordy.id, instrumentId: instrMap["guitar"].id },
  })

  const joel = await prisma.person.upsert({
    where: { slug: "joel-von-treifeldt" },
    update: {},
    create: {
      name: "Joel Von Treifeldt",
      slug: "joel-von-treifeldt",
      bio: "Bassist. Active across jazz, improvised, and experimental music in Meanjin.",
      createdById: admin.id,
    },
  })
  await prisma.personInstrument.upsert({
    where: { personId_instrumentId: { personId: joel.id, instrumentId: instrMap["bass"].id } },
    update: {},
    create: { personId: joel.id, instrumentId: instrMap["bass"].id },
  })

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
  })
  for (const personId of [liv.id, jordy.id, joel.id]) {
    await prisma.projectMember.upsert({
      where: { projectId_personId: { projectId: rumblePack.id, personId } },
      update: {},
      create: { projectId: rumblePack.id, personId },
    })
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
  })
  for (const { personId, role } of [
    { personId: melody.id, role: "leader" },
    { personId: jordy.id, role: null },
    { personId: joel.id, role: null },
  ]) {
    await prisma.projectMember.upsert({
      where: { projectId_personId: { projectId: melodyQuartet.id, personId } },
      update: {},
      create: { projectId: melodyQuartet.id, personId, role },
    })
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
  })

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
  })
  for (const personId of [liv.id, joel.id]) {
    await prisma.projectMember.upsert({
      where: { projectId_personId: { projectId: liveAtLivs.id, personId } },
      update: {},
      create: { projectId: liveAtLivs.id, personId },
    })
  }

  // ── Residency ─────────────────────────────────────────────────────────────
  const livsResidency = await prisma.residency.upsert({
    where: { slug: "live-at-livs-sundays" },
    update: {},
    create: {
      name: "Live at Liv's",
      slug: "live-at-livs-sundays",
      description: "Every Sunday night Liv Marlton hosts an open session at Mirrorball. The house band kicks off at 7pm and the jam runs until late. All levels welcome — bring your axe.",
      dayOfWeek: 6,
      frequency: Frequency.WEEKLY,
      startTime: "19:00",
      active: true,
      venueId: mirrorball.id,
      projectId: liveAtLivs.id,
      createdById: admin.id,
    },
  })
  await prisma.residencyTag.createMany({
    data: [
      { residencyId: livsResidency.id, tagId: tagMap["sit-in-welcome"].id },
      { residencyId: livsResidency.id, tagId: tagMap["modern-jazz"].id },
      { residencyId: livsResidency.id, tagId: tagMap["free-entry"].id },
    ],
    skipDuplicates: true,
  })

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
      description: "The collective returns to The Triffid for a night of unhinged improvisation.",
      price: "$15 / $10 conc",
      featured: true,
      status: ContentStatus.PUBLISHED,
      createdById: admin.id,
    },
  })
  await prisma.gigLineup.upsert({
    where: { gigId_projectId: { gigId: gig1.id, projectId: rumblePack.id } },
    update: {},
    create: { gigId: gig1.id, projectId: rumblePack.id, order: 1 },
  })
  await prisma.gigTag.createMany({
    data: [
      { gigId: gig1.id, tagId: tagMap["free-jazz"].id },
      { gigId: gig1.id, tagId: tagMap["instrumental"].id },
    ],
    skipDuplicates: true,
  })

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
  })
  await prisma.gigLineup.upsert({
    where: { gigId_projectId: { gigId: gig2.id, projectId: liveAtLivs.id } },
    update: {},
    create: { gigId: gig2.id, projectId: liveAtLivs.id, order: 1 },
  })
  await prisma.gigTag.createMany({
    data: [
      { gigId: gig2.id, tagId: tagMap["sit-in-welcome"].id },
      { gigId: gig2.id, tagId: tagMap["free-entry"].id },
    ],
    skipDuplicates: true,
  })

  // Tomorrow
  const gig3 = await prisma.gig.upsert({
    where: { slug: "melody-graves-quartet-bjc-" + d(1, 0).toISOString().slice(0, 10) },
    update: {},
    create: {
      title: "Melody Graves Quartet",
      slug: "melody-graves-quartet-bjc-" + d(1, 0).toISOString().slice(0, 10),
      datetime: d(1, 19, 30),
      venueId: bjc.id,
      description: "An evening of standards and originals with one of Brisbane's finest vocalists.",
      price: "$20 / $15 members",
      status: ContentStatus.PUBLISHED,
      createdById: admin.id,
    },
  })
  await prisma.gigLineup.upsert({
    where: { gigId_projectId: { gigId: gig3.id, projectId: melodyQuartet.id } },
    update: {},
    create: { gigId: gig3.id, projectId: melodyQuartet.id, order: 1 },
  })
  await prisma.gigTag.createMany({
    data: [
      { gigId: gig3.id, tagId: tagMap["modern-jazz"].id },
      { gigId: gig3.id, tagId: tagMap["vocal"].id },
    ],
    skipDuplicates: true,
  })

  // Day +2
  const gig4 = await prisma.gig.upsert({
    where: { slug: "obscure-orchestra-triffid-" + d(2, 0).toISOString().slice(0, 10) },
    update: {},
    create: {
      title: "Obscure Orchestra",
      slug: "obscure-orchestra-triffid-" + d(2, 0).toISOString().slice(0, 10),
      datetime: d(2, 20, 30),
      venueId: triffid.id,
      description: "Twelve players, zero plan. The Obscure Orchestra does it again.",
      price: "$25",
      status: ContentStatus.PUBLISHED,
      createdById: admin.id,
    },
  })
  await prisma.gigLineup.upsert({
    where: { gigId_projectId: { gigId: gig4.id, projectId: obscureOrch.id } },
    update: {},
    create: { gigId: gig4.id, projectId: obscureOrch.id, order: 1 },
  })
  await prisma.gigTag.createMany({
    data: [
      { gigId: gig4.id, tagId: tagMap["big-band"].id },
      { gigId: gig4.id, tagId: tagMap["free-jazz"].id },
    ],
    skipDuplicates: true,
  })

  // Day +4
  const gig5 = await prisma.gig.upsert({
    where: { slug: "rumble-pack-joynt-" + d(4, 0).toISOString().slice(0, 10) },
    update: {},
    create: {
      title: "Rumble Pack (acoustic set)",
      slug: "rumble-pack-joynt-" + d(4, 0).toISOString().slice(0, 10),
      datetime: d(4, 18, 0),
      venueId: joynt.id,
      description: "A rare stripped-back set from Rumble Pack — no amplification, full chaos.",
      price: "Free",
      status: ContentStatus.PUBLISHED,
      createdById: admin.id,
    },
  })
  await prisma.gigLineup.upsert({
    where: { gigId_projectId: { gigId: gig5.id, projectId: rumblePack.id } },
    update: {},
    create: { gigId: gig5.id, projectId: rumblePack.id, order: 1 },
  })
  await prisma.gigTag.createMany({
    data: [
      { gigId: gig5.id, tagId: tagMap["free-entry"].id },
      { gigId: gig5.id, tagId: tagMap["free-jazz"].id },
      { gigId: gig5.id, tagId: tagMap["all-ages"].id },
    ],
    skipDuplicates: true,
  })

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
  })
  await prisma.gigLineup.upsert({
    where: { gigId_projectId: { gigId: gig6.id, projectId: liveAtLivs.id } },
    update: {},
    create: { gigId: gig6.id, projectId: liveAtLivs.id, order: 1 },
  })
  await prisma.gigTag.createMany({
    data: [
      { gigId: gig6.id, tagId: tagMap["sit-in-welcome"].id },
      { gigId: gig6.id, tagId: tagMap["free-entry"].id },
    ],
    skipDuplicates: true,
  })

  // ── Organisations ─────────────────────────────────────────────────────────
  await prisma.organisation.upsert({
    where: { slug: "jmi" },
    update: {},
    create: {
      name: "Jazz Music Institute",
      slug: "jmi",
      category: OrgCategory.SCHOOL,
      description: "Brisbane's dedicated jazz conservatoire. Produces many of the working musicians in the Meanjin scene.",
      links: [{ label: "Website", url: "https://jmi.edu.au" }],
      createdById: admin.id,
    },
  })

  await prisma.organisation.upsert({
    where: { slug: "qcgu" },
    update: {},
    create: {
      name: "Queensland Conservatorium Griffith University",
      slug: "qcgu",
      category: OrgCategory.SCHOOL,
      description: "The Con. Classical and jazz training in South Bank.",
      links: [{ label: "Website", url: "https://www.griffith.edu.au/arts-education-law/queensland-conservatorium" }],
      createdById: admin.id,
    },
  })

  await prisma.organisation.upsert({
    where: { slug: "4zzz" },
    update: {},
    create: {
      name: "4ZZZ Community Radio",
      slug: "4zzz",
      category: OrgCategory.RADIO,
      description: "Brisbane's independent community radio station. Home to several jazz and improvised music programs.",
      links: [{ label: "Website", url: "https://4zzz.org.au" }],
      createdById: admin.id,
    },
  })

  console.log("Done.")
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
