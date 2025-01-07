"use client";
import { useEffect, useState } from "react";
import EditUserForm from "@/components/UserPage/EditUserForm";
import EditSvg from "@/assets/edit.svg";
import { fetchUserAvatar } from "@/server/utils/fetchUserAvatar";
import { api } from "@/hooks/api";
import Link from "next/link";
import UserReviews from "./UserReviews";
import ConfirmationModal from "../MainComponents/ConfirmationModal";
import { useLanguage } from "@/context/LanguageContext";
import { userPage__translation } from "./Translation";

interface Review {
  _id: string;
  author: { _id: string; name: string; avatar: string };
  text: string;
  createdAt: string;
  rating: number;
}

interface UserProfile {
  _id: string;
  avatar: string;
  name: string;
  firstName: string;
  lastName: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  skills: string[];
  completedProjects: string[];
  rating: number;
  reviews: Review[];
  joinedEvents: string[];
  hoursVolunteered: number;
  projectsCount: number;
}

interface CurrentUser {
  _id: string;
  avatar: string;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface EditUserPageProps {
  userData: UserProfile;
  token: string | undefined;
  currentUser: CurrentUser | null;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

type ProjectData = {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  images: string[];
  hours: number;
};

const EditUserPage = ({
  userData,
  token,
  currentUser,
  setRefresh,
}: EditUserPageProps) => {
  const [profileData, setProfileData] = useState(userData);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [loadingAvatar, setLoadingAvatar] = useState(true);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [completedProjects, setCompletedProjects] = useState<
    ProjectData[] | null
  >(null);
  const [loadingCompletedProjects, setLoadingCompletedProjects] =
    useState(false);
  const { language }: { language: "en" | "tr" | "ru" } = useLanguage();
  const t = userPage__translation[language];

  const fetchCompletedProjects = async () => {
    try {
      setLoadingCompletedProjects(true);

      const response = await fetch(
        `${api}/auth/users/${profileData?.name}/completedProjects`
      );
      if (!response.ok) {
        throw new Error(`${t.httpError} ${response.status}`);
      }

      const data = await response.json();
      setCompletedProjects(data.completedProjects);
    } catch (err) {
      console.error(t.failedUpdateProfile, err);
    } finally {
      setLoadingCompletedProjects(false);
    }
  };

  useEffect(() => {
    fetchCompletedProjects();
  }, [userData]);

  useEffect(() => {
    const loadAvatar = async () => {
      try {
        setLoadingAvatar(true);
        const imageUrl = await fetchUserAvatar(profileData.avatar);
        setAvatarUrl(imageUrl);
      } catch {
        setAvatarUrl("https://cdn-icons-png.flaticon.com/512/3607/3607444.png");
      } finally {
        setLoadingAvatar(false);
      }
    };

    loadAvatar();
  }, [profileData.avatar]);

  const updateUserProfile = async (
    name: string,
    updatedFields: Partial<UserProfile>,
    avatarFile: File | null
  ) => {
    const formData = new FormData();
    formData.append(
      "firstName",
      updatedFields.firstName ?? profileData.firstName
    );
    formData.append("lastName", updatedFields.lastName ?? profileData.lastName);
    formData.append("bio", updatedFields.bio ?? profileData.bio);
    formData.append("phone", updatedFields.phone ?? profileData.phone);
    formData.append("location", updatedFields.location ?? profileData.location);

    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    setLoading(true);
    try {
      const response = await fetch(`${api}/auth/users/${name}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t.failedUpdateProfile);
      }

      setProfileData((prev) => ({
        ...prev,
        ...updatedFields,
        avatar: data.avatar || prev.avatar,
      }));
    } catch (error) {
      console.error(t.errorUpdatingProfile, error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (section: string) => {
    setEditingSection(section);
  };

  const handleSave = async (updatedFields: { [key: string]: any }) => {
    await updateUserProfile(profileData.name, updatedFields, avatarFile);
    setEditingSection(null);
    window.location.reload();
  };

  const isOwner = currentUser?.name === userData.name;

  const deleteUser = async () => {
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    try {
      const response = await fetch(`${api}/auth/users/delete/${userData._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t.failedDeleteAccount);
      }

      alert(t.accountDeletedSuccess);
      window.location.href = "/";
    } catch (error) {
      console.error(t.errorDeletingAccount, error);
      alert(error || t.errorDeletingAccount);
    } finally {
      setIsConfirmModalOpen(false);
    }
  };

  const getImageUrl = (imageId: string) => {
    return `${api}/projects/images/${imageId}`;
  };

  return (
    <div className="z-10 relative p-6 gap-10 flex flex-col w-11/12 m-auto">
      {isConfirmModalOpen && (
        <ConfirmationModal
          message={t.confirmDeleteAccount}
          onConfirm={confirmDeleteUser}
          onCancel={() => setIsConfirmModalOpen(false)}
        />
      )}
      {/* Personal Info */}
      <div className="flex flex-col lg:gap-3 shadow p-7 rounded-md bg-white">
        <div className="flex justify-between">
          <h2 className="text-base m:text-lg lg:text-xl">{t.volunteerInfo}</h2>
          {isOwner && (
            <div
              className="flex gap-1 items-center cursor-pointer transition-transform hover:scale-110 hover:transition-transform duration-300 hover:duration-300"
              onClick={() => handleEditClick("personalInfo")}
            >
              <img src={EditSvg.src} alt="Edit" className="w-5 h-5" />
              <p className="text-sm m:text-base lg:text-lg">{t.edit}</p>
            </div>
          )}
        </div>
        <div className="divider m-0"></div>
        <div className="flex items-center gap-6">
          {loadingAvatar ? (
            <div className="w-20 h-20 lg:w-40 lg:h-40 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 rounded-full animate-pulse"></div>
          ) : (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-20 h-20 rounded-full lg:w-40 lg:h-40 object-cover"
            />
          )}

          <div className="flex flex-col gap-2 w-10/12">
            <h1 className="text-base lg:text-xl font-bold">
              @{profileData.name}
            </h1>
            <p className="text-gray-600 flex gap-1 text-sm lg:text-lg">
              <span>{profileData.firstName}</span>
              <span>{profileData.lastName}</span>
            </p>
            <p className="text-sm lg:text-lg break-words">{profileData.bio}</p>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="flex flex-col lg:gap-3 shadow p-7 rounded-md bg-white ">
        <div className="flex justify-between">
          <h2 className="text-base m:text-lg lg:text-xl">{t.contactInfo}</h2>
          {profileData?.name !== currentUser?.name && currentUser ? (
            <Link
              href="/chat"
              onClick={() => {
                if (profileData?.name) {
                  localStorage.setItem(
                    "chatWithOrganizer",
                    JSON.stringify(profileData)
                  );
                }
              }}
              className="ml-auto flex items-center gap-2 bg-white px-5 py-2 text-indigo-900 rounded-full duration-200 hover:scale-105"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-7 h-7"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22Z"
                    stroke="#312e81"
                    strokeWidth="1.5"
                  ></path>
                </g>
              </svg>
              <p className="text-lg">{t.message}</p>
            </Link>
          ) : null}
          {isOwner && (
            <div
              className="flex gap-1 items-center cursor-pointer transition-transform hover:scale-110 hover:transition-transform"
              onClick={() => handleEditClick("contactInfo")}
            >
              <img src={EditSvg.src} alt="Edit" className="w-5 h-5" />
              <p className="text-sm m:text-base lg:text-lg">{t.edit}</p>
            </div>
          )}
        </div>
        <div className="divider m-0"></div>
        <div className="flex flex-col gap-6">
          <p className="flex gap-4 text-sm lg:text-lg">
            <span className="text-gray-400 w-48">{t.email}</span>
            <span>{profileData.email}</span>
          </p>
          <p className="flex gap-4 text-sm lg:text-lg">
            <span className="text-gray-400 w-48">{t.phoneNumber}</span>
            <span>{profileData.phone}</span>
          </p>
          <p className="flex gap-4 text-sm lg:text-lg">
            <span className="text-gray-400 w-48">{t.location}</span>
            <span>{profileData.location}</span>
          </p>
        </div>
      </div>
      {/* Achievements */}
      <div className="flex flex-col lg:gap-3 shadow p-7 rounded-md bg-white ">
        <div className="flex justify-between">
          <h2 className="text-base m:text-lg lg:text-xl">{t.achievements}</h2>
        </div>
        <div className="divider m-0"></div>
        <div className="flex flex-col gap-6">
          <p className="flex gap-4 text-sm lg:text-lg">
            <span className="w-64">{t.rating}</span>
            <span className="text-yellow-500 font-medium">
              {profileData.rating}
            </span>
          </p>
          <p className="flex gap-4 text-sm lg:text-lg">
            <span className="w-64">{t.hoursVolunteered}</span>
            <span className="text-green-600 font-medium">
              {profileData.hoursVolunteered}
            </span>
          </p>
          <p className="flex gap-4 text-sm lg:text-lg">
            <span className="w-64">{t.completedEventsCount}</span>
            <span className="text-violet-400 font-medium">
              {profileData.completedProjects?.length}
            </span>
          </p>
        </div>
      </div>

      {/* Completed Projects */}
      <div className="flex flex-col lg:gap-3 shadow p-7 rounded-md bg-white mt-6">
        <div className="flex justify-between">
          <h2 className="text-base m:text-lg lg:text-xl">
            {t.completedEvents}
          </h2>
        </div>
        <div className="divider m-0"></div>
        <div className="relative">
          {completedProjects && completedProjects?.length > 0 ? (
            <>
              <div className="carousel w-full rounded-box gap-5">
                {completedProjects?.map((project, index) => (
                  <Link
                    href={`/projects/${project._id}`}
                    key={index}
                    className="carousel-item p-4 rounded-3xl border-2  border-gray-300 flex flex-col items-center h-96 w-72 hover:border-gray-500 duration-200 cursor-pointer"
                  >
                    <img
                      src={getImageUrl(project.images[0])}
                      alt={project?.title || "Project Image"}
                      className="rounded-md w-full h-32 object-cover mb-4"
                    />
                    {/* Заголовок проекта */}
                    <h3 className="text-lg font-bold text-center truncate overflow-hidden w-full whitespace-nowrap">
                      {project?.title}
                    </h3>

                    {/* Описание */}
                    <p className="text-sm text-gray-600 text-center mt-2 overflow-hidden line-clamp-3">
                      {project?.description}
                    </p>
                    {/* Локация */}
                    <p className="text-sm text-gray-500 mt-2">
                      <span className="font-semibold">{t.locationLabel}</span>{" "}
                      {project?.location || "N/A"}
                    </p>
                    {/* Даты проекта */}
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-semibold">{t.startDate}</span>{" "}
                      {new Date(project?.startDate)
                        .toLocaleString("ru-RU", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                        .replace(",", " |")}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-semibold">{t.endDate}</span>{" "}
                      {new Date(project?.endDate)
                        .toLocaleString("ru-RU", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                        .replace(",", " |")}
                    </p>

                    {/* Часы */}
                    <p className="text-sm text-gray-500 mt-2">
                      <span className="font-semibold">{t.hours}</span>{" "}
                      {project?.hours || 0}
                    </p>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center text-lg">
              {t.noCompletedEvents}
            </p>
          )}
        </div>
      </div>

      {/* Reviews */}
      <UserReviews
        userName={profileData?.name}
        currentUser={currentUser}
        token={token}
        setRefreshData={setRefresh}
      />

      {isOwner && (
        <button
          className="btn btn-error ml-auto  text-white "
          onClick={deleteUser}
        >
          {t.deleteAccount}
        </button>
      )}

      {/* Modal */}
      {isOwner && editingSection && (
        <EditUserForm
          section={editingSection}
          profileData={profileData}
          onSave={handleSave}
          onCancel={() => setEditingSection(null)}
          setAvatarFile={setAvatarFile}
        />
      )}

      {loading && <p>{t.updatingProfile}</p>}
    </div>
  );
};

export default EditUserPage;
