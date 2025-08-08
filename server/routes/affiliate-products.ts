import { Router } from "express";
// Database operations temporarily disabled - using Supabase storage instead
// import { db } from "../db";
import { affiliateProducts } from "@shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Get all active affiliate products
router.get("/", async (req, res) => {
  try {
    // Temporarily return empty array - needs Supabase integration
    res.json([]);
    return;
    const products = await db
      .select()
      .from(affiliateProducts)
      .where(eq(affiliateProducts.isActive, true))
      .orderBy(affiliateProducts.rating);

    res.json(products);
  } catch (error) {
    console.error("Error fetching affiliate products:", error);
    res.status(500).json({ message: "Failed to fetch affiliate products" });
  }
});

// Get products by category
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const products = await db
      .select()
      .from(affiliateProducts)
      .where(eq(affiliateProducts.category, category))
      .where(eq(affiliateProducts.isActive, true))
      .orderBy(affiliateProducts.rating);

    res.json(products);
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// Seed affiliate products (development only)
router.post("/seed", async (req, res) => {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ message: "Not allowed in production" });
  }

  try {
    const seedProducts = [
      {
        name: "Meal Prep Containers Set",
        description: "BPA-free glass containers perfect for family meal prep",
        price: "29.99",
        imageUrl: "/api/placeholder/product1.jpg",
        affiliateUrl: "https://amazon.com/meal-prep-containers",
        brand: "FreshKeep",
        category: "Kitchen",
        commissionRate: "8.5",
        rating: "0.0",
        reviewCount: 0,
      },
      {
        name: "Organic Baby Wipes",
        description: "Gentle, eco-friendly wipes for sensitive skin",
        price: "24.99",
        imageUrl: "/api/placeholder/product2.jpg", 
        affiliateUrl: "https://target.com/organic-wipes",
        brand: "PureBaby",
        category: "Baby Care",
        commissionRate: "6.0",
        rating: "0.0",
        reviewCount: 0,
      },
      {
        name: "Home Organization Bins",
        description: "Stackable storage bins for decluttering any space",
        price: "39.99",
        imageUrl: "/api/placeholder/product3.jpg",
        affiliateUrl: "https://walmart.com/storage-bins",
        brand: "OrganizeIt",
        category: "Organization",
        commissionRate: "7.2",
        rating: "0.0",
        reviewCount: 0,
      },
      {
        name: "Essential Oil Diffuser",
        description: "Create a calming atmosphere for self-care time",
        price: "49.99",
        imageUrl: "/api/placeholder/product4.jpg",
        affiliateUrl: "https://amazon.com/essential-oil-diffuser",
        brand: "AromaZen",
        category: "Wellness",
        commissionRate: "12.0",
        rating: "0.0",
        reviewCount: 0,
      },
      {
        name: "Yoga Mat Premium",
        description: "Non-slip mat perfect for parent workout sessions",
        price: "59.99",
        imageUrl: "/api/placeholder/product5.jpg",
        affiliateUrl: "https://target.com/yoga-mat-premium",
        brand: "FlexFit",
        category: "Fitness",
        commissionRate: "10.5",
        rating: "0.0",
        reviewCount: 0,
      },
      {
        name: "Cleaning Supply Caddy",
        description: "Portable organizer for all your cleaning supplies",
        price: "19.99",
        imageUrl: "/api/placeholder/product6.jpg",
        affiliateUrl: "https://amazon.com/cleaning-caddy",
        brand: "CleanPro",
        category: "Cleaning",
        commissionRate: "9.0",
        rating: "4.3",
        reviewCount: 456,
      }
    ];

    const insertedProducts = await db
      .insert(affiliateProducts)
      .values(seedProducts)
      .returning();

    res.json({ 
      message: "Affiliate products seeded successfully", 
      count: insertedProducts.length 
    });
  } catch (error) {
    console.error("Error seeding affiliate products:", error);
    res.status(500).json({ message: "Failed to seed products" });
  }
});

export default router;