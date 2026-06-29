import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { users } from "./schema";

async function main() {
  const email = process.env.SEED_USER_EMAIL;
  const password = process.env.SEED_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "SEED_USER_EMAIL and SEED_USER_PASSWORD must be set in .env.local",
    );
  }

  const normalizedEmail = email.toLowerCase().trim();
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  const passwordHash = await bcrypt.hash(password, 10);

  if (existing) {
    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, existing.id));
    console.log(`Updated password for existing user ${normalizedEmail}`);
  } else {
    await db.insert(users).values({ email: normalizedEmail, passwordHash });
    console.log(`Created user ${normalizedEmail}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
