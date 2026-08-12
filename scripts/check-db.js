import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

async function main() {
  const userCount = await p.user.count();
  const labCount = await p.lab.count();
  let bookingCount = 0;
  try {
    bookingCount = await p.booking.count();
  } catch (e) {
    console.log("booking query error:", e.message);
  }

  console.log("Jumlah user:", userCount);
  console.log("Jumlah lab:", labCount);
  console.log("Jumlah booking:", bookingCount);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await p.$disconnect();
  });
