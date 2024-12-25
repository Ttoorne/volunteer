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
  };
  onFilterChange: (key: string, value: string) => void;
}

const SideBarProjects: React.FC<SideBarProjectsProps> = ({
  filters,
  onFilterChange,
}) => {
  return (
    <div className="w-1/4 bg-white shadow-md p-4 rounded-lg sticky top-8 pb-8 h-full">
      <h2 className="text-xl font-semibold mb-4 text-center">Filter</h2>
      <div className="flex flex-col gap-4">
        {/* Start Date */}
        <label>
          <span className="block mb-1 text-sm font-medium">Start Date</span>
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
            className="w-full p-2 border rounded bg-white"
            placeholderText="Select start date"
          />
        </label>

        {/* Location */}
        <label>
          <span className="block mb-1 text-sm font-medium">Location</span>
          <input
            type="text"
            value={filters.location}
            onChange={(e) => onFilterChange("location", e.target.value)}
            placeholder="Enter location"
            className="w-full p-2 border rounded bg-white"
          />
        </label>

        {/* Status */}
        <label>
          <span className="block mb-1 text-sm font-medium">Status</span>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange("status", e.target.value)}
            className="w-full p-2 border rounded bg-white"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="completed">Completed</option>
            <option value="in-progress">In Progress</option>
          </select>
        </label>

        {/* Sort Order */}
        <label>
          <span className="block mb-1 text-sm font-medium">Sort By Date</span>
          <select
            value={filters.sortOrder}
            onChange={(e) => onFilterChange("sortOrder", e.target.value)}
            className="w-full p-2 border rounded bg-white"
          >
            <option value="ascending">Ascending</option>
            <option value="descending">Descending</option>
          </select>
        </label>
      </div>
    </div>
  );
};

export default SideBarProjects;
