"use client";
import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Import styles
import { format } from "date-fns";
import { enUS } from "date-fns/locale"; // Import English locale
import Link from "next/link";
import { api } from "@/hooks/api";

// Function for formatting dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, "d MMMM yyyy, HH:mm", { locale: enUS });
};

const formatDateWithoutHour = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, "d MMMM yyyy", { locale: enUS });
};

interface HomeCalendarProps {
  projects: {
    _id: string;
    title: string;
    description: string;
    images: string[];
    startDate: string;
    endDate: string;
    location: string;
    status: "open" | "completed" | "in-progress";
  }[];
}

const HomeCalendar: React.FC<HomeCalendarProps> = ({ projects }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // Default to today's date
  const [localeLoaded, setLocaleLoaded] = useState(false); // State for checking if locale is loaded

  useEffect(() => {
    // Check if locale is loaded
    setLocaleLoaded(true);

    const formattedEvents = projects.map((project) => ({
      id: project._id,
      title: project.title,
      date: new Date(project.startDate),
      endDate: new Date(project.endDate),
      images: project.images,
    }));
    setEvents(formattedEvents);
  }, [projects]);

  const getImageUrl = (imageId: string) => {
    return `${api}/projects/images/${imageId}`;
  };

  // Sorting events by date
  const sortedEvents = [...events].sort((a, b) => a.date - b.date);

  // Events for selected date
  const eventsOnSelectedDate = selectedDate
    ? sortedEvents.filter(
        (event) =>
          event.date.toDateString() === selectedDate.toDateString() ||
          event.endDate.toDateString() === selectedDate.toDateString()
      )
    : [];

  // Filter upcoming events to show only those starting today or later
  const today = new Date();
  const upcomingEvents = sortedEvents.filter((event) => event.date >= today);

  // Highlight past and today's dates
  const getTileClassName = ({ date, view }: any) => {
    if (view === "month") {
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      if (isToday) {
        return "react-calendar__tile--today"; // Highlight today
      } else if (date < today) {
        return "react-calendar__tile--past"; // Highlight past dates
      }
    }
    return "";
  };

  return (
    <div className="home-calendar p-6 flex flex-col items-center">
      <div className="w-full flex flex-col lg:flex-row justify-between gap-6">
        {localeLoaded && (
          <Calendar
            tileClassName={getTileClassName}
            minDate={new Date()}
            onClickDay={(date: any) => setSelectedDate(date)}
            value={selectedDate}
            className="border-2 border-gray-800 rounded-xl bg-gray-100 shadow-lg p-4 w-full lg:w-2/3"
            locale="en-US"
            calendarType="iso8601"
          />
        )}
        <div className="events-list w-full lg:w-[48%] bg-white border border-gray-300 rounded-lg p-6">
          <h3 className="font-semibold text-xl text-gray-700 mb-6 text-center border-b pb-4 border-gray-300">
            {selectedDate
              ? `Events on ${formatDateWithoutHour(selectedDate.toString())}`
              : "Upcoming Events"}
          </h3>

          {eventsOnSelectedDate.length > 0 ? (
            <ul className="space-y-4 max-h-[380px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-100">
              {eventsOnSelectedDate.map((event, index) => (
                <Link
                  href={`/projects/${event.id}`}
                  key={index}
                  className="block px-6 py-4 border rounded-lg bg-white hover:bg-gray-100 transition-all duration-300 ease-in-out"
                >
                  <div>
                    <p className="text-lg font-medium text-gray-800">
                      {event.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(event.date.toString())} -{" "}
                      {formatDate(event.endDate.toString())}
                    </p>
                  </div>
                </Link>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 text-center text-lg">
              No events on this day
            </p>
          )}
        </div>
      </div>

      <div className="upcoming-events mt-16 w-full">
        <h3 className="font-semibold text-2xl text-gray-800 mb-6 text-center">
          All Upcoming Events
        </h3>
        <ul className="flex flex-wrap gap-6">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.slice(0, 8).map((event, index) => (
              <Link
                href={`/projects/${event.id}`}
                key={index}
                className="block w-[calc(25%-1.5rem)] p-6 border-2 border-transparent bg-gradient-to-r from-[#f0f4f8] to-[#e0e8f0] rounded-xl relative overflow-hidden group transition-all duration-300 ease-in-out"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-all duration-300 ease-in-out group-hover:opacity-80"
                  style={{
                    backgroundImage: `url(${getImageUrl(event.images[0])})`,
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="absolute inset-0 bg-black opacity-40"></div>
                </div>

                <div className="relative z-10 text-white text-center">
                  <p className="text-xl font-semibold mb-3 h-16 overflow-hidden text-ellipsis">
                    {event.title}
                  </p>

                  <div className="text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                    <p className="mt-2">{formatDate(event.date.toString())}</p>
                    <p>{formatDate(event.endDate.toString())}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-600 text-center w-full text-base">
              At the moment, there are no upcoming events
            </p>
          )}
        </ul>

        <Link
          href="/projects"
          className="mt-10 mx-auto block w-fit px-8 py-4 text-white font-medium text-lg bg-[#8c85f2] rounded-full hover:bg-[#7d77e0] transition-all duration-300 ease-in-out"
        >
          View More
        </Link>
      </div>
    </div>
  );
};

export default HomeCalendar;
