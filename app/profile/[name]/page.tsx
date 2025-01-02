import { cookies } from "next/headers";
import EditUserPage from "@/components/UserPage/EditUserPage";
import { fetchUserData } from "@/server/utils/fetchUserData";
import { api } from "@/hooks/api";
import userBg from "@/assets/user__background.jpg";

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

const ProfilePage = async ({ params }: { params: { name: string } }) => {
  const token = cookies().get("accessToken")?.value;

  let currentUser = null;
  if (token) {
    try {
      currentUser = await fetchUserData(token);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  try {
    const userData = await fetchUserDataName(params.name);

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
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching user:", error);
    return <div>Error loading user data.</div>;
  }
};

export default ProfilePage;
