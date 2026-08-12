const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const XLSX = require("xlsx");
const path = require("path");

const prisma = new PrismaClient();

const DEFAULT_PASSWORDS = {
  GURU: "guru123",
  ADMIN: "admin_labkom",
};

const SPECIAL_ADMINS = [
  { nama: "Asep Sukandar" },
  { nama: "Fajar Putra Gumilang" },
];

const LABS = [
  { id: "lab-1", nama: "Lab Komputer 1" },
  { id: "lab-2", nama: "Lab Komputer 2" },
];

function toUsername(nama) {
  return nama.toLowerCase().replace(/\s+/g, "");
}

function mapRole(nama, roleFromExcel) {
  const isSpecialAdmin = SPECIAL_ADMINS.some(
    (admin) => admin.nama.toLowerCase() === String(nama).toLowerCase().trim(),
  );
  if (isSpecialAdmin) return "ADMIN";

  const role = String(roleFromExcel ?? "")
    .trim()
    .toLowerCase();
  return role === "admin" ? "ADMIN" : "GURU";
}

function parseTeachersFromExcel(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  return rows
    .filter((row) => {
      const nama = row.__EMPTY;
      return typeof nama === "string" && nama.trim() && nama !== "NAMA GURU";
    })
    .map((row) => {
      const nama = String(row.__EMPTY).trim();
      return {
        nama,
        role: mapRole(nama, row.__EMPTY_1),
      };
    });
}

async function main() {
  console.log("Menyiapkan data Laboratorium...");
  for (const lab of LABS) {
    await prisma.lab.upsert({
      where: { id: lab.id },
      update: { nama: lab.nama },
      create: { id: lab.id, nama: lab.nama },
    });
    console.log(`✓ Lab: ${lab.nama} (${lab.id})`);
  }

  const filePath = path.join(__dirname, "..", "database-guru.xlsx");
  const teachers = parseTeachersFromExcel(filePath);

  if (teachers.length === 0) {
    throw new Error("Tidak ada data guru ditemukan di database-guru.xlsx");
  }

  console.log(
    `\nMemproses ${teachers.length} guru dari database-guru.xlsx...\n`,
  );

  let adminCount = 0;

  for (const teacher of teachers) {
    const username = toUsername(teacher.nama);
    const plainPassword = DEFAULT_PASSWORDS[teacher.role];
    const password = await bcrypt.hash(plainPassword, 10);

    await prisma.user.upsert({
      where: { username },
      update: {
        nama: teacher.nama,
        password,
        role: teacher.role,
      },
      create: {
        username,
        nama: teacher.nama,
        password,
        role: teacher.role,
      },
    });

    if (teacher.role === "ADMIN") adminCount++;
    console.log(`✓ ${teacher.nama} → ${username} (${teacher.role})`);
  }

  for (const admin of SPECIAL_ADMINS) {
    const username = toUsername(admin.nama);
    const password = await bcrypt.hash(DEFAULT_PASSWORDS.ADMIN, 10);

    await prisma.user.upsert({
      where: { username },
      update: {
        nama: admin.nama,
        password,
        role: "ADMIN",
      },
      create: {
        username,
        nama: admin.nama,
        password,
        role: "ADMIN",
      },
    });

    adminCount++;
    console.log(`✓ [ADMIN KHUSUS] ${admin.nama} → ${username} (ADMIN)`);
  }

  console.log(`\nSelesai seeding. Total akun diproses.`);
}

main()
  .catch((error) => {
    console.error("Seed gagal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
