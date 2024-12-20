const express = require("express");
const Project = require("../models/Project");
const router = express.Router();
const multer = require("multer");
const ProjectImage = require("../models/ProjectImage");

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new Error("Only .jpeg, .png, and .gif formats allowed!"),
        false
      );
    }
    cb(null, true);
  },
});

router.post("/", upload.array("images", 6), async (req, res) => {
  try {
    const { title, description, organizer, startDate, endDate, location } =
      req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const images = await Promise.all(
      req.files.map(async (file) => {
        const newImage = new ProjectImage({
          data: file.buffer,
          contentType: file.mimetype,
          filename: file.originalname,
        });
        const savedImage = await newImage.save();
        return savedImage._id;
      })
    );

    const project = new Project({
      title,
      description,
      organizer,
      startDate,
      endDate,
      location,
      images,
    });

    await project.save();
    res.status(201).json({ message: "Project created successfully", project });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating project", error: error.message });
  }
});

router.get("/some-route", (req, res) => {
  const token = req.cookies.accessToken;
  if (token) {
    res.json({ token });
  } else {
    res.status(401).json({ message: "Token not found" });
  }
});

// Получение изображений по ID
router.get("/images/:id", async (req, res) => {
  try {
    const image = await ProjectImage.findById(req.params.id);
    if (!image) return res.status(404).json({ error: "Image not found" });

    res.setHeader("Content-Type", image.contentType);
    res.send(image.data);
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).json({ error: "An error occurred while fetching image." });
  }
});

// Получение всех проектов
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find();
    // .populate("organizer", "name email");
    res.status(200).json(projects);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching projects", error: error.message });
  }
});

// Получение проекта по ID
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("organizer", "name email")
      .populate(
        "participants.user",
        "name email _id firstName lastName avatar"
      );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json(project);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching project", error: error.message });
  }
});

// Обновление проекта по ID
router.put("/:id", upload.array("images", 6), async (req, res) => {
  try {
    const { participants, ...updateFields } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    let images = project.images || [];

    // Если новые изображения были загружены
    if (req.files && req.files.length > 0) {
      if (req.files.length > 6) {
        return res
          .status(400)
          .json({ message: "You can upload up to 6 images" });
      }

      // Удаляем старые изображения из базы данных
      await ProjectImage.deleteMany({ _id: { $in: images } });

      // Сохраняем новые изображения в базе данных
      const newImages = await Promise.all(
        req.files.map(async (file) => {
          const newImage = new ProjectImage({
            data: file.buffer,
            contentType: file.mimetype,
            filename: file.originalname,
          });
          const savedImage = await newImage.save();
          return savedImage._id;
        })
      );

      // Обновляем массив изображений новыми
      images = newImages;
    }

    if (Array.isArray(participants)) {
      if (participants.length > 0) {
        // Удаляем участников из проекта, которых нет в новом списке
        project.participants = project.participants.filter(
          (participant) =>
            !participants.some(
              (newParticipant) =>
                newParticipant._id.toString() === participant.user.toString()
            )
        );

        // Добавляем новых участников в проект
        for (let newParticipant of participants) {
          const isAlreadyParticipant = project.participants.some(
            (participant) =>
              participant.user.toString() === newParticipant._id.toString()
          );

          if (!isAlreadyParticipant) {
            const participant = {
              user: newParticipant._id,
              joinedAt: new Date().toISOString(),
            };
            project.participants.push(participant);
          }
        }
      } else {
        // Если participants пустой, можно очистить список участников
        project.participants = [];
      }
    }

    // Обновляем поля проекта
    Object.keys(updateFields).forEach((key) => {
      if (["id", "_id", "createdAt", "updatedAt"].includes(key)) {
        return;
      }
      project[key] = updateFields[key];
    });

    // Обновляем список изображений
    project.images = images;

    await project.populate(
      "participants.user",
      "_id name email firstName lastName avatar"
    );

    await project.save();

    res.status(200).json({
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({
      message: "Error updating project",
      error: error.message,
    });
  }
});

// Удаление проекта по ID
router.delete("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Удаление изображений, связанных с проектом
    if (project.images && project.images.length > 0) {
      await ProjectImage.deleteMany({ _id: { $in: project.images } });
    }

    await Project.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting project", error: error.message });
  }
});

module.exports = router;
