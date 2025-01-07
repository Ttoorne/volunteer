"use client";
import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format } from "date-fns";
import { enUS, ru, tr } from "date-fns/locale";
import Link from "next/link";
import { api } from "@/hooks/api";
import { useLanguage } from "@/context/LanguageContext";
import { mainPage_Calendar } from "./Translations";

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
  const { language }: { language: "en" | "tr" | "ru" } = useLanguage();

  const getLocaleDate = (language: "en" | "tr" | "ru") => {
    if (language === "ru") return ru;
    if (language === "tr") return tr;
    return enUS;
  };

  const formatDate = (dateString: string, language: "en" | "tr" | "ru") => {
    const date = new Date(dateString);
    return format(date, "d MMMM yyyy, HH:mm", {
      locale: getLocaleDate(language),
    });
  };

  const formatDateWithoutHour = (
    dateString: string,
    language: "en" | "tr" | "ru"
  ) => {
    const date = new Date(dateString);
    return format(date, "d MMMM yyyy", { locale: getLocaleDate(language) });
  };

  const [events, setEvents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [localeLoaded, setLocaleLoaded] = useState(false);

  useEffect(() => {
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

  const sortedEvents = [...events].sort((a, b) => a.date - b.date);

  const eventsOnSelectedDate = selectedDate
    ? sortedEvents.filter(
        (event) =>
          event.date.toDateString() === selectedDate.toDateString() ||
          event.endDate.toDateString() === selectedDate.toDateString()
      )
    : [];

  const today = new Date();
  const upcomingEvents = sortedEvents.filter((event) => event.date >= today);

  const getTileClassName = ({ date, view }: any) => {
    if (view === "month") {
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      if (isToday) {
        return "react-calendar__tile--today";
      } else if (date < today) {
        return "react-calendar__tile--past";
      }
    }
    return "";
  };

  const getLocale = () => {
    if (language === "ru") return "ru";
    if (language === "tr") return "tr";
    return "en-US";
  };

  const translation = mainPage_Calendar[language];

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
            locale={getLocale()}
            calendarType="iso8601"
          />
        )}
        <div className="events-list w-full lg:w-[48%] bg-white border border-gray-300 rounded-lg p-6">
          <h3 className="font-semibold text-xl text-gray-700 mb-6 text-center border-b pb-4 border-gray-300">
            {selectedDate
              ? `${
                  translation.eventsOnSelectedDateText
                } ${formatDateWithoutHour(selectedDate.toString(), language)}`
              : translation.upcomingEventsText}
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
                      {formatDate(event.date.toString(), language)} -{" "}
                      {formatDate(event.endDate.toString(), language)}
                    </p>
                  </div>
                </Link>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 text-center text-lg">
              {translation.noEventsOnSelectedDateText}
            </p>
          )}
        </div>
      </div>

      <div className="upcoming-events mt-16 w-full">
        <h3 className="font-semibold text-2xl text-gray-800 mb-6 text-center">
          {translation.allUpcomingEventsText}
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
                    <p className="mt-2">
                      {formatDate(event.date.toString(), language)}
                    </p>
                    <p>{formatDate(event.endDate.toString(), language)}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-600 text-center w-full text-base">
              {translation.noUpcomingEventsText}
            </p>
          )}
        </ul>

        <Link
          href="/projects"
          className="mt-10 mx-auto block w-fit px-8 py-4 text-white font-medium text-lg bg-[#8c85f2] rounded-full hover:bg-[#7d77e0] transition-all duration-300 ease-in-out"
        >
          {translation.viewMoreText}
        </Link>
      </div>
    </div>
  );
};

export default HomeCalendar;
