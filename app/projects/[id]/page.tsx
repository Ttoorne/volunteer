"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { fetchUserData } from "@/server/utils/fetchUserData";
import { api } from "@/hooks/api";

import Alert from "@/components/Alert";
import ProjectEditModal from "@/components/ProjectEditModal";
import GenerateBackground from "@/components/GenerateBackground";

interface CurrentUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

interface Organizer {
  name: string;
  email: string;
}

interface Participant {
  user: CurrentUser;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  organizer?: Organizer;
  location: string;
  startDate: string;
  endDate?: string;
  images: string[];
  participants: Participant[];
}

const ProjectPage = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [alertData, setAlertData] = useState<{
    type: "warning" | "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [isEditModalOpen, setEditModalOpen] = useState<boolean>(false);
  const background = GenerateBackground();

  const API_BASE_URL = `${api}/projects`;

  const getTokenFromServer = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/some-route`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch token");

      const data = await response.json();
      setToken(data.token);
    } catch (error) {
      console.error("Error fetching token:", error);
    }
  };

  useEffect(() => {
    getTokenFromServer();
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchUser = async () => {
      try {
        const userData = await fetchUserData(token);
        setCurrentUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
  }, [token]);

  const fetchProject = async () => {
    if (!id) return;

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      if (!response.ok)
        throw new Error(`Error fetching project: ${response.statusText}`);

      const data: Project = await response.json();
      setProject(data);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setAlertData({ type: "error", message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinProject = async () => {
    if (!currentUser || !id) return;

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participants: [{ _id: currentUser._id }] }),
      });

      if (!response.ok) throw new Error("Failed to join the project");

      const updatedProject = await response.json();
      setProject(updatedProject.project);
      setAlertData({
        type: "success",
        message: "Successfully joined the project!",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setAlertData({ type: "warning", message: errorMessage });
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const getImageUrl = (imageId: string) => `${API_BASE_URL}/images/${imageId}`;

  const closeModal = () => setSelectedImage(null);

  const handleOpenEditModal = () => {
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
  };

  const deleteProject = async (projectId: string) => {
    try {
      const isConfirmed = window.confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      );
      if (!isConfirmed) return;

      const response = await fetch(`${API_BASE_URL}/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete project");
      }

      const result = await response.json();
      console.log("Project deleted successfully:", result.message);
      alert("Project deleted successfully!");
      return result;
    } catch (error: any) {
      console.error("Error deleting project:", error.message);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteProject = async (project: Project | null) => {
    if (!project || !project._id) {
      alert("Project ID is missing or invalid.");
      return;
    }

    await deleteProject(project._id);
    window.location.href = "/projects";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const formattedStartDate =
    project?.startDate &&
    format(new Date(project.startDate), "dd MMM yyyy HH:mm");
  const formattedEndDate =
    project?.endDate && format(new Date(project.endDate), "dd MMM yyyy HH:mm");

  console.log(background);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex justify-center items-center py-16 px-8"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(${background.src})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {alertData && (
        <Alert
          key={alertData.message + alertData.type + Date.now()}
          type={alertData.type}
          message={alertData.message}
        />
      )}

      {/* Modals */}
      {isEditModalOpen && (
        <ProjectEditModal
          project={project}
          onClose={handleCloseEditModal}
          onUpdate={(updatedProject) => setProject(updatedProject)}
        />
      )}
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white p-10">
          <h1 className="text-4xl lg:text-6xl font-bold mt-4 mb-6 tracking-wide">
            {project?.title}
          </h1>
          <p className="text-xl font-semibold">
            Organized by:{" "}
            <span className="font-semibold text-lg text-gray-200">
              {project?.organizer?.name || "Unknown"}
            </span>
          </p>
          {/* Edit Modal Section */}
          {project?.organizer?.name === currentUser?.name && (
            <div className="absolute bottom-4 right-4 flex gap-4">
              <button
                onClick={handleOpenEditModal}
                className="px-5 py-2 bg-white text-green-700 duration-200 hover:scale-110  hover:duration-200  text-md font-bold rounded-full shadow-md"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteProject(project)}
                className="px-5 py-2 bg-white text-red-700 duration-200 hover:scale-110  hover:duration-200  text-md font-bold rounded-full shadow-md"
              >
                Delete
              </button>
            </div>
          )}

          <div className="absolute top-4 right-4">
            <span className="px-5 py-2 bg-white text-indigo-700 text-md font-bold rounded-full shadow-md">
              {formattedStartDate}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-10 space-y-8 bg-gray-100">
          <div className="text-gray-800 text-lg leading-relaxed">
            {project?.description}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="p-5 bg-white border border-gray-200 rounded-lg shadow-md">
              <h3 className="font-semibold text-gray-800 text-xl mb-3">
                Location
              </h3>
              <p className="text-gray-700">{project?.location}</p>
            </div>
            {project?.endDate && (
              <div className="p-5 bg-white border border-gray-200 rounded-lg shadow-md">
                <h3 className="font-semibold text-gray-800 text-xl mb-3">
                  End Date
                </h3>
                <p className="text-gray-700">{formattedEndDate || "TBD"}</p>
              </div>
            )}
          </div>

          {/* Participants Section */}
          <div>
            <h3 className="font-semibold text-gray-900 text-2xl mb-6">
              Participants
            </h3>
            <ul className="space-y-4">
              {project?.participants.map((participant) => (
                <li
                  key={participant.user._id}
                  className="p-4 bg-gray-50 rounded-lg border text-gray-800 flex justify-between items-center shadow-sm"
                >
                  <span>
                    {participant.user.name} ({participant.user.firstName}{" "}
                    {participant.user.lastName})
                  </span>
                </li>
              ))}
            </ul>
            {project?.organizer?.name !== currentUser?.name && currentUser && (
              <button
                onClick={handleJoinProject}
                className="active:scale-95 hover:brightness-95 mt-8 w-full py-3 bg-gradient-to-r from-pink-500 to-yellow-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition ease-in-out"
              >
                Join Project
              </button>
            )}
          </div>

          {/* Image Gallery */}
          <div>
            <h3 className="font-semibold text-gray-900 text-2xl mb-6">
              Gallery
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {project?.images.map((imageId) => (
                <img
                  key={imageId}
                  src={getImageUrl(imageId)}
                  alt="Project"
                  className="rounded-lg shadow-lg object-cover w-full h-48 cursor-pointer transform transition duration-300 hover:scale-105"
                  onClick={() => setSelectedImage(imageId)}
                />
              ))}
            </div>
            {selectedImage && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
                <div className="relative">
                  <button
                    onClick={closeModal}
                    className="absolute top-5 right-5 text-white text-4xl hover:text-gray-300 duration-100"
                  >
                    &times;
                  </button>
                  <img
                    src={getImageUrl(selectedImage)}
                    alt="Enlarged"
                    className="max-w-full max-h-screen rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Section */}
        <div className="bg-gray-50 p-8 text-center border-t border-gray-200">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} Volunteer Platform. All rights
            reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
