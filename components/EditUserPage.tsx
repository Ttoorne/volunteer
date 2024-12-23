"use client";
import { useEffect, useState } from "react";
import EditUserForm from "@/components/EditUserForm";
import EditSvg from "@/assets/edit.svg";
import { fetchUserAvatar } from "@/server/utils/fetchUserAvatar";
import { api } from "@/hooks/api";

interface Review {
  author: string;
  text: string;
  createdAt: string;
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

interface EditUserPageProps {
  userData: UserProfile;
  token: string | undefined;
  currentUserName: string | null;
}

const EditUserPage = ({
  userData,
  token,
  currentUserName,
}: EditUserPageProps) => {
  const [profileData, setProfileData] = useState(userData);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [loadingAvatar, setLoadingAvatar] = useState(true);

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
        throw new Error(data.error || "Failed to update profile");
      }

      setProfileData((prev) => ({
        ...prev,
        ...updatedFields,
        avatar: data.avatar || prev.avatar,
      }));
    } catch (error) {
      console.error("Error updating profile:", error);
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

  const isOwner = currentUserName === userData.name;

  const deleteUser = async () => {
    if (!window.confirm("Are you sure you want to delete your account?")) {
      return;
    }

    try {
      const response = await fetch(`${api}/auth/users/delete/${userData._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete account.");
      }

      alert("Account deleted successfully.");
      window.location.href = "/";
    } catch (error) {
      console.error("Error deleting account:", error);
      alert(error || "An error occurred while deleting the account.");
    }
  };

  return (
    <div className="p-6 gap-10 flex flex-col w-11/12 m-auto">
      {/* Personal Info */}
      <div className="flex flex-col lg:gap-3 shadow p-7 rounded-md bg-white">
        <div className="flex justify-between">
          <h2 className="text-base m:text-lg lg:text-xl">
            <span className="font-medium">Volunteer's </span>Information
          </h2>
          {isOwner && (
            <div
              className="flex gap-1 items-center cursor-pointer transition-transform hover:scale-110 hover:transition-transform duration-300 hover:duration-300"
              onClick={() => handleEditClick("personalInfo")}
            >
              <img src={EditSvg.src} alt="Edit" className="w-5 h-5" />
              <p className="text-sm m:text-base lg:text-lg">Edit</p>
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
          <h2 className="text-base m:text-lg lg:text-xl">Contact Info</h2>
          {isOwner && (
            <div
              className="flex gap-1 items-center cursor-pointer transition-transform hover:scale-110 hover:transition-transform"
              onClick={() => handleEditClick("contactInfo")}
            >
              <img src={EditSvg.src} alt="Edit" className="w-5 h-5" />
              <p className="text-sm m:text-base lg:text-lg">Edit</p>
            </div>
          )}
        </div>
        <div className="divider m-0"></div>
        <div className="flex flex-col gap-6">
          <p className="flex gap-4 text-sm lg:text-lg">
            <span className="text-gray-400 w-48">Email</span>
            <span>{profileData.email}</span>
          </p>
          <p className="flex gap-4 text-sm lg:text-lg">
            <span className="text-gray-400 w-48">Phone Number</span>
            <span>{profileData.phone}</span>
          </p>
          <p className="flex gap-4 text-sm lg:text-lg">
            <span className="text-gray-400 w-48">Location</span>
            <span>{profileData.location}</span>
          </p>
        </div>
      </div>

      {/* Achievements */}
      <div className="flex flex-col lg:gap-3 shadow p-7 rounded-md bg-white ">
        <div className="flex justify-between">
          <h2 className="text-base m:text-lg lg:text-xl">Achievements</h2>
        </div>
        <div className="divider m-0"></div>
        <div className="flex flex-col gap-6">
          <p className="flex gap-4  text-sm lg:text-lg">
            <span className="w-64">Rating</span>
            <span className="text-yellow-500">{profileData.rating}</span>
          </p>
          <p className="flex gap-4  text-sm lg:text-lg">
            <span className="w-64">Hours Volunteered</span>
            <span className="text-green-600">
              {profileData.hoursVolunteered}
            </span>
          </p>
          <p className="flex gap-4  text-sm lg:text-lg">
            <span className="w-64">Completed Projects Count</span>
            <span className="text-violet-400">{profileData.projectsCount}</span>
          </p>
        </div>
      </div>

      {/* Reviews */}
      <div className="flex flex-col lg:gap-3 shadow p-7 rounded-md bg-white ">
        <div className="flex justify-between">
          <h2 className="text-base m:text-lg lg:text-xl">Reviews</h2>
        </div>
        <div className="divider m-0"></div>
        <div>
          {profileData.reviews.map((review, index) => (
            <p key={index}>
              <strong>{review.author}:</strong> {review.text}
            </p>
          ))}
        </div>
      </div>

      {isOwner && (
        <button
          className="btn btn-error ml-auto  text-white "
          onClick={deleteUser}
        >
          Delete Account
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

      {loading && <p>Updating profile...</p>}
    </div>
  );
};

export default EditUserPage;
