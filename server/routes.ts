import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fetch from "node-fetch";

export function registerRoutes(app: Express): Server {
  app.get("/api/waifu_im", async (req, res) => {
    const { category } = req.query;
    if (!category) {
      return res.status(400).json({ error: "Category is required" });
    }

    try {
      const response = await fetch(`https://api.waifu.im/search?included_tags=${category}&is_nsfw=true`, {
        headers: {
          'Authorization': `Bearer JV360MTjJZ7Mz4GsCguPOdvjjnl8sy6FOUjRw5kBtCG7nbon0IVKSHQeZpGbC8p0Wl2POxkjG5PPPc7C0sIgiwafl87-iPPYIuWRtL7HH8gAwgVABSpz0F2O_OlP0eE98geAv7xNzCjHYV-8dNPW8GirWy2CNFji4dI1LEnPD4k`,
          'Accept-Version': 'v6'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch from waifu.im: ${response.statusText}`);
      }

      const data = await response.json();
      const imageUrl = data.images?.[0]?.url;

      if (imageUrl) {
        res.json({ url: imageUrl });
      } else {
        res.status(404).json({ error: "Image not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
