import type { Express } from "express";
import { createServer, type Server } from "http";
import { mergedCategories, apiMapping, fetchImage } from "./categories";

export function registerRoutes(app: Express): Server {
  app.get("/api/categories", (req, res) => {
    res.json(mergedCategories);
  });

  app.get("/api/images", async (req, res, next) => {
    try {
      let { category } = req.query;

      if (!category || category === "all") {
        const randomIndex = Math.floor(Math.random() * mergedCategories.length);
        category = mergedCategories[randomIndex];
      }

      if (typeof category !== 'string' || !apiMapping[category]) {
        return res.status(400).json({ message: "Invalid category" });
      }

      const availableApis = apiMapping[category];
      if (availableApis.length === 0) {
        return res.status(404).json({ message: "No API found for this category" });
      }

      const randomApi = availableApis[Math.floor(Math.random() * availableApis.length)];

      const imageUrl = await fetchImage(randomApi.api, randomApi.source, category);

      if (imageUrl) {
        res.json({
          url: imageUrl,
          apiSource: `${randomApi.api}-${randomApi.source}`,
          category: category,
        });
      } else {
        res.status(502).json({ message: "Failed to fetch image from external API" });
      }
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
