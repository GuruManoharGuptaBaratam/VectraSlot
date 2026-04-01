import { prisma } from "../utils/prisma";

async function testDB() {
  try {
    await prisma.$connect();
    console.log("✅ DB Connected");

    const users = await prisma.user.findMany();
    console.log("Users:", users);

  } catch (err) {
    console.error("❌ DB Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

testDB();
