import ServiceModel from "../../Schema/services.schema.js";

class AdminServicesController {
  // Create a new service
  async createService(req, res) {
    try {
      const { slug, title, tagline, description, features } = req.body;
      const newService = new ServiceModel({ slug, title, tagline, description, features });
      const savedService = await newService.save();
      res.status(201).json(savedService);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ error: "Service with this slug already exists." });
      }
      res.status(500).json({ error: error.message });
    }
  }

  // Fetch all services, or a specific service by ID or slug
  async fetchServices(req, res) {
    try {
      const { id, slug } = req.query;
      let services;

      if (id) {
        services = await ServiceModel.findById(id);
        if (!services) return res.status(404).json({ error: "Service not found." });
      } else if (slug) {
        services = await ServiceModel.findOne({ slug });
        if (!services) return res.status(404).json({ error: "Service not found." });
      } else {
        services = await ServiceModel.find();
      }

      res.json(services);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Update a service by ID or slug
  async editService(req, res) {
    try {
      const { id, slug } = req.query;
      const updateData = req.body;

      let updatedService;
      if (id) {
        updatedService = await ServiceModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
      } else if (slug) {
        updatedService = await ServiceModel.findOneAndUpdate({ slug }, updateData, { new: true, runValidators: true });
      } else {
        return res.status(400).json({ error: "Provide either id or slug to update service." });
      }

      if (!updatedService) {
        return res.status(404).json({ error: "Service not found." });
      }

      res.json(updatedService);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Delete a service by ID or slug
  async deleteService(req, res) {
    try {
      const { id, slug } = req.query;

      let deletedService;
      if (id) {
        deletedService = await ServiceModel.findByIdAndDelete(id);
      } else if (slug) {
        deletedService = await ServiceModel.findOneAndDelete({ slug });
      } else {
        return res.status(400).json({ error: "Provide either id or slug to delete service." });
      }

      if (!deletedService) {
        return res.status(404).json({ error: "Service not found." });
      }

      res.json({ message: "Service deleted successfully." });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default AdminServicesController;