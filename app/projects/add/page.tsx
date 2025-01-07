"use client";
import { fetchUserData } from "@/server/utils/fetchUserData";
import React, { useEffect, useState } from "react";
import thinkerImg from "@/assets/add_page__thinker.gif";
import Image from "next/image";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Alert from "@/components/MainComponents/Alert";
import { api } from "@/hooks/api";
import { useLanguage } from "@/context/LanguageContext";
import { addPage__translations } from "@/components/ProjectsPage/Translation";
import { registerLocale } from "react-datepicker";
import { enGB } from "date-fns/locale/en-GB";
import { tr } from "date-fns/locale/tr";
import { ru } from "date-fns/locale/ru";

registerLocale("en", enGB);
registerLocale("tr", tr);
registerLocale("ru", ru);

type ProjectData = {
  title: string;
  description: string;
  organizer: string;
  startDate: string;
  endDate: string;
  location: string;
  images: File[];
};

const AddProjectPage = () => {
  const { language }: { language: "en" | "tr" | "ru" } = useLanguage();
  const t = addPage__translations[language];
  const [projectData, setProjectData] = useState<ProjectData>({
    title: "",
    description: "",
    organizer: "",
    startDate: "",
    endDate: "",
    location: "",
    images: [],
  });

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [alertData, setAlertData] = useState<null | {
    type: "warning" | "success" | "error" | "info";
    message: string;
  }>(null);

  const getTokenFromServer = async () => {
    try {
      const response = await fetch(`${api}/projects/some-route`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(t.failedToFetchToken);
      }

      const data = await response.json();
      setToken(data.token);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    getTokenFromServer();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const userData = await fetchUserData(token);
          setProjectData((prevData) => ({
            ...prevData,
            organizer: userData?._id || "",
          }));
        } catch (error) {
          console.error(t.errorFetchingUserData, error);
        }
      }
    };

    fetchUser();
  }, [token]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProjectData((prevData) => ({
      ...prevData,
      [name]: value,
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
        message: t.maxImagesLimit,
      });
      return;
    }

    setProjectData((prevData) => ({
      ...prevData,
      images: validFiles,
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
        message: t.endDateAdjusted,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("title", projectData.title);
    formData.append("description", projectData.description);
    formData.append("organizer", projectData.organizer);
    formData.append("startDate", projectData.startDate);
    formData.append("endDate", projectData.endDate);
    formData.append("location", projectData.location);

    projectData.images.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const response = await fetch(`${api}/projects`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setAlertData({ type: "error", message: errorData.message });
        return;
      }

      setAlertData({ type: "success", message: t.projectAdded });
      setProjectData({
        title: "",
        description: "",
        organizer: "",
        startDate: "",
        endDate: "",
        location: "",
        images: [],
      });
      setLoading(false);
    } catch (error) {
      setAlertData({
        type: "error",
        message: t.unexpectedError,
      });
      setLoading(false);
    }
  };

  return (
    <div className="pt-7 pb-16 mx-auto bg-white flex flex-col lg:flex-row justify-evenly items-center">
      {alertData && (
        <Alert
          key={alertData.message + alertData.type + Date.now()}
          type={alertData.type}
          message={alertData.message}
        />
      )}
      <Image
        src={thinkerImg}
        alt="Thinker"
        className="object-contain w-[488px] h-[488px]  lg:w-[512px] lg:h-[512px]"
      />
      <div className="w-3/4 lg:w-2/4 shadow-2xl rounded-3xl p-7 bg-white">
        <h1 className="text-2xl font-semibold mb-4 text-center text-gray-500">
          {t.addNewProject}
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="title"
              className="input input-bordered flex items-center gap-2 bg-white border-2 border-gray-400 text-gray-500 rounded-2xl"
            >
              {t.title}
              <input
                type="text"
                id="title"
                name="title"
                value={projectData.title}
                onChange={handleInputChange}
                className="grow text-black"
                placeholder=""
                required
              />
              <span
                className={`ml-auto ${
                  projectData.title
                    ? "md:badge-success md:text-white"
                    : "md:badge-warning"
                } p-4 hidden md:badge`}
              >
                {projectData.title ? t.valid : t.required}
              </span>
            </label>
          </div>

          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-500 ml-3"
            >
              {t.description}
            </label>
            <label className="form-control">
              <textarea
                id="description"
                name="description"
                value={projectData.description}
                onChange={handleInputChange}
                className="textarea textarea-bordered mt-1 block w-full py-2 border-2 border-gray-400 rounded-2xl foucs:border-gray-100 shadow-sm bg-white"
                rows={4}
                required
                maxLength={500}
                placeholder={t.typeDescription}
              ></textarea>
              <div className="text-sm text-gray-500 w-full mt-1 text-right">
                <span>
                  {(projectData.description ?? "").length}
                  {t.charactersLimit}
                </span>
              </div>
              <div className="label">
                <span
                  className={`ml-auto ${
                    projectData.description
                      ? "md:badge-success md:text-white"
                      : "md:badge-warning"
                  } p-4 hidden md:badge`}
                >
                  {projectData.description ? t.valid : t.required}
                </span>
              </div>
            </label>
          </div>

          <div className="mb-4">
            <label
              htmlFor="startDate"
              className="flex gap-4 items-center text-sm font-medium text-gray-500 mb-2"
            >
              <span>{t.startDateAndTime}</span>
              <span
                className={`${
                  projectData.startDate
                    ? "md:badge-success md:text-white"
                    : "md:badge-warning"
                } p-4  hidden md:badge font-normal`}
              >
                {projectData.startDate ? t.valid : t.required}
              </span>
            </label>
            <div className="flex items-center gap-2">
              <DatePicker
                selected={
                  projectData.startDate ? new Date(projectData.startDate) : null
                }
                minDate={new Date()}
                showTimeSelect
                timeFormat="HH:mm"
                dateFormat="dd-MM-yyyy | HH:mm"
                timeIntervals={15}
                required
                onChange={handleStartDateChange}
                locale={language}
                filterTime={(time) => {
                  const hour = time.getHours();
                  return hour >= 7 && hour < 21;
                }}
                className="input input-bordered bg-white border-2 border-gray-400 text-gray-500 rounded-2xl flex-grow"
              />
              <svg
                viewBox="0 0 1024 1024"
                className="icon w-6 h-6 lg:w-7 lg:h-7"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                fill="#000000"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  <path
                    d="M965.282 186.746H62.449c-25.477 0-46.129 21.177-46.129 47.298v7.139c0 26.121 20.652 47.296 46.129 47.296h902.833c25.48 0 46.131-21.175 46.131-47.296v-7.139c0-26.121-20.65-47.298-46.131-47.298z"
                    fill="#4A5699"
                  ></path>
                  <path
                    d="M965.282 821.697H62.449c-25.477 0-46.129 21.173-46.129 47.296v7.141c0 26.119 20.652 47.297 46.129 47.297h902.833c25.48 0 46.131-21.178 46.131-47.297v-7.141c0-26.123-20.65-47.296-46.131-47.296z"
                    fill="#C45FA0"
                  ></path>
                  <path
                    d="M69.412 186.746H62.33c-26.121 0-47.294 21.177-47.294 47.298v642.09c0 26.119 21.173 47.297 47.294 47.297h7.082c26.121 0 47.294-21.178 47.294-47.297v-642.09c0.001-26.121-21.173-47.298-47.294-47.298zM964.117 186.746h-7.082c-26.119 0-47.296 21.177-47.296 47.298v642.09c0 26.119 21.177 47.297 47.296 47.297h7.082c26.122 0 47.296-21.178 47.296-47.297v-642.09c0-26.121-21.174-47.298-47.296-47.298z"
                    fill="#F39A2B"
                  ></path>
                  <path
                    d="M426.617 435.818h-7.082c-26.121 0-47.296 21.171-47.296 47.294v38.715c0 26.119 21.175 47.296 47.296 47.296h7.082c26.121 0 47.298-21.177 47.298-47.296v-38.715c0-26.122-21.177-47.294-47.298-47.294zM601.912 435.818h-7.082c-26.118 0-47.292 21.171-47.292 47.294v38.715c0 26.119 21.174 47.296 47.292 47.296h7.082c26.119 0 47.3-21.177 47.3-47.296v-38.715c0-26.122-21.181-47.294-47.3-47.294zM777.211 435.818h-7.082c-26.122 0-47.296 21.171-47.296 47.294v38.715c0 26.119 21.174 47.296 47.296 47.296h7.082c26.119 0 47.292-21.177 47.292-47.296v-38.715c0-26.122-21.173-47.294-47.292-47.294zM777.211 611.22h-7.082c-26.122 0-47.296 21.17-47.296 47.293v38.716c0 26.115 21.174 47.293 47.296 47.293h7.082c26.119 0 47.292-21.178 47.292-47.293v-38.716c0-26.123-21.173-47.293-47.292-47.293zM601.912 611.22h-7.082c-26.118 0-47.292 21.17-47.292 47.293v38.716c0 26.115 21.174 47.293 47.292 47.293h7.082c26.119 0 47.3-21.178 47.3-47.293v-38.716c0-26.123-21.181-47.293-47.3-47.293zM426.617 611.22h-7.082c-26.121 0-47.296 21.17-47.296 47.293v38.716c0 26.115 21.175 47.293 47.296 47.293h7.082c26.121 0 47.298-21.178 47.298-47.293v-38.716c0-26.123-21.177-47.293-47.298-47.293zM251.32 611.22h-7.08c-26.123 0-47.294 21.17-47.294 47.293v38.716c0 26.115 21.171 47.293 47.294 47.293h7.08c26.123 0 47.294-21.178 47.294-47.293v-38.716c0-26.123-21.171-47.293-47.294-47.293z"
                    fill="#E5594F"
                  ></path>
                  <path
                    d="M299.245 91.914h-7.435c-26.125 0-47.296 19.988-47.296 44.649V312.24c0 24.657 21.171 44.649 47.296 44.649h7.435c26.125 0 47.296-19.992 47.296-44.649V136.563c0-24.661-21.172-44.649-47.296-44.649zM719.956 91.914h-7.438c-26.118 0-47.292 19.988-47.292 44.649V312.24c0 24.657 21.174 44.649 47.292 44.649h7.438c26.123 0 47.296-19.992 47.296-44.649V136.563c0-24.661-21.173-44.649-47.296-44.649z"
                    fill="#6277BA"
                  ></path>
                </g>
              </svg>
            </div>
            <small className="text-gray-400 ml-1">{t.selectDateAndTime}</small>
          </div>

          <div className="mb-6">
            <label
              htmlFor="endDate"
              className="flex gap-4 items-center text-sm font-medium text-gray-500 mb-2"
            >
              <span>{t.endDateAndTime}</span>
              <span
                className={`${
                  projectData.endDate &&
                  new Date(projectData.endDate) >
                    new Date(projectData.startDate)
                    ? "md:badge-success md:text-white"
                    : "md:badge-warning"
                } p-4 hidden md:badge font-normal`}
              >
                {projectData.endDate &&
                new Date(projectData.endDate) > new Date(projectData.startDate)
                  ? t.valid
                  : t.required}
              </span>
            </label>
            <div className="flex items-center gap-2">
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
                showTimeSelect
                timeIntervals={15}
                timeFormat="HH:mm"
                dateFormat="dd-MM-yyyy | HH:mm"
                onChange={handleEndDateChange}
                filterTime={(time) => {
                  const hour = time.getHours();
                  return hour >= 7 && hour <= 22;
                }}
                locale={language}
                className="input input-bordered bg-white border-2 border-gray-400 text-gray-500 rounded-2xl flex-grow  disabled:bg-white disabled:border-gray-400"
              />
              <svg
                viewBox="0 0 1024 1024"
                className="icon w-6 h-6 lg:w-7 lg:h-7"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                fill="#000000"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  <path
                    d="M965.282 186.746H62.449c-25.477 0-46.129 21.177-46.129 47.298v7.139c0 26.121 20.652 47.296 46.129 47.296h902.833c25.48 0 46.131-21.175 46.131-47.296v-7.139c0-26.121-20.65-47.298-46.131-47.298z"
                    fill="#4b9b75"
                  ></path>
                  <path
                    d="M965.282 821.697H62.449c-25.477 0-46.129 21.173-46.129 47.296v7.141c0 26.119 20.652 47.297 46.129 47.297h902.833c25.48 0 46.131-21.178 46.131-47.297v-7.141c0-26.123-20.65-47.296-46.131-47.296z"
                    fill="#b0bf40"
                  ></path>
                  <path
                    d="M69.412 186.746H62.33c-26.121 0-47.294 21.177-47.294 47.298v642.09c0 26.119 21.173 47.297 47.294 47.297h7.082c26.121 0 47.294-21.178 47.294-47.297v-642.09c0.001-26.121-21.173-47.298-47.294-47.298zM964.117 186.746h-7.082c-26.119 0-47.296 21.177-47.296 47.298v642.09c0 26.119 21.177 47.297 47.296 47.297h7.082c26.122 0 47.296-21.178 47.296-47.297v-642.09c0-26.121-21.174-47.298-47.296-47.298z"
                    fill="#088d96"
                  ></path>
                  <path
                    d="M426.617 435.818h-7.082c-26.121 0-47.296 21.171-47.296 47.294v38.715c0 26.119 21.175 47.296 47.296 47.296h7.082c26.121 0 47.298-21.177 47.298-47.296v-38.715c0-26.122-21.177-47.294-47.298-47.294zM601.912 435.818h-7.082c-26.118 0-47.292 21.171-47.292 47.294v38.715c0 26.119 21.174 47.296 47.292 47.296h7.082c26.119 0 47.3-21.177 47.3-47.296v-38.715c0-26.122-21.181-47.294-47.3-47.294zM777.211 435.818h-7.082c-26.122 0-47.296 21.171-47.296 47.294v38.715c0 26.119 21.174 47.296 47.296 47.296h7.082c26.119 0 47.292-21.177 47.292-47.296v-38.715c0-26.122-21.173-47.294-47.292-47.294zM777.211 611.22h-7.082c-26.122 0-47.296 21.17-47.296 47.293v38.716c0 26.115 21.174 47.293 47.296 47.293h7.082c26.119 0 47.292-21.178 47.292-47.293v-38.716c0-26.123-21.173-47.293-47.292-47.293zM601.912 611.22h-7.082c-26.118 0-47.292 21.17-47.292 47.293v38.716c0 26.115 21.174 47.293 47.292 47.293h7.082c26.119 0 47.3-21.178 47.3-47.293v-38.716c0-26.123-21.181-47.293-47.3-47.293zM426.617 611.22h-7.082c-26.121 0-47.296 21.17-47.296 47.293v38.716c0 26.115 21.175 47.293 47.296 47.293h7.082c26.121 0 47.298-21.178 47.298-47.293v-38.716c0-26.123-21.177-47.293-47.298-47.293zM251.32 611.22h-7.08c-26.123 0-47.294 21.17-47.294 47.293v38.716c0 26.115 21.171 47.293 47.294 47.293h7.08c26.123 0 47.294-21.178 47.294-47.293v-38.716c0-26.123-21.171-47.293-47.294-47.293z"
                    fill="#4ee46c"
                  ></path>
                  <path
                    d="M299.245 91.914h-7.435c-26.125 0-47.296 19.988-47.296 44.649V312.24c0 24.657 21.171 44.649 47.296 44.649h7.435c26.125 0 47.296-19.992 47.296-44.649V136.563c0-24.661-21.172-44.649-47.296-44.649zM719.956 91.914h-7.438c-26.118 0-47.292 19.988-47.292 44.649V312.24c0 24.657 21.174 44.649 47.292 44.649h7.438c26.123 0 47.296-19.992 47.296-44.649V136.563c0-24.661-21.173-44.649-47.296-44.649z"
                    fill="#bb6363"
                  ></path>
                </g>
              </svg>
            </div>
            <small className="text-gray-400 ml-1">{t.selectDateAndTime}</small>
          </div>

          <div className="mb-6">
            <label
              htmlFor="location"
              className="input input-bordered flex items-center gap-2 bg-white border-2 border-gray-400 text-gray-500 rounded-2xl"
            >
              {t.location}
              <input
                type="text"
                id="location"
                name="location"
                value={projectData.location}
                onChange={handleInputChange}
                className="grow text-black"
                placeholder=""
                required
              />
              <span
                className={`${
                  projectData.location
                    ? "md:badge-success md:text-white"
                    : "md:badge-warning"
                } p-4 hidden md:badge`}
              >
                {projectData.location ? t.valid : t.required}
              </span>
            </label>
          </div>

          <div className="mb-4">
            <label
              htmlFor="images"
              className="block text-sm font-medium text-gray-500 mb-1"
            >
              {t.uploadImages}
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
                <h4 className="text-sma font-medium">{t.selectedImages}</h4>
                <ul className="list-disc pl-5 text-sm lg:text-base flex flex-col gap-1">
                  {projectData.images.map((file, index) => (
                    <li className="" key={index}>
                      {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full text-white btn btn-active btn-primary hover:brightness-90"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner md:loading-md lg:loading-lg"></span>
            ) : (
              <span>{t.submit}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProjectPage;
