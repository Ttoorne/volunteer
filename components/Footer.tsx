import Link from "next/link";
import { FaGithub, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-blue-900 text-white py-10 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* About Us Section */}
        <div>
          <h4 className="font-semibold text-lg mb-4 text-center lg:text-start">
            About Us
          </h4>
          <p className="text-sm text-center md:text-base lg:text-start">
            Volunteer is a platform connecting volunteers with impactful
            projects. Together, we create positive change.
          </p>
        </div>

        {/* Quick Links Section */}
        <div className="text-center">
          <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/events" className="hover:underline">
                Events
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:underline">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/support" className="hover:underline">
                Support
              </Link>
            </li>
          </ul>
        </div>

        {/* Follow Us Section */}
        <div className="flex flex-col items-center lg:items-end">
          <h4 className="font-semibold text-lg mb-4">Follow Us</h4>
          <div className="flex space-x-4">
            <a
              href="https://github.com/TtooRne"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-400"
            >
              <FaGithub size={20} />
            </a>
            <a
              href="https://linkedin.com/in/your-profile"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-400"
            >
              <FaLinkedin size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-8 text-center text-sm">
        © {new Date().getFullYear()} Volunteer Platform. All rights reserved.{" "}
      </div>
    </footer>
  );
};

export default Footer;
