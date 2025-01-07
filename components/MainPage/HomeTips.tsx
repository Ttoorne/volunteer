type TranslationTipsType = {
  tips: Array<{
    number: number;
    title: string;
    description: string;
  }>;
};

type HomeTipsProps = {
  translationTips: TranslationTipsType;
};

const HomeTips = ({ translationTips }: HomeTipsProps) => {
  return (
    <div className="p-4 sm:p-6 md:p-8 w-full max-w-4xl mx-auto min-h-[50vh]">
      <div className="space-y-4">
        {translationTips.tips.map((tip) => (
          <div
            key={tip.number}
            className="collapse bg-white rounded-lg shadow-md p-3"
          >
            <input type="checkbox" className="peer" />
            <div className="collapse-title flex items-center gap-3 text-sm sm:text-base font-medium text-gray-800 peer-checked:text-red-300">
              <span className="bg-red-400 text-white rounded-full h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center font-bold text-sm sm:text-base">
                {tip.number}
              </span>
              {tip.title}
            </div>
            <div className="collapse-content text-gray-600 text-sm sm:text-base md:text-lg">
              <p>{tip.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeTips;
