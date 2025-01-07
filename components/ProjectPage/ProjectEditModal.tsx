import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Alert from "../MainComponents/Alert";
import { api } from "@/hooks/api";

interface ProjectEditModalProps {
  project: any;
  onClose: () => void;
  onUpdate: (updatedProject: any) => void;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

type ProjectData = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  images: File[];
};

const ProjectEditModal: React.FC<ProjectEditModalProps> = ({
  project,
  onClose,
  onUpdate,
  setRefresh,
}) => {
  const [loading, setLoading] = useState(false);
  const [alertData, setAlertData] = useState<null | {
    type: "warning" | "success" | "error" | "info";
    message: string;
  }>(null);

  const [projectData, setProjectData] = useState<ProjectData>({
    title: project.title || "",
    description: project.description || "",
    startDate: project.startDate || "",
    endDate: project.endDate || "",
    location: project.location || "",
    images: project.images || [],
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProjectData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      const now = new Date();
      const selectedDate = new Date(date);

      if (selectedDate.getHours() < 7) {
        selectedDate.setHours(7, 0, 0, 0);
      } else if (selectedDate.getHours() >= 21) {
        selectedDate.setHours(21, 0, 0, 0);
      }

      setProjectData((prevData) => ({
        ...prevData,
        startDate: selectedDate.toISOString(),
      }));
    } else {
      setProjectData((prevData) => ({
        ...prevData,
        startDate: "",
      }));
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date && new Date(projectData.startDate) >= date) {
      const correctedDate = new Date(projectData.startDate);
      correctedDate.setMinutes(correctedDate.getMinutes() + 30);
      setAlertData({
        type: "info",
        message: "End date adjusted to 30 minutes after start date.",
      });
      setProjectData((prevData) => ({
        ...prevData,
        endDate: correctedDate.toISOString(),
      }));
      return;
    }
    setProjectData((prevData) => ({
      ...prevData,
      endDate: date ? date.toISOString() : "",
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const allowedFormats = ["image/jpeg", "image/png", "image/gif"];
    const validFiles = files.filter((file) =>
      allowedFormats.includes(file.type)
    );

    if (validFiles.length > 6) {
      setAlertData({
        type: "warning",
        message: "You can upload up to 6 images",
      });

      return;
    }

    setProjectData((prevData) => ({
      ...prevData,
      images: validFiles,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSave();
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("title", projectData.title);
      formData.append("description", projectData.description);
      formData.append("location", projectData.location);
      formData.append("startDate", projectData.startDate);

      if (projectData.endDate) {
        formData.append("endDate", projectData.endDate);
      } else {
        formData.append("endDate", "null");
      }

      if (projectData.images.length > 0) {
        projectData.images.forEach((image: any) => {
          formData.append("images", image);
        });
      }

      const response = await fetch(`${api}/projects/${project._id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to update project");

      const updatedProject = await response.json();
      onUpdate(updatedProject.project);
      setLoading(false);
      setAlertData({
        type: "success",
        message: "Project successfully edited!",
      });
      setRefresh((prev) => !prev);
      onClose();
    } catch (error) {
      setLoading(false);
      setAlertData({ type: "error", message: `${error}` });
    }
  };

  return (
    <dialog className="modal modal-open">
      {alertData && <Alert type={alertData.type} message={alertData.message} />}
      <div className="modal-box bg-white p-7">
        <form method="dialog">
          {/* Close button */}
          <button
            className="btn btn-sm lg:btn-md lg:text-xl btn-circle btn-ghost absolute right-2 top-2"
            onClick={onClose}
          >
            ✕
          </button>
        </form>
        <h2 className="text-base lg:text-lg pb-4">Edit Project</h2>
        <div className="flex flex-col gap-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="input input-bordered flex items-center gap-4 text-slate-500 bg-white">
                Title
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="grow bg-white w-full max-w-sm text-black"
                  value={projectData.title}
                  placeholder=""
                  required
                  onChange={handleInputChange}
                />
                <span
                  className={`ml-auto ${
                    projectData.title
                      ? "md:badge-success md:text-white"
                      : "md:badge-warning"
                  } p-4 hidden md:badge`}
                >
                  {projectData.title ? "Valid" : "Required"}
                </span>
              </label>
            </div>
            <div className="mb-4">
              <label className="form-control">
                <div className="label">
                  <span className="label-text text-slate-500">Description</span>
                </div>
                <textarea
                  id="description"
                  name="description"
                  value={projectData.description}
                  onChange={handleInputChange}
                  className="textarea textarea-bordered mt-1 block w-full py-2 border-2 border-gray-400 rounded-2xl foucs:border-gray-100 shadow-sm bg-white"
                  rows={4}
                  required
                  maxLength={500}
                  placeholder="Type description for a project"
                ></textarea>

                <div className="text-sm text-gray-500 w-full mt-1 text-right">
                  <span>{projectData.description.length}/500 characters</span>
                </div>
                <div className="label">
                  <span
                    className={`ml-auto ${
                      projectData.description
                        ? "md:badge-success md:text-white"
                        : "md:badge-warning"
                    } p-4 hidden md:badge`}
                  >
                    {projectData.description ? "Valid" : "Required"}
                  </span>
                </div>
              </label>
            </div>

            <div className="mb-4 flex items-center flex-col">
              <label
                htmlFor="startDate"
                className="flex gap-4 items-center text-sm font-medium text-gray-500 mb-2"
              >
                <span>Start Date and Time</span>
                <span
                  className={`${
                    projectData.startDate
                      ? "md:badge-success md:text-white"
                      : "md:badge-warning"
                  } py-3 px-4 hidden md:badge`}
                >
                  {projectData.startDate ? "Valid" : "Required"}
                </span>
              </label>
              <DatePicker
                selected={
                  projectData.startDate ? new Date(projectData.startDate) : null
                }
                minDate={new Date()}
                showTimeSelect
                timeFormat="HH:mm"
                dateFormat="dd-MM-yyyy | HH:mm"
                required
                timeIntervals={15}
                onChange={handleStartDateChange}
                filterTime={(time) => {
                  const hour = time.getHours();
                  return hour >= 7 && hour < 21;
                }}
                className="input input-bordered bg-white border-2 border-gray-400 text-gray-500 rounded-2xl flex-grow"
              />
            </div>

            <div className="mb-4 flex items-center flex-col">
              <label
                htmlFor="startDate"
                className="flex gap-4 items-center text-sm font-medium text-gray-500 mb-2"
              >
                <span>End Date and Time</span>
                <span
                  className={`${
                    projectData.endDate &&
                    new Date(projectData.endDate) >
                      new Date(projectData.startDate)
                      ? "md:badge-success md:text-white"
                      : "md:badge-warning"
                  } py-3 px-4 hidden md:badge`}
                >
                  {projectData.endDate &&
                  new Date(projectData.endDate) >
                    new Date(projectData.startDate)
                    ? "Valid"
                    : "Required"}
                </span>
              </label>
              <DatePicker
                selected={
                  projectData.endDate ? new Date(projectData.endDate) : null
                }
                minDate={
                  projectData.startDate
                    ? new Date(projectData.startDate)
                    : undefined
                }
                disabled={!projectData.startDate}
                required
                timeIntervals={15}
                showTimeSelect
                timeFormat="HH:mm"
                dateFormat="dd-MM-yyyy | HH:mm"
                onChange={handleEndDateChange}
                filterTime={(time) => {
                  const hour = time.getHours();
                  return hour >= 7 && hour <= 22;
                }}
                className="input input-bordered bg-white border-2 border-gray-400 text-gray-500 rounded-2xl flex-grow  disabled:bg-white disabled:border-gray-400"
              />
            </div>

            <div className="mb-4">
              <label className="input input-bordered flex items-center gap-4 text-slate-500 bg-white">
                Location
                <input
                  id="location"
                  name="location"
                  placeholder=""
                  type="text"
                  className="grow bg-white w-full max-w-sm text-black"
                  required
                  value={projectData.location}
                  onChange={handleInputChange}
                />
                <span
                  className={`ml-auto ${
                    location
                      ? "md:badge-success md:text-white"
                      : "md:badge-warning"
                  } p-4 hidden md:badge`}
                >
                  {location ? "Valid" : "Required"}
                </span>
              </label>
            </div>

            <div className="mb-4">
              <label
                htmlFor="images"
                className="block text-sm font-medium text-gray-500 mb-1"
              >
                Upload Images (Max: 6)
              </label>
              <input
                type="file"
                id="images"
                name="images"
                accept="image/*"
                required
                multiple
                onChange={handleImageChange}
                className="file-input file-input-bordered file-input-success w-full max-w-sm bg-white"
              />
              {projectData.images.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sma font-medium">Selected Images:</h4>
                  <ul className="list-disc pl-5 text-sm lg:text-base flex flex-col gap-1">
                    {projectData.images.map((file: any, index: any) => (
                      <li className="" key={index}>
                        {file.name ? file.name : file}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </form>

          <div className="modal-action block">
            <button
              className="btn btn-success text-white w-full"
              onClick={handleSave}
              disabled={loading}
            >
              {" "}
              {loading ? (
                <span className="loading loading-spinner loading-md"></span>
              ) : (
                <span>Save</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default ProjectEditModal;
