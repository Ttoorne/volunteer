import { cookies } from "next/headers";
import Link from "next/link";
import logo from "../assets/logo-volunteer.svg";
import Image from "next/image";
import { fetchUserData } from "@/server/utils/fetchUserData";
import { fetchUserAvatarNavbar } from "@/server/utils/fetchUserAvatarNavbar";
import LogoutButton from "@/components/LogoutButton";

const Navbar = async () => {
  const token = cookies().get("accessToken")?.value;

  let user = null;
  let userAvatarUrl = null;
  if (token) {
    try {
      user = await fetchUserData(token);
      if (user.avatar) {
        userAvatarUrl = await fetchUserAvatarNavbar(user.avatar);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  return (
    <nav className="z-50 px-2 py-0 bg-white shadow-sm">
      <div className="container mx-auto flex justify-between items-center text-lg font-normal">
        <div className="ml-3">
          <Link href="/">
            <Image
              src={logo}
              alt="Logo"
              priority
              className="w-28 h-28 lg:w-32 lg:h-32"
            />
          </Link>
        </div>
        <div className="space-x-5 text-base md:text-lg lg:text-xl">
          <Link href="/">Home</Link>
          <Link href="/projects">Projects</Link>
          {user && <Link href="/chat">Messages</Link>}
        </div>
        <div className="mr-2">
          {user ? (
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar btn-md lg:btn-lg"
              >
                <div className="w-full rounded-full">
                  <img
                    alt="Avatar"
                    src={
                      userAvatarUrl ||
                      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-DSW54utMSZ6J1F9luVr6YYDoRZ-FQYCL3w&s"
                    }
                    className="object-cover rounded-full w-full h-full"
                  />
                </div>
              </div>
              <ul
                tabIndex={0}
                className="z-55 menu menu-md lg:menu-lg dropdown-content bg-white rounded-box z-[1] mt-3 w-52 text-base p-2 shadow-md"
              >
                <li>
                  <Link href={`/profile/${user.name}`}>Profile</Link>
                </li>

                <li>
                  <Link href={`/projects/add`}>Add Project</Link>
                </li>
                <li>
                  <LogoutButton />
                </li>
              </ul>
            </div>
          ) : (
            <Link href="/auth/login">Log in</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
