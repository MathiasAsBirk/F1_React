import { pickFields, sendModelError, validId } from "../utils/modelHelpers.js";

export function createCrudHandlers({ Model, fields, label, sort = {} }) {
  return {
    async getAll(_req, res) {
      try {
        const records = await Model.find().sort(sort).lean();
        return res.json(records);
      } catch (error) {
        return sendModelError(res, error, `${label} records could not be loaded.`);
      }
    },

    async getById(req, res) {
      if (!validId(req.params.id)) return res.status(400).json({ message: "Invalid record id." });
      try {
        const record = await Model.findById(req.params.id).lean();
        if (!record) return res.status(404).json({ message: `${label} was not found.` });
        return res.json(record);
      } catch (error) {
        return sendModelError(res, error, `${label} could not be loaded.`);
      }
    },

    async create(req, res) {
      try {
        const record = await Model.create(pickFields(req.body, fields));
        return res.status(201).json(record);
      } catch (error) {
        return sendModelError(res, error, `${label} could not be created.`);
      }
    },

    async update(req, res) {
      if (!validId(req.params.id)) return res.status(400).json({ message: "Invalid record id." });
      const changes = pickFields(req.body, fields);
      if (!Object.keys(changes).length) {
        return res.status(400).json({ message: "No supported fields were supplied." });
      }
      try {
        const record = await Model.findByIdAndUpdate(
          req.params.id,
          { $set: changes },
          { new: true, runValidators: true },
        );
        if (!record) return res.status(404).json({ message: `${label} was not found.` });
        return res.json(record);
      } catch (error) {
        return sendModelError(res, error, `${label} could not be updated.`);
      }
    },

    async remove(req, res) {
      if (!validId(req.params.id)) return res.status(400).json({ message: "Invalid record id." });
      try {
        const record = await Model.findByIdAndDelete(req.params.id);
        if (!record) return res.status(404).json({ message: `${label} was not found.` });
        return res.status(204).end();
      } catch (error) {
        return sendModelError(res, error, `${label} could not be deleted.`);
      }
    },
  };
}
