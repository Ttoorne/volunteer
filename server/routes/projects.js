const express = require("express");
const Project = require("../models/Project");
const User = require("../models/User");
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

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ error: "Invalid start or end date." });
    }

    const timeDiff = end - start;
    const hours = timeDiff / (1000 * 60 * 60);

    const project = new Project({
      title,
      description,
      organizer,
      startDate,
      endDate,
      location,
      images,
      hours,
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
      .populate("organizer", "_id name email")
      .populate("participants.user", "name email _id firstName lastName avatar")
      .populate("reviews.user", "name email _id firstName lastName avatar");

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
    const { startDate, endDate, participants, status, ...updateFields } =
      req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (startDate && endDate) {
      const isValidDate = (date) => !isNaN(new Date(date).getTime());

      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        return res.status(400).json({ error: "Invalid startDate or endDate." });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      const timeDiff = end - start;
      const hours = timeDiff / (1000 * 60 * 60);

      project.startDate = start;
      project.endDate = end;
      project.hours = Math.round(hours * 100) / 100;
    }

    let images = project.images || [];

    // Если новые изображения были загружены
    if (req.files && req.files.length > 0) {
      if (req.files.length > 6) {
        return res
          .status(400)
          .json({ message: "You can upload up to 6 images" });
      }

      // Удаляем старые изображения
      await ProjectImage.deleteMany({ _id: { $in: images } });

      // Загружаем новые изображения
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

      images = newImages;
    }

    // Обрабатываем участников
    if (Array.isArray(participants)) {
      // Сначала удаляем всех старых участников из joinedEvents
      for (let participant of project.participants) {
        try {
          await User.findByIdAndUpdate(
            participant.user,
            { $pull: { joinedEvents: project._id } },
            { new: true }
          );
        } catch (err) {
          console.error(
            `Failed to remove project for user ${participant.user}:`,
            err
          );
        }
      }

      // Если есть новые участники
      if (participants.length > 0) {
        const hasUserKey = participants.some((participant) => participant.user);

        // Обновляем участников в проекте
        if (hasUserKey) {
          project.participants = project.participants.filter((participant) =>
            participants.some(
              (newParticipant) =>
                newParticipant?.user._id.toString() ===
                participant.user.toString()
            )
          );
        } else {
          project.participants = project.participants.filter(
            (participant) =>
              !participants.some(
                (newParticipant) =>
                  participant.user.toString() === newParticipant._id.toString()
              )
          );
        }

        // Добавляем новых участников
        for (let newParticipant of participants) {
          const isAlreadyParticipant = project.participants.some(
            (participant) => {
              if (newParticipant.user) {
                return (
                  newParticipant?.user._id.toString() ===
                  participant.user.toString()
                );
              } else {
                return (
                  participant.user.toString() === newParticipant._id.toString()
                );
              }
            }
          );

          if (!isAlreadyParticipant) {
            const participant = {
              user: newParticipant.user
                ? newParticipant.user._id
                : newParticipant._id,
              joinedAt: new Date().toISOString(),
            };
            project.participants.push(participant);
            const userEvent = await User.findById(participant.user);
            if (userEvent) {
              await User.findByIdAndUpdate(
                participant.user,
                { $addToSet: { joinedEvents: project._id } },
                { new: true }
              );
            }
          }
        }
      } else {
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

    // Обновляем изображения проекта
    project.images = images;

    // Заполняем данные участников
    await project.populate(
      "participants.user",
      "_id name email firstName lastName avatar"
    );

    // Сохраняем проект
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

// Изменение статуса проекта по ID
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.status = status;
    await project.save();

    res.status(200).json({
      message: "Status updated successfully",
      project,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({
      message: "Error updating status",
      error: error.message,
    });
  }
});

// ?? Project Review
// Получение отзывов по ID проекта
router.get("/:id/reviews", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "reviews.user",
      "name email _id firstName lastName avatar"
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({
      message: "Reviews fetched successfully",
      reviews: project.reviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({
      message: "Error fetching reviews",
      error: error.message,
    });
  }
});

// Добавление отзыва к проекту по ID
router.post("/:id/reviews", async (req, res) => {
  try {
    const { rating, comment, user } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!rating || rating < 0 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 0 and 5" });
    }

    const newReview = {
      user,
      rating,
      comment,
      createdAt: new Date(),
    };

    project.reviews.push(newReview);
    await project.save();

    res.status(201).json({
      message: "Review added successfully",
      review: newReview,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({
      message: "Error adding review",
      error: error.message,
    });
  }
});

// Изменение отзыва по ID проекта и ID отзыва
router.put("/:id/reviews/:reviewId", async (req, res) => {
  try {
    const { id, reviewId } = req.params;
    const { rating, comment } = req.body;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const review = project.reviews.find(
      (review) => review._id.toString() === reviewId
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Проверяем корректность рейтинга
    if (rating && (rating < 0 || rating > 5)) {
      return res
        .status(400)
        .json({ message: "Rating must be between 0 and 5" });
    }

    // Обновляем отзыв
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    review.updatedAt = new Date();
    await project.save();

    res.status(200).json({
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({
      message: "Error updating review",
      error: error.message,
    });
  }
});

// Удаление отзыва по ID проекта и ID отзыва
router.delete("/:id/reviews/:reviewId", async (req, res) => {
  try {
    const { id, reviewId } = req.params;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const reviewIndex = project.reviews.findIndex(
      (review) => review._id.toString() === reviewId
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Удаляем отзыв
    project.reviews.splice(reviewIndex, 1);
    await project.save();

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({
      message: "Error deleting review",
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
