"use client";

import EditUserPage from "@/components/UserPage/EditUserPage";
import { api } from "@/hooks/api";
import userBg from "@/assets/user__background.jpg";
import { useEffect, useState } from "react";

// Функция для получения данных пользователя по имени
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

// Функция для получения текущих данных пользователя по токену
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

  console.log(userData);

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
