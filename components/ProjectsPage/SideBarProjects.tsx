import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parse } from "date-fns";

interface SideBarProjectsProps {
  filters: {
    startDate: string;
    endDate: string;
    location: string;
    status: string;
    sortOrder: string;
    searchQuery: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

const SideBarProjects: React.FC<SideBarProjectsProps> = ({
  filters,
  onFilterChange,
}) => {
  return (
    <div className="w-full hidden md:block md:w-1/4 bg-gradient-to-b from-white to-gray-50 shadow-2xl p-8 rounded-3xl sticky sm:mt-8 md:mt-12 lg:mt-[76px] top-16 pb-8 h-full">
      <h2 className="text-2xl font-extrabold mb-8 text-center text-cyan-700">
        Filter Options
      </h2>

      <div className="flex flex-col gap-5">
        {/* Start Date */}
        <div className="flex flex-col">
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            Start Date
          </label>
          <DatePicker
            selected={
              filters.startDate
                ? parse(filters.startDate, "yyyy-MM-dd", new Date())
                : null
            }
            onChange={(date: Date | null) =>
              onFilterChange(
                "startDate",
                date ? format(date, "yyyy-MM-dd") : ""
              )
            }
            dateFormat="dd-MM-yyyy"
            className="w-full p-4 pl-7 border border-blue-300 rounded-full bg-white focus:ring-2 focus:ring-blue-300 focus:outline-none shadow-md"
            placeholderText="Pick a date"
          />
        </div>

        {/* Location */}
        <div className="flex flex-col">
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            Location
          </label>
          <input
            type="text"
            value={filters.location}
            onChange={(e) => onFilterChange("location", e.target.value)}
            placeholder="Type location"
            className="w-full p-4 pl-7 border border-blue-300 rounded-full bg-white focus:ring-2 focus:ring-blue-300 focus:outline-none shadow-md"
          />
        </div>

        {/* Status */}
        <div className="flex flex-col">
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            Status
          </label>
          <div className="relative w-full">
            <select
              value={filters.status}
              onChange={(e) => onFilterChange("status", e.target.value)}
              className={`w-full p-4 pl-5 pr-10 text-center font-medium border rounded-full focus:ring-2 focus:outline-none shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 appearance-none
        ${filters.status === "all" ? "bg-white" : ""}
                ${
                  filters.status === "open"
                    ? "bg-success border-transparent text-white"
                    : ""
                }
        ${
          filters.status === "completed"
            ? "bg-primary border-transparent text-white"
            : ""
        }
        ${
          filters.status === "in-progress"
            ? "bg-warning border-transparent text-white"
            : ""
        }
      `}
            >
              <option
                value="all"
                className="text-gray-600 bg-white py-2 px-4 font-medium rounded-md hover:bg-gray-100"
              >
                Any Status
              </option>
              <option
                value="open"
                className="text-success bg-white font-semibold py-2 px-4 rounded-md"
              >
                Open
              </option>
              <option
                value="completed"
                className="text-blue-500 bg-white font-semibold py-2 px-4 rounded-md"
              >
                Completed
              </option>
              <option
                value="in-progress"
                className="text-warning bg-white font-semibold py-2 px-4 rounded-md"
              >
                In Progress
              </option>
            </select>
            <div className="absolute right-5 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className={`w-5 h-5 text-gray-600 ${
                  filters.status !== "all" ? "text-white" : ""
                }`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Sort Order */}
        <div className="flex flex-col">
          <label className="block mb-2 text-sm font-semibold text-gray-700">
            Sort By
          </label>
          <div className="relative w-full">
            <select
              value={filters.sortOrder}
              onChange={(e) => onFilterChange("sortOrder", e.target.value)}
              className="w-full p-4 border text-center font-medium border-blue-300 rounded-full bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 appearance-none"
            >
              <option
                value="ascending"
                className="text-gray-600 bg-white py-2 px-4 rounded-md hover:bg-gray-100"
              >
                Date: Ascending
              </option>
              <option
                value="descending"
                className="text-gray-600 bg-white py-2 px-4 rounded-md hover:bg-gray-100"
              >
                Date: Descending
              </option>
            </select>
            <div className="absolute right-5 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-5 h-5 text-gray-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBarProjects;
