import { PrismaClient } from "../generated/prisma";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from 'dotenv';

dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // normal postgres URL
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
});
