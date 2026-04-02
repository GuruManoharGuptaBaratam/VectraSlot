import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/utils/prisma";
import { Role } from "../src/generated/prisma";

/**
 * Seed script for initial test data.
 * NOTE: Admin creation is handled via private injection for security.
 */
async function main() {
    const testEmail = "test@example.com";
    const testPassword = "testPassword123";

    console.log("Checking for existing test user...");
    const existingUser = await prisma.user.findUnique({
        where: { email: testEmail }
    });

    if (!existingUser) {
        console.log("Seeding test user...");
        const hashedPassword = await bcrypt.hash(testPassword, 10);
        await prisma.user.create({
            data: {
                name: "Test User",
                email: testEmail,
                password: hashedPassword,
                role: Role.USER
            }
        });
        console.log("✅ Test user created successfully!");
    } else {
        console.log("Test user already exists. Skipping...");
    }
}

main()
    .catch((err) => {
        console.error("Seed failed:", err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
