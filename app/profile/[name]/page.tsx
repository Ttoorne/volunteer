"use client";

import EditUserPage from "@/components/UserPage/EditUserPage";
import { api } from "@/hooks/api";
import userBg from "@/assets/user__background.jpg";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { userPage__translation } from "@/components/UserPage/Translation";

const fetchUserDataName = async (name: string) => {
  const response = await fetch(`${api}/auth/users/${name}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user data: ${response.statusText}`);
  }

  return response.json();
};

const fetchUserData = async (token: string) => {
  const response = await fetch(`${api}/auth/profiles/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch current user data: ${response.statusText}`
    );
  }

  return response.json();
};

const updateCompletedProjects = async (name: string) => {
  const response = await fetch(`${api}/auth/users/${name}/completeProjects`, {
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to update completed projects: ${response.statusText}`
    );
  }

  return response.json();
};

const getUserHours = async (name: string) => {
  try {
    const response = await fetch(`${api}/auth/users/${name}/hoursVolunteered`);
    if (!response.ok) {
      throw new Error("Failed to fetch user hours");
    }
    const data = await response.json();
    return data.hoursVolunteered;
  } catch (error) {
    console.error("Error fetching user hours:", error);
    return 0;
  }
};

const ProfilePage = ({ params }: { params: { name: string } }) => {
  const [token, setToken] = useState<string | undefined>();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState<boolean>(false);
  const { language }: { language: "en" | "tr" | "ru" } = useLanguage();
  const t = userPage__translation[language];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tokenResponse = await fetch(`${api}/projects/some-route`, {
          method: "GET",
          credentials: "include",
        });

        if (!tokenResponse.ok) {
          throw new Error("Failed to fetch token");
        }

        const { token: fetchedToken } = await tokenResponse.json();
        setToken(fetchedToken);

        if (fetchedToken) {
          const currentUserData = await fetchUserData(fetchedToken);
          setCurrentUser(currentUserData);
        }

        const userDataByName = await fetchUserDataName(params.name);
        setUserData(userDataByName);

        const hours = await getUserHours(params.name);
        setUserData((prevUserData: any) => ({
          ...prevUserData,
          hoursVolunteered: hours,
        }));

        await updateCompletedProjects(params.name);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.name, refresh]);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-gray-200"
        style={{
          backgroundImage: `url(${userBg.src})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (params.name === "undefined") {
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-gray-100 text-center"
        style={{
          backgroundImage: `url(${userBg.src})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        <div className="bg-white p-16 rounded-xl">
          <h1 className="text-4xl font-bold text-red-400 mb-4">
            {t.userNotFound}
          </h1>
          <p className="text-gray-600">{t.userNotFoundMessage}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
          >
            {t.goBack}
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return <div>Error loading user data.</div>;
  }

  return (
    <div className="bg-gray-200 pt-10 pb-16 relative">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          minHeight: "100vh",
          backgroundImage: `url(${userBg.src})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          filter: "blur(5px) brightness(0.8)",
        }}
      ></div>
      <EditUserPage
        userData={userData}
        token={token}
        currentUser={currentUser || null}
        setRefresh={setRefresh}
      />
    </div>
  );
};

export default ProfilePage;
