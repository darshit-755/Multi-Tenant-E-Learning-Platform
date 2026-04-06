import { Subject } from "../models/subject.model.js";

export const createSubject = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { name, description, status } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Subject name is required" });
    }

    const newSubject = await Subject.create({
      tenantId,
      name: String(name).trim(),
      description: description || "",
      status: status || "active",
    });

    return res.status(201).json({
      message: "Subject created successfully",
      subject: newSubject,
    });
  } catch (error) {
    console.error("Create Subject Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getSubjectsByTenant = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const subjects = await Subject.find({ tenantId }).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Subjects fetched successfully",
      subjects,
    });
  } catch (error) {
    console.error("Get Subjects Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { subjectId } = req.params;
    const { name, description, status } = req.body;

    const subject = await Subject.findOne({ _id: subjectId, tenantId });
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({ message: "Subject name is required" });
      }
      subject.name = String(name).trim();
    }

    if (description !== undefined) {
      subject.description = description;
    }

    if (status !== undefined) {
      subject.status = status;
    }

    await subject.save();

    return res.status(200).json({
      message: "Subject updated successfully",
      subject,
    });
  } catch (error) {
    console.error("Update Subject Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
