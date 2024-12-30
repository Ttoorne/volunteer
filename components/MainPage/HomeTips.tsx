const HomeTips = () => {
  return (
    <div className="p-4 sm:p-6 md:p-8 w-full max-w-4xl mx-auto min-h-[50vh]">
      <div className="space-y-4">
        <div className="collapse bg-white rounded-lg shadow-md p-3">
          <input type="checkbox" className="peer" />
          <div className="collapse-title flex items-center gap-3 text-sm sm:text-base font-medium text-gray-800 peer-checked:text-red-300">
            <span className="bg-red-400 text-white rounded-full h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center font-bold text-sm sm:text-base">
              1
            </span>
            Plan Your Time Effectively
          </div>
          <div className="collapse-content text-gray-600 text-sm sm:text-base md:text-lg">
            <p>
              Schedule your volunteering hours in advance to ensure you can
              balance it with your other commitments.
            </p>
          </div>
        </div>

        <div className="collapse bg-white rounded-lg shadow-md p-3">
          <input type="checkbox" className="peer" />
          <div className="collapse-title flex items-center gap-3 text-sm sm:text-base font-medium text-gray-800 peer-checked:text-red-300">
            <span className="bg-red-400 text-white rounded-full h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center font-bold text-sm sm:text-base">
              2
            </span>
            Learn Basic Skills
          </div>
          <div className="collapse-content text-gray-600 text-sm sm:text-base md:text-lg">
            <p>
              Familiarize yourself with common tasks, like organizing events,
              communicating with team members, or keeping records. Practice
              makes perfect.
            </p>
          </div>
        </div>

        <div className="collapse bg-white rounded-lg shadow-md p-3">
          <input type="checkbox" className="peer" />
          <div className="collapse-title flex items-center gap-3 text-sm sm:text-base font-medium text-gray-800 peer-checked:text-red-300">
            <span className="bg-red-400 text-white rounded-full h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center font-bold text-sm sm:text-base">
              3
            </span>
            Stay Informed
          </div>
          <div className="collapse-content text-gray-600 text-sm sm:text-base md:text-lg">
            <p>
              Regularly check for updates and stay informed about the latest
              opportunities and events related to volunteering.
            </p>
          </div>
        </div>

        <div className="collapse bg-white rounded-lg shadow-md p-3">
          <input type="checkbox" className="peer" />
          <div className="collapse-title flex items-center gap-3 text-sm sm:text-base font-medium text-gray-800 peer-checked:text-red-300">
            <span className="bg-red-400 text-white rounded-full h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center font-bold text-sm sm:text-base">
              4
            </span>
            Join a Community
          </div>
          <div className="collapse-content text-gray-600 text-sm sm:text-base md:text-lg">
            <p>
              Connect with fellow volunteers to share experiences and find
              inspiration for future projects.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeTips;
