const HomeFaq = () => {
  return (
    <div className="p-10 space-y-5 relative">
      {/* Circle Effect */}
      <div className="absolute w-32 h-32 rounded-full bg-indigo-100 opacity-30 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 blur-3xl transition-all duration-300"></div>

      {/* FAQ Section */}
      <div className="space-y-4 sm:space-y-6 md:space-y-8">
        <div
          tabIndex={0}
          className="collapse collapse-plus border border-transparent bg-white shadow-md mb-4 p-6 rounded-xl hover:bg-gray-100 transition-all duration-300 ease-in-out"
        >
          <div className="collapse-title text-xl font-medium text-gray-700 flex items-center space-x-3">
            <span>How Do I Join a Project?</span>
          </div>
          <div className="collapse-content text-gray-600 text-lg">
            <p>
              Simply browse our active projects, click on one that interests
              you, and sign up directly from the project page.
            </p>
          </div>
        </div>

        <div
          tabIndex={0}
          className="collapse collapse-plus border border-transparent bg-white shadow-md mb-4 p-6 rounded-xl hover:bg-gray-100 transition-all duration-300 ease-in-out"
        >
          <div className="collapse-title text-xl font-medium text-gray-700 flex items-center space-x-3">
            <span>What Should I Bring?</span>
          </div>
          <div className="collapse-content text-gray-600 text-lg">
            <p>
              Bring a positive attitude and any required materials mentioned in
              the project description. We'll provide the rest!
            </p>
          </div>
        </div>

        <div
          tabIndex={0}
          className="collapse collapse-plus border border-transparent bg-white shadow-md mb-4 p-6 rounded-xl hover:bg-gray-100 transition-all duration-300 ease-in-out"
        >
          <div className="collapse-title text-xl font-medium text-gray-700 flex items-center space-x-3">
            <span>How Do I Register for an Account?</span>
          </div>
          <div className="collapse-content text-gray-600 text-lg">
            <p>
              You can easily register by clicking the "Sign Up" button on the
              homepage. Fill out the registration form with your details, and
              you'll be good to go!
            </p>
          </div>
        </div>

        <div
          tabIndex={0}
          className="collapse collapse-plus border border-transparent bg-white shadow-md mb-4 p-6 rounded-xl hover:bg-gray-100 transition-all duration-300 ease-in-out"
        >
          <div className="collapse-title text-xl font-medium text-gray-700 flex items-center space-x-3">
            <span>Do I Need Any Special Skills to Participate?</span>
          </div>
          <div className="collapse-content text-gray-600 text-lg">
            <p>
              While specific skills may be required for certain projects, most
              of our projects are open to everyone. We value enthusiasm and a
              willingness to help!
            </p>
          </div>
        </div>

        <div
          tabIndex={0}
          className="collapse collapse-plus border border-transparent bg-white shadow-md mb-4 p-6 rounded-xl hover:bg-gray-100 transition-all duration-300 ease-in-out"
        >
          <div className="collapse-title text-xl font-medium text-gray-700 flex items-center space-x-3">
            <span>When and Where Do Projects Take Place?</span>
          </div>
          <div className="collapse-content text-gray-600 text-lg">
            <p>
              Each project has its own timeline and location, which you can find
              on the project page. Make sure to check for any updates!
            </p>
          </div>
        </div>

        <div
          tabIndex={0}
          className="collapse collapse-plus border border-transparent bg-white shadow-md mb-4 p-6 rounded-xl hover:bg-gray-100 transition-all duration-300 ease-in-out"
        >
          <div className="collapse-title text-xl font-medium text-gray-700 flex items-center space-x-3">
            <span>How Can I Get More Information About a Project?</span>
          </div>
          <div className="collapse-content text-gray-600 text-lg">
            <p>
              You can click on any active project to view detailed information.
              If you have further questions, feel free to contact the project
              organizer directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeFaq;
