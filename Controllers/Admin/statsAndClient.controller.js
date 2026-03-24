import PlacementStatsAndClients from "../../Schema/statsAndClient.schema.js";
import { deleteUploadedFile } from "../../middlewares/ImageUploadMiddlewares/fileDelete.middleware.js";

/**
 * AdminStatsAndClientController
 * Placement Stats & Clients singleton dashboard controller
 * Supports image upload for clientLogo via multer (logo stored as file path)
 */
class AdminStatsAndClientController {
  // Fetch singleton document (create if doesn't exist)
  async getPlacementStatsAndClients(req, res) {
    try {
      let doc = await PlacementStatsAndClients.findOne();
      if (!doc) {
        doc = await PlacementStatsAndClients.create({ stats: [], clients: [] });
      }
      res.status(200).json(doc);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats and clients.", error: error.message });
    }
  }

  // Update stats array (no images involved)
  async updateStats(req, res) {
    try {
      const { stats } = req.body;
      if (!Array.isArray(stats)) {
        return res.status(400).json({ message: "Field 'stats' must be an array." });
      }
      for (const s of stats) {
        if (!s.label || !s.icon || typeof s.valueNum !== "number") {
          return res.status(400).json({ message: "Each stat must include label, icon, and valueNum." });
        }
      }
      let doc = await PlacementStatsAndClients.findOne();
      if (!doc) {
        doc = await PlacementStatsAndClients.create({ stats, clients: [] });
      } else {
        doc.stats = stats;
        await doc.save();
      }
      res.status(200).json({ message: "Stats updated", stats: doc.stats });
    } catch (error) {
      res.status(500).json({ message: "Failed to update stats.", error: error.message });
    }
  }

  // Update all clients (bulk replace). Handles optional single logo upload for one client
  async updateClients(req, res) {
    try {
      let { clients } = req.body;

      // If sent as JSON string (from multipart), parse it
      if (typeof clients === "string") {
        try {
          clients = JSON.parse(clients);
        } catch (err) {
          throw new Error("Failed to parse clients: malformed JSON.");
        }
      }

      if (!Array.isArray(clients)) {
        return res.status(400).json({ message: "Field 'clients' must be an array." });
      }

      // If logo uploaded, find which client to attach it to (clientIndex param, or default first)
      let clientLogoFile = req.file;
      if (clientLogoFile) {
        let whichIdx = Number(req.body.clientIndex ?? 0);
        if (whichIdx < 0 || whichIdx >= clients.length) whichIdx = 0;
        clients[whichIdx] = {
          ...clients[whichIdx],
          logo: clientLogoFile.path,
        };
      }

      // Validate: All clients must have name
      for (const c of clients) {
        if (!c.name) {
          if (clientLogoFile) deleteUploadedFile(clientLogoFile);
          return res.status(400).json({ message: "Each client must include a name." });
        }
      }

      let doc = await PlacementStatsAndClients.findOne();
      if (!doc) {
        doc = await PlacementStatsAndClients.create({ stats: [], clients });
      } else {
        // Optionally: Clean up logos for removed clients? (Not implemented here for PUT.)
        doc.clients = clients;
        await doc.save();
      }
      res.status(200).json({ message: "Clients updated", clients: doc.clients });
    } catch (error) {
      // If image was just uploaded and an error occurs, clean up uploaded file (avoid orphan)
      if (req.file) {
        deleteUploadedFile(req.file);
      }
      res.status(500).json({ message: "Failed to update clients.", error: error.message });
    }
  }

  // Add a single client to the clients array WITH optional image upload
  async addClient(req, res) {
    try {
      // "name", "alt", "website" in body; logo in req.file (from multer)
      const { name, alt, website } = req.body;
      const logoPath = req.file ? req.file.path : undefined;

      if (!name) {
        // Remove uploaded file on error
        if (req.file) deleteUploadedFile(req.file);
        return res.status(400).json({ message: "Client name is required." });
      }

      let doc = await PlacementStatsAndClients.findOne();
      if (!doc) doc = await PlacementStatsAndClients.create({ stats: [], clients: [] });
      const clientData = {
        name,
        alt,
        website,
        logo: logoPath,
      };
      doc.clients.push(clientData);
      await doc.save();
      res.status(201).json({ message: "Client added.", clients: doc.clients });
    } catch (error) {
      if (req.file) deleteUploadedFile(req.file);
      res.status(500).json({ message: "Failed to add client.", error: error.message });
    }
  }

  // Remove a client by _id from the clients array AND delete associated logo file
  async deleteClient(req, res) {
    try {
      const { id } = req.params;
      let doc = await PlacementStatsAndClients.findOne();
      if (!doc) return res.status(404).json({ message: "Clients list not found." });
      const clientIdx = doc.clients.findIndex(c => String(c._id) === String(id));
      if (clientIdx === -1) {
        return res.status(404).json({ message: "Client not found." });
      }
      // Get logo path before removing
      const clientLogoPath = doc.clients[clientIdx].logo;
      doc.clients.splice(clientIdx, 1);
      await doc.save();
      // Delete uploaded logo if present
      if (clientLogoPath) deleteUploadedFile(clientLogoPath);
      res.status(200).json({ message: "Client removed.", clients: doc.clients });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove client.", error: error.message });
    }
  }

  // Add a stat to the stats array
  async addStat(req, res) {
    try {
      const { label, valueNum, valueSuffix, icon, color } = req.body;
      if (!label || !icon || typeof valueNum !== "number") {
        return res.status(400).json({ message: "label, icon, and valueNum required." });
      }
      let doc = await PlacementStatsAndClients.findOne();
      if (!doc) doc = await PlacementStatsAndClients.create({ stats: [], clients: [] });
      doc.stats.push({ label, valueNum, valueSuffix, icon, color });
      await doc.save();
      res.status(201).json({ message: "Stat added.", stats: doc.stats });
    } catch (error) {
      res.status(500).json({ message: "Failed to add stat.", error: error.message });
    }
  }

  // Remove a stat by _id from the stats array
  async deleteStat(req, res) {
    try {
      const { id } = req.params;
      let doc = await PlacementStatsAndClients.findOne();
      if (!doc) return res.status(404).json({ message: "Stats list not found." });
      const before = doc.stats.length;
      doc.stats = doc.stats.filter(s => String(s._id) !== String(id));
      if (doc.stats.length === before) {
        return res.status(404).json({ message: "Stat not found." });
      }
      await doc.save();
      res.status(200).json({ message: "Stat removed.", stats: doc.stats });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove stat.", error: error.message });
    }
  }

  // Replace the entire stats and clients arrays at once (optional, admin bulk op)
  async updateStatsAndClients(req, res) {
    try {
      let { stats, clients } = req.body;
      // Optionally parse JSON strings for multipart forms
      if (typeof stats === "string") {
        try { stats = JSON.parse(stats); } catch {}
      }
      if (typeof clients === "string") {
        try { clients = JSON.parse(clients); } catch {}
      }
      let doc = await PlacementStatsAndClients.findOne();
      if (!doc) {
        doc = await PlacementStatsAndClients.create({
          stats: Array.isArray(stats) ? stats : [],
          clients: Array.isArray(clients) ? clients : [],
        });
      } else {
        if (Array.isArray(stats)) doc.stats = stats;
        if (Array.isArray(clients)) doc.clients = clients;
        await doc.save();
      }
      res.status(200).json({ message: "Dashboard updated.", data: doc });
    } catch (error) {
      res.status(500).json({ message: "Failed to update dashboard.", error: error.message });
    }
  }
}

export default AdminStatsAndClientController;