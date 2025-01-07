interface FaqQuestion {
  number: number;
  title: string;
  description: string;
}

interface HomeFaqProps {
  translationFAQ: {
    title: string;
    questions: FaqQuestion[];
  };
}
const HomeFaq = ({ translationFAQ }: HomeFaqProps) => {
  return (
    <div className="p-10 space-y-5 relative">
      {/* Circle Effect */}
      <div className="absolute w-32 h-32 rounded-full bg-indigo-100 opacity-30 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 blur-3xl transition-all duration-300"></div>

      {/* FAQ Section */}
      <div className="space-y-4 sm:space-y-6 md:space-y-8">
        {translationFAQ.questions.map((faq) => (
          <div
            key={faq.number}
            tabIndex={0}
            className="collapse collapse-plus border border-transparent bg-white shadow-md mb-4 p-6 rounded-xl hover:bg-gray-100 transition-all duration-300 ease-in-out"
          >
            <div className="collapse-title text-xl font-medium text-gray-700 flex items-center space-x-3">
              <span>{faq.title}</span>
            </div>
            <div className="collapse-content text-gray-600 text-lg">
              <p>{faq.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeFaq;
