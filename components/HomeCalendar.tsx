"use client";
import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Import styles
import { format } from "date-fns";
import { enUS } from "date-fns/locale"; // Import English locale
import Link from "next/link";

// Function for formatting dates
const formatDate = (dateString: string) => {
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // State for selected date
  const [localeLoaded, setLocaleLoaded] = useState(false); // State for checking if locale is loaded

  useEffect(() => {
    // Check if locale is loaded
    setLocaleLoaded(true);

    const formattedEvents = projects.map((project) => ({
      id: project._id,
      title: project.title,
      date: new Date(project.startDate),
      endDate: new Date(project.endDate),
    }));
    setEvents(formattedEvents);
  }, [projects]);

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

  // Events in calendar
  const getTileClassName = ({ date, view }: any) => {
    if (view === "month") {
      const event = events.find(
        (event) => event.date.toDateString() === date.toDateString()
      );
      return event
        ? "bg-violet-600 transition-all duration-200 ease-in-out transform hover:scale-125"
        : "transition-all duration-200 ease-in-out transform hover:scale-125";
    }
    return "transition-all duration-200 ease-in-out transform hover:scale-125";
  };

  return (
    <div className="home-calendar p-6 flex flex-col items-center">
      <div className="w-full flex justify-between">
        {localeLoaded && (
          <Calendar
            tileClassName={getTileClassName}
            minDate={new Date()}
            onClickDay={(date: any) => setSelectedDate(date)}
            value={selectedDate}
            className="border-2 border-gray-800 rounded-xl bg-white shadow-lg p-4 w-2/3"
            locale="en-US"
          />
        )}
        <div className="events-list mt-8 w-1/3">
          <h3 className="font-semibold text-2xl text-gray-800 mb-4">
            {selectedDate
              ? `Events on ${formatDate(selectedDate.toString())}`
              : "Upcoming Events"}
          </h3>

          {eventsOnSelectedDate.length > 0 ? (
            <ul className="space-y-4">
              {eventsOnSelectedDate.map((event, index) => (
                <Link
                  href={`/projects/${event.id}`} // Используем _id для ссылки
                  key={index}
                  className="block p-6 border-2 border-gray-200 rounded-lg hover:bg-gray-100 transition-all duration-300 ease-in-out"
                >
                  <p className="text-xl font-bold text-gray-900">
                    {event.title}
                  </p>
                  <p className="text-base text-gray-600">
                    {formatDate(event.date.toString())} -{" "}
                    {formatDate(event.endDate.toString())}
                  </p>
                </Link>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No events on this day.</p>
          )}
        </div>
      </div>

      <div className="upcoming-events mt-8 w-full">
        <h3 className="font-semibold text-2xl text-gray-800 mb-4">
          All Upcoming Events
        </h3>
        <ul className="space-y-4">
          {sortedEvents.map((event, index) => (
            <Link
              href={`/projects/${event.id}`} // Используем _id для ссылки
              key={index}
              className="block p-6 border-2 border-gray-200 rounded-lg hover:bg-gray-100 transition-all duration-300 ease-in-out"
            >
              <p className="text-xl font-bold text-gray-900">{event.title}</p>
              <p className="text-base text-gray-600">
                {formatDate(event.date.toString())} -{" "}
                {formatDate(event.endDate.toString())}
              </p>
            </Link>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HomeCalendar;
