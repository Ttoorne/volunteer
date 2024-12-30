import { cookies } from "next/headers";
import EditUserPage from "@/components/UserPage/EditUserPage";
import { fetchUserData } from "@/server/utils/fetchUserData";
import { api } from "@/hooks/api";

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
      <div
        className="bg-gray-200 pt-10 pb-16"
        style={{
          minHeight: "100vh",
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${"https://png.pngtree.com/background/20210716/original/pngtree-graffiti-pen-touch-abstract-brush-background-picture-image_1355227.jpg"})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <EditUserPage
          userData={userData}
          token={token}
          currentUserName={currentUser?.name || null}
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching user:", error);
    return <div>Error loading user data.</div>;
  }
};

export default ProfilePage;
