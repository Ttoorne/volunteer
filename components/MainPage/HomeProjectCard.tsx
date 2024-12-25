import { api } from "@/hooks/api";
import Link from "next/link";

interface HomeProjectCardProps {
  project: {
    _id: string;
    title: string;
    description: string;
    images: string[];
    startDate: string;
    endDate: string;
    location: string;
    status: "open" | "completed" | "in-progress";
  };
}

const HomeProjectCard: React.FC<HomeProjectCardProps> = ({ project }) => {
  const { title, description, images, startDate, endDate, location, status } =
    project;

  const statusColor =
    status === "open"
      ? "bg-green-100 text-green-600"
      : "bg-yellow-100 text-yellow-600";

  const getImageUrl = (imageId: string) => {
    return `${api}/projects/images/${imageId}`;
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}.${month}.${year}, ${hours}:${minutes}`;
  };

  return (
    <div className="carousel-item bg-white border-gray-300 border-2 rounded-xl shadow-md hover:border-teal-600 transition-all w-full sm:w-[48%] md:w-[31%] mx-auto flex flex-col">
      {/* Image */}
      {images && images.length > 0 ? (
        <img
          src={getImageUrl(project.images[0])}
          alt={title}
          className="w-full h-40 sm:h-48 md:h-56 object-cover rounded-t-xl rounded-b-none bg-gray-700 skeleton"
        />
      ) : (
        <div className="w-full h-40 sm:h-48 md:h-56 bg-gray-200 flex items-center justify-center text-gray-500 rounded-t-xl">
          No Image
        </div>
      )}

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        {/* Title */}
        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-base mb-4 sm:mb-6 mt-auto line-clamp-3">
          {description.length > 100
            ? `${description.slice(0, 100)}...`
            : description}
        </p>

        {/* Dates and Location */}
        <div className="text-gray-500 text-base mb-4 mt-auto">
          <p>
            <span className="font-semibold">Start:</span>{" "}
            {formatDateTime(startDate)}
          </p>
          <p>
            <span className="font-semibold">End:</span>{" "}
            {formatDateTime(endDate)}
          </p>
          <p>
            <span className="font-semibold">Location:</span> {location}
          </p>
        </div>

        {/* Status and Link */}
        <div className="flex flex-col lg:flex-row justify-between items-center mt-4">
          <div
            className={`inline-block p-3 rounded-xl text-sm font-medium ${statusColor}`}
          >
            {status === "in-progress" ? "IN PROGRESS" : status.toUpperCase()}
          </div>
          <Link
            href={`/project/${project._id}`}
            className="bg-teal-700 text-white p-3 rounded-2xl hover:bg-teal-600 transition duration-300"
          >
            Watch Project
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomeProjectCard;
