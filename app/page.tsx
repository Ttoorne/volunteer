"use client";
import React, { Component } from "react";
import Image from "next/image";
import communicatePctr from "../assets/home_page__communicate.gif";
import discoverGuy from "../assets/home_page__discover.gif";
import joinImg from "../assets/home_page__join.gif";
import connectImg from "../assets/home_page__connect.gif";
import impactImg from "../assets/home_page__impact.gif";
import whyVolImg from "../assets/home_page__why-volunteer.gif";
import globalImg from "../assets/home_page__global.gif";
import Link from "next/link";

const features = [
  {
    img: discoverGuy,
    title: "Explore Opportunities",
    text: "Browse through a variety of events and initiatives tailored to your interests and skills.",
  },
  {
    img: joinImg,
    title: "Register Quickly",
    text: "Sign up for exciting volunteer events with just a few clicks and easily secure your spot.",
  },
  {
    img: connectImg,
    title: "Connect and Collaborate",
    text: "Communicate with organizers and fellow volunteers directly through our platform.",
  },
  {
    img: impactImg,
    title: "Make an Impact",
    text: "Join projects, contribute your time, and help create positive change in your community.",
  },
];

export default class Home extends Component {
  observer: IntersectionObserver | null = null;

  componentDidMount() {
    if (typeof window !== "undefined") {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const { target } = entry;
              const isSecondSection =
                target.classList.contains("second-section");
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

      document.querySelectorAll(".fade-in-on-scroll").forEach((el) => {
        this.observer?.observe(el);
      });
    }
  }

  componentWillUnmount() {
    this.observer?.disconnect();
  }

  render() {
    return (
      <div className="flex flex-col gap-20 py-10 md:py-12">
        {/* First Section */}
        <section className="w-[90%] md:w-[85%] m-auto flex flex-col lg:flex-row justify-between items-center gap-12">
          <div className="flex flex-col gap-7 text-center lg:text-left">
            <h2 className="text-4xl md:text-5xl leading-snug animate-fade-in">
              Communicate.
              <br /> Support.
              <br /> Make a Difference.
            </h2>
            <p className="text-lg md:text-xl animate-fade-in">
              Join our community of volunteers and make a real impact. Whether
              you're offering your time, skills, or support, every action
              counts. Together, we can create positive change and build stronger
              communities.
            </p>
            <Link
              href={"/projects"}
              className="btn text-gray-400 btn-md w-[70%] md:w-[40%] animate-slide-up m-auto lg:m-0 hover:text-gray-300 "
            >
              Get started
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
              What is <b>Volunteer?</b>
            </h2>
            <p className="text-lg md:text-xl fade-in-on-scroll opacity-0">
              Volunteer is an online platform designed to help people find
              volunteer opportunities and initiatives in their local
              communities. On our website, volunteers can register for events,
              connect with organizers, and participate in various projects that
              make a positive impact on the world.
            </p>
          </div>
        </section>

        {/* Third Section */}
        <section className="w-[90%] lg:w-[80%] m-auto mt-20 md:mt-28">
          <header className="text-center">
            <h2 className="font-semibold text-2xl md:text-3xl">
              How Does Volunteer Work?
            </h2>
            <p className="text-md md:text-lg fade-in-on-scroll opacity-0">
              Volunteer makes it simple and seamless to connect with
              volunteering opportunities.
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
              Why <span className="font-semibold">Volunteer</span>?
            </h2>
            <p className="text-md md:text-lg mt-4">
              Volunteer is a platform that brings together volunteers and
              organizations to achieve common goals. We create a space where
              everyone can find the right event, make a difference, and feel
              part of something greater. With a simple interface, a variety of
              opportunities, and direct communication with organizers, Volunteer
              is a convenient and reliable tool for those who want to help.
            </p>
          </div>
        </section>

        {/* Fifth Section */}
        <section className="bg-pink-200 mt-20 md:mt-52 py-16 md:py-32 flex items-center">
          <div className="w-[90%] lg:w-[80%] m-auto text-center fade-in-on-scroll opacity-0">
            <h2 className="text-3xl md:text-5xl leading-snug">
              Support for Newcomers
            </h2>
            <p className="text-md md:text-xl mt-4">
              At Volunteer, we understand that starting something new can feel
              overwhelming. That’s why we’re here to guide you every step of the
              way. Whether it’s your first time volunteering or exploring new
              opportunities, our platform offers resources, tips, and a
              welcoming community to help you get started.
            </p>
          </div>
        </section>

        {/* Sixth Section */}
        <section className="mt-20 flex flex-col items-center gap-12">
          <div className="w-[90%] lg:w-[70%] text-center">
            <h2 className="text-2xl md:text-3xl leading-snug">
              Global Mission
            </h2>
            <p className="text-md md:text-lg mt-4">
              At Volunteer, we envision a world where everyone has the
              opportunity to contribute to positive change. Our mission is to
              connect volunteers with impactful projects, fostering a network of
              support, collaboration, and compassion.
            </p>
            <Link
              href={"/projects"}
              className="btn text-gray-400 btn-md w-[60%] md:w-[35%] animate-slide-up mt-8 hover:text-gray-300"
            >
              Get started
            </Link>
          </div>
          <Image
            src={globalImg}
            alt="Global Mission"
            className="fade-in-on-scroll opacity-0 object-contain w-[392px] h-[392px] md:w-[424px] md:h-[424px]  lg:w-[472px] lg:h-[472px]"
          />
        </section>
      </div>
    );
  }
}
