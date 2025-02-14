"use client";
import Link from "next/link";
import { format, isBefore, isAfter } from "date-fns";
import { ru, enUS, tr } from "date-fns/locale";
import { api } from "@/hooks/api";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { projectCard__translations } from "./Translation";

interface Project {
  _id: string;
  title: string;
  description: string;
  images: string[];
  status: string;
  [key: string]: any;
}

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const [currentProject, setCurrentProject] = useState<Project>(project);
  const { language }: { language: "en" | "tr" | "ru" } = useLanguage();
  const t = projectCard__translations[language];

  const locale = language === "ru" ? ru : language === "tr" ? tr : enUS;

  const formattedStartDate = format(
    new Date(currentProject?.startDate),
    "dd MMM yyyy",
    { locale }
  );

  const formattedStartHour = format(
    new Date(currentProject?.startDate),
    "HH:mm"
  );

  const url = `${api}/projects`;

  const getImageUrl = (imageId: string) => {
    return `${url}/images/${imageId}`;
  };

  async function updateProjectStatus(projectId: string, newStatus: string) {
    try {
      const response = await fetch(`${url}/${projectId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t.failedToUpdateStatus);
      }

      const data = await response.json();
      setCurrentProject((prevProject) => ({
        ...prevProject,
        status: newStatus,
      }));
      return data;
    } catch (error) {
      console.error(t.errorUpdatingStatus, error);
      throw error;
    }
  }

  useEffect(() => {
    const now = new Date();
    const start = new Date(currentProject?.startDate);
    const end = new Date(currentProject?.endDate);

    let newStatus = currentProject?.status;

    if (isBefore(now, start)) {
      newStatus = "open";
    } else if (isAfter(now, end)) {
      newStatus = "completed";
    } else if (isAfter(now, start) && isBefore(now, end)) {
      newStatus = "in-progress";
    }

    if (newStatus !== currentProject?.status) {
      updateProjectStatus(currentProject?._id, newStatus);
    }
  }, [currentProject]);

  return (
    <div className="h-72 lg:h-80 card lg:card-side bg-gray-100 flex flex-col shadow-xl group ">
      <figure className="w-2/4 overflow-hidden flex justify-center items-center  bg-gray-800 border-r-4 border-gray-300 skeleton">
        <img
          src={getImageUrl(currentProject?.images[0])}
          alt="Project image"
          className="object-cover w-full h-full hidden md:block"
        />
        <p
          className={`absolute left-4 top-4 text-white font-medium badge p-5 opacity-0 group-hover:opacity-100 ${
            currentProject?.status === "open"
              ? "badge-success"
              : currentProject?.status === "in-progress"
              ? "badge-warning"
              : "bg-blue-500 border-transparent"
          }`}
        >
          {currentProject?.status == "in-progress"
            ? t.inProgress
            : currentProject?.status === "open"
            ? t.open
            : t.completed}
        </p>
      </figure>
      <div className="card-body">
        <h2 className="card-title flex gap-3 truncate items-center text-lg lg:text-2xl pt-4">
          <span>
            {currentProject?.title.length > 100
              ? `${currentProject?.title.slice(0, 100)}...`
              : currentProject?.title}
          </span>
        </h2>

        <p className="block sm:hidden">
          {currentProject?.description.length > 50
            ? `${currentProject?.description.slice(0, 50)}...`
            : currentProject?.description}
        </p>
        <p className="overflow-hidden line-clamp-3 hidden sm:block md:hidden">
          {currentProject?.description.length > 70
            ? `${currentProject?.description.slice(0, 70)}...`
            : currentProject?.description}
        </p>
        <p className="hidden md:block">
          {currentProject?.description.length > 220
            ? `${currentProject?.description.slice(0, 220)}...`
            : currentProject?.description}
        </p>

        <p className="flex items-center gap-1 absolute right-4 top-4 font-medium">
          <span className="truncate block sm:hidden">
            {currentProject?.location.length > 30
              ? `${currentProject?.location.slice(0, 30)}...`
              : currentProject?.location}
          </span>
          <span className="truncate hidden sm:block md:hidden">
            {currentProject?.location.length > 50
              ? `${currentProject?.location.slice(0, 50)}...`
              : currentProject?.location}
          </span>
          <span className="line-clamp-1 hidden md:block">
            {currentProject?.location.length > 65
              ? `${currentProject?.location.slice(0, 65)}...`
              : currentProject?.location}
          </span>
          <svg
            className="w-7 h-7"
            version="1.0"
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 64 64"
            enableBackground="new 0 0 64 64"
            xmlSpace="preserve"
            fill="#000000"
          >
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              {" "}
              <g>
                {" "}
                <g>
                  {" "}
                  <path
                    fill="#394240"
                    d="M32,0C18.745,0,8,10.745,8,24c0,5.678,2.502,10.671,5.271,15l17.097,24.156C30.743,63.686,31.352,64,32,64 s1.257-0.314,1.632-0.844L50.729,39C53.375,35.438,56,29.678,56,24C56,10.745,45.255,0,32,0z M48.087,39h-0.01L32,61L15.923,39 h-0.01C13.469,35.469,10,29.799,10,24c0-12.15,9.85-22,22-22s22,9.85,22,22C54,29.799,50.281,35.781,48.087,39z"
                  ></path>{" "}
                  <path
                    fill="#394240"
                    d="M32,14c-5.523,0-10,4.478-10,10s4.477,10,10,10s10-4.478,10-10S37.523,14,32,14z M32,32 c-4.418,0-8-3.582-8-8s3.582-8,8-8s8,3.582,8,8S36.418,32,32,32z"
                  ></path>{" "}
                  <path
                    fill="#394240"
                    d="M32,10c-7.732,0-14,6.268-14,14s6.268,14,14,14s14-6.268,14-14S39.732,10,32,10z M32,36 c-6.627,0-12-5.373-12-12s5.373-12,12-12s12,5.373,12,12S38.627,36,32,36z"
                  ></path>{" "}
                </g>{" "}
                <g>
                  {" "}
                  <path
                    fill="#F76D57"
                    d="M32,12c-6.627,0-12,5.373-12,12s5.373,12,12,12s12-5.373,12-12S38.627,12,32,12z M32,34 c-5.522,0-10-4.477-10-10s4.478-10,10-10s10,4.477,10,10S37.522,34,32,34z"
                  ></path>{" "}
                  <path
                    fill="#F76D57"
                    d="M32,2c-12.15,0-22,9.85-22,22c0,5.799,3.469,11.469,5.913,15h0.01L32,61l16.077-22h0.01 C50.281,35.781,54,29.799,54,24C54,11.85,44.15,2,32,2z M32,38c-7.732,0-14-6.268-14-14s6.268-14,14-14s14,6.268,14,14 S39.732,38,32,38z"
                  ></path>{" "}
                </g>{" "}
                <path
                  opacity="0.2"
                  fill="#231F20"
                  d="M32,12c-6.627,0-12,5.373-12,12s5.373,12,12,12s12-5.373,12-12S38.627,12,32,12z M32,34 c-5.522,0-10-4.477-10-10s4.478-10,10-10s10,4.477,10,10S37.522,34,32,34z"
                ></path>{" "}
              </g>{" "}
            </g>
          </svg>
        </p>
        <div className="flex justify-around items-center">
          <div className="flex gap-3 items-center font-medium">
            <svg
              viewBox="0 0 1024 1024"
              className="icon w-6 h-6"
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
            <span>{formattedStartDate}</span>
          </div>

          <div className="flex gap-3 items-center font-medium">
            <svg
              className="w-7 h-7"
              version="1.0"
              id="Layer_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              viewBox="0 0 64 64"
              enableBackground="new 0 0 64 64"
              xmlSpace="preserve"
              fill="#000000"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                {" "}
                <g>
                  {" "}
                  <circle fill="#F76D57" cx="32" cy="32" r="26"></circle>{" "}
                  <path
                    fill="#394240"
                    d="M32,0C14.327,0,0,14.327,0,32s14.327,32,32,32s32-14.327,32-32S49.673,0,32,0z M32,62 C15.431,62,2,48.568,2,32C2,15.431,15.431,2,32,2s30,13.431,30,30C62,48.568,48.569,62,32,62z"
                  ></path>{" "}
                  <circle fill="#394240" cx="32" cy="32" r="1"></circle>{" "}
                  <path
                    fill="#394240"
                    d="M36.931,32.688C36.962,32.461,37,32.236,37,32c0-1.631-0.792-3.064-2-3.978V14c0-1.657-1.343-3-3-3 s-3,1.343-3,3v14.022c-1.208,0.913-2,2.347-2,3.978c0,2.762,2.238,5,5,5c0.235,0,0.461-0.038,0.688-0.069l8.505,8.505 c1.172,1.172,3.07,1.171,4.242-0.001s1.172-3.07,0-4.242L36.931,32.688z M31,14c0-0.553,0.447-1,1-1s1,0.447,1,1v13.101 C32.677,27.035,32.343,27,32,27s-0.677,0.035-1,0.101V14z M29,32c0-1.657,1.343-3,3-3s3,1.343,3,3s-1.343,3-3,3S29,33.657,29,32z M44.021,44.021c-0.391,0.392-1.023,0.392-1.414,0.001l-7.853-7.853c0.562-0.372,1.043-0.853,1.415-1.415l7.852,7.853 C44.411,42.997,44.411,43.63,44.021,44.021z"
                  ></path>{" "}
                  <path
                    fill="#394240"
                    d="M32,4C16.536,4,4,16.536,4,32s12.536,28,28,28s28-12.536,28-28S47.464,4,32,4z M51.075,49.66l-2.103-2.104 c-0.393-0.39-1.025-0.39-1.415,0c-0.391,0.392-0.391,1.023,0,1.415l2.104,2.104c-4.409,4.085-10.235,6.657-16.66,6.9l0.001-2.974 c-0.002-0.553-0.449-1-1-1c-0.554,0.001-1,0.447-1,1l-0.001,2.974c-6.425-0.243-12.251-2.814-16.66-6.898l2.104-2.104 c0.39-0.392,0.39-1.024,0-1.414c-0.393-0.391-1.023-0.391-1.414,0l-2.104,2.104c-4.084-4.409-6.656-10.235-6.9-16.66h2.974 c0.553-0.001,1-0.448,1-1c-0.001-0.554-0.447-1-1-1H6.025c0.243-6.425,2.814-12.252,6.898-16.661l2.104,2.104 c0.391,0.391,1.023,0.391,1.414,0c0.391-0.392,0.391-1.023,0-1.414l-2.104-2.104c4.409-4.085,10.236-6.657,16.661-6.9V9 c0,0.553,0.447,1,1,1s1-0.447,1-1V6.025c6.425,0.243,12.252,2.814,16.661,6.899l-2.104,2.104c-0.391,0.391-0.391,1.023,0,1.414 s1.023,0.391,1.414,0l2.105-2.104c4.084,4.409,6.656,10.236,6.899,16.661H55c-0.553,0-1,0.447-1,1s0.447,1,1,1h2.975 C57.731,39.425,55.16,45.251,51.075,49.66z"
                  ></path>{" "}
                  <path
                    fill="#F9EBB2"
                    d="M32,2C15.432,2,2,15.432,2,32s13.432,30,30,30s30-13.432,30-30S48.568,2,32,2z M32,60 C16.536,60,4,47.464,4,32S16.536,4,32,4s28,12.536,28,28S47.464,60,32,60z"
                  ></path>{" "}
                  <path
                    fill="#F9EBB2"
                    d="M32,29c-1.657,0-3,1.343-3,3s1.343,3,3,3s3-1.343,3-3S33.657,29,32,29z M32,33c-0.553,0-1-0.447-1-1 s0.447-1,1-1s1,0.447,1,1S32.553,33,32,33z"
                  ></path>{" "}
                  <g>
                    {" "}
                    <path
                      fill="#45AAB8"
                      d="M44.021,42.606l-7.852-7.853c-0.372,0.562-0.854,1.043-1.414,1.414l7.853,7.854 c0.195,0.195,0.45,0.293,0.706,0.293s0.512-0.098,0.707-0.294C44.411,43.63,44.411,42.997,44.021,42.606z"
                    ></path>{" "}
                    <path
                      fill="#45AAB8"
                      d="M32,13c-0.553,0-1,0.447-1,1v13.101C31.323,27.035,31.657,27,32,27s0.677,0.035,1,0.101V14 C33,13.447,32.553,13,32,13z"
                    ></path>{" "}
                  </g>{" "}
                </g>{" "}
              </g>
            </svg>
            <span>{formattedStartHour}</span>
          </div>
        </div>

        <div className="card-actions mt-5">
          <Link href={`/projects/${currentProject?._id}`} className="w-full">
            <button className="btn btn-primary text-white w-full rounded-2xl">
              {t.watch}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
