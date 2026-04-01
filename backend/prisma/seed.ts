// prisma/seed.ts
import "dotenv/config";
import { prisma } from "../src/utils/prisma";

async function main() {
  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@vectraslot.com",
      password: "hashed_password_here", // use bcrypt in real app
      role: "ADMIN",
    },
  });

  console.log("✅ Admin created");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
