"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import communicatePctr from "@/assets/home_page__communicate.gif";
import discoverGuy from "@/assets/home_page__discover.gif";
import joinImg from "@/assets/home_page__join.gif";
import connectImg from "@/assets/home_page__connect.gif";
import impactImg from "@/assets/home_page__impact.gif";
import whyVolImg from "@/assets/home_page__why-volunteer.gif";
import globalImg from "@/assets/home_page__global.gif";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { about__translations } from "@/components/AboutPage/Translation";

const AboutPage = () => {
  const { language }: { language: "en" | "tr" | "ru" } = useLanguage();
  const t = about__translations[language];

  const features = [
    {
      img: discoverGuy,
      title: t.exploreOpportunities,
      text: t.exploreDescription,
    },
    {
      img: joinImg,
      title: t.registerQuickly,
      text: t.registerDescription,
    },
    {
      img: connectImg,
      title: t.connectCollaborate,
      text: t.connectDescription,
    },
    {
      img: impactImg,
      title: t.makeImpact,
      text: t.impactDescription,
    },
  ];
  const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const showButton = scrollPosition > 3500;
      setShowScrollToTopButton(showButton);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const { target } = entry;
            const isSecondSection = target.classList.contains("second-section");
            target.classList.add(
              "opacity-100",
              "transition-opacity",
              isSecondSection
                ? "duration-5000 animate-slideRight"
                : "duration-1000"
            );
          }
        });
      },
      { threshold: 0.7 }
    );

    window.addEventListener("scroll", handleScroll);

    document.querySelectorAll(".fade-in-on-scroll").forEach((el) => {
      observer.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-20 py-10 md:py-12">
      {/* First Section */}
      <section className="w-[90%] md:w-[85%] m-auto flex flex-col lg:flex-row justify-between items-center gap-12">
        <div className="flex flex-col gap-7 text-center lg:text-left">
          <h2 className="text-4xl md:text-5xl leading-snug animate-fade-in">
            {t.communicate}
            <br /> {t.support}
            <br /> {t.makeDifference}
          </h2>
          <p className="text-lg md:text-xl animate-fade-in">
            {t.joinCommunity}
          </p>
          <Link
            href={"/projects"}
            className="btn text-gray-400 btn-md w-[70%] md:w-[40%] animate-slide-up m-auto lg:m-0 hover:text-gray-300 "
          >
            {t.getStarted}
          </Link>
        </div>
        <Image
          src={communicatePctr}
          alt="Communicate"
          className="animate-fade-in object-contain w-[432px] h-[432px] md:w-[464px] md:h-[464px]  lg:w-[512px] lg:h-[512px]"
          priority
        />
      </section>

      {/* Second Section */}
      <section className="bg-yellow-400 mt-20 md:mt-52 py-16 md:py-32 flex items-center second-section">
        <div className="w-[90%] lg:w-[80%] m-auto flex flex-col lg:flex-row gap-8 items-center">
          <h2 className="text-3xl md:text-5xl leading-snug fade-in-on-scroll opacity-0">
            {language !== "tr" ? (
              <span>
                {t.whatIs}
                <b>Volunteer</b>?
              </span>
            ) : (
              <span>
                <b>Volunteer</b>
                {t.whatIs}?
              </span>
            )}
          </h2>
          <p className="text-lg md:text-xl fade-in-on-scroll opacity-0">
            {t.whatIsVolunteer}
          </p>
        </div>
      </section>

      {/* Third Section */}
      <section className="w-[90%] lg:w-[80%] m-auto mt-20 md:mt-28">
        <header className="text-center">
          <h2 className="font-semibold text-2xl md:text-3xl">
            {t.howDoesWork}
          </h2>
          <p className="text-md md:text-lg fade-in-on-scroll opacity-0">
            {t.howDoesWorkDescription}
          </p>
        </header>
        <div className="flex flex-wrap justify-center lg:justify-between mt-12 gap-8">
          {features.map(({ img, title, text }, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-5 text-center flex-[1_1_300px]"
            >
              <Image
                src={img}
                alt={title}
                className="h-[200px] md:h-[288px] w-auto object-contain"
              />
              <h4 className="font-semibold text-lg md:text-xl">{title}</h4>
              <p className="text-sm md:text-lg">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Fourth Section */}
      <section className="flex flex-col lg:flex-row gap-8 items-center w-[90%] lg:w-[80%] mt-32 mx-auto fade-in-on-scroll opacity-0">
        <Image
          src={whyVolImg}
          alt="Why Volunteer?"
          className="object-contain w-[432px] h-[432px] md:w-[464px] md:h-[464px]  lg:w-[512px] lg:h-[512px]"
        />
        <div>
          <h2 className="text-3xl md:text-4xl">
            {t.whyVolunteer}
            <span className="font-semibold">Volunteer</span>?
          </h2>
          <p className="text-md md:text-lg mt-4">{t.whyVolunteerDescription}</p>
        </div>
      </section>

      {/* Fifth Section */}
      <section className="bg-pink-200 mt-20 md:mt-52 py-16 md:py-32 flex items-center">
        <div className="w-[90%] lg:w-[80%] m-auto text-center fade-in-on-scroll opacity-0">
          <h2 className="text-3xl md:text-5xl leading-snug">
            {t.supportNewcomers}
          </h2>
          <p className="text-md md:text-xl mt-4">
            {t.supportNewcomersDescription}
          </p>
        </div>
      </section>

      {/* Sixth Section */}
      <section className="mt-20 flex flex-col items-center gap-12">
        <div className="w-[90%] lg:w-[70%] text-center">
          <h2 className="text-2xl md:text-3xl leading-snug">
            {t.globalMission}
          </h2>
          <p className="text-md md:text-lg mt-4">
            {t.globalMissionDescription}
          </p>
          <Link
            href={"/projects"}
            className="btn text-gray-400 btn-md w-[60%] md:w-[35%] animate-slide-up mt-8 hover:text-gray-300"
          >
            {t.getStarted}
          </Link>
        </div>
        <Image
          src={globalImg}
          alt="Global Mission"
          className="fade-in-on-scroll opacity-0 object-contain w-[392px] h-[392px] md:w-[424px] md:h-[424px]  lg:w-[472px] lg:h-[472px]"
        />
      </section>

      {showScrollToTopButton && (
        <button
          title="To the top"
          className="fixed bottom-6 right-8 w-12 h-12 md:w-14 md:h-14 bg-gray-800 border-2 border-gray-800 flex items-center justify-center text-center text-white text-3xl md:text-4xl  rounded-full shadow-xl hover:shadow-2xl transition-all ease-in-out duration-300 transform hover:scale-110 animate-fade-in"
          onClick={scrollToTop}
        >
          <span>↑</span>
        </button>
      )}
    </div>
  );
};

export default AboutPage;
