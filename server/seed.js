import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import MenuItem from "./models/MenuItem.js";
import User from "./models/User.js";

dotenv.config();

const initialMenu = [
  { itemId: "cappuccino", name: "Cappuccino", price: 220, cat: "hot", img: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=500&q=80", note: "Espresso, steamed milk, thick foam", dietary: [] },
  { itemId: "americano", name: "Americano", price: 180, cat: "hot", img: "https://images.unsplash.com/photo-1551030173-122aabc4489c?auto=format&fit=crop&w=500&q=80", note: "Double shot, hot water, bright finish", dietary: ["vegan", "dairy-free"] },
  { itemId: "espresso", name: "Espresso", price: 160, cat: "hot", img: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?auto=format&fit=crop&w=500&q=80", note: "Single origin, pulled to order", dietary: ["vegan", "dairy-free"] },
  { itemId: "latte", name: "Vanilla Latte", price: 210, cat: "hot", img: "https://images.unsplash.com/photo-1561882468-9110e03e0f78?auto=format&fit=crop&w=500&q=80", note: "Silky milk, house vanilla syrup", dietary: [] },
  { itemId: "flatwhite", name: "Flat White", price: 230, cat: "hot", img: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=500&q=80", note: "Double ristretto, microfoam", dietary: [] },
  { itemId: "coldbrew", name: "Cold Brew", price: 190, cat: "iced", img: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=500&q=80", note: "Steeped 18 hours, served over ice", dietary: ["vegan", "dairy-free"] },
  { itemId: "icedlatte", name: "Iced Latte", price: 210, cat: "iced", img: "https://images.unsplash.com/photo-1517959105821-eaf2591984ca?auto=format&fit=crop&w=500&q=80", note: "Chilled espresso, cold milk, ice", dietary: [] },
  { itemId: "mocha", name: "Iced Mocha", price: 240, cat: "iced", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ50FIUEke4G1KmlYFayyh5VWMXR7btXTMuEmlTZV6IsA&s=10", note: "Dark cocoa, espresso, cold milk", dietary: [] },
  { itemId: "caramel", name: "Caramel Macchiato", price: 250, cat: "iced", img: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=500&q=80", note: "Vanilla, milk, espresso, caramel drizzle", dietary: [] },
  { itemId: "strawberry", name: "Strawberry Refresher", price: 250, cat: "specialty", img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=500&q=80", note: "Muddled strawberry, soda, mint", dietary: ["vegan", "dairy-free", "gluten-free"] },
  { itemId: "matcha", name: "Matcha Latte", price: 230, cat: "specialty", img: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=500&q=80", note: "Ceremonial matcha, oat milk option", dietary: ["gluten-free"] },
];

export const seedDB = async () => {
  try {
    // Idempotent + concurrency-safe: upsert by itemId so overlapping cold starts
    // (e.g. first Vercel deploy) never insert duplicates or fail a seed run.
    // $setOnInsert preserves admin edits — existing menu docs are never touched.
    const result = await MenuItem.bulkWrite(
      initialMenu.map((item) => ({
        updateOne: {
          filter: { itemId: item.itemId },
          update: { $setOnInsert: item },
          upsert: true,
        },
      }))
    );
    if (result.upsertedCount > 0) {
      console.log(`Menu seed: inserted ${result.upsertedCount} missing items.`);
    }

    // Seed admin user from environment only (no hardcoded credentials in source)
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (adminEmail && adminPassword) {
      const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
      if (!existingAdmin) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);
        await User.create({
          name: "Admin",
          email: adminEmail.toLowerCase(),
          password: hashedPassword,
          role: "admin",
        });
        console.log(`Seeded admin user: ${adminEmail}`);
      } else if (existingAdmin.role !== "admin") {
        existingAdmin.role = "admin";
        await existingAdmin.save();
        console.log(`Updated ${adminEmail} to admin role.`);
      }
    } else {
      console.warn(
        "[seed] ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin user seeding. " +
          "Set them in .env to create/update an admin account."
      );
    }
  } catch (error) {
    console.error("Seeding error:", error);
  }
};
