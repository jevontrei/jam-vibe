import "dotenv/config";
import ws from "ws";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

// THIS script could've been deleted, but i kept it here in case we need to seed other stuff later - will just need to tweak a couple of things

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const asset = await prisma.siteAsset.upsert({
    where: { key: "about-hero" },
    create: {
      key: "about-hero",
      s3Key: "images/about/JAM_tony.jpeg",
      altText: "Tony — Brisbane jazz scene",
    },
    update: {
      s3Key: "images/about/JAM_tony.jpeg",
      altText: "Tony — Brisbane jazz scene",
    },
  });
  console.log("Upserted:", asset);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
