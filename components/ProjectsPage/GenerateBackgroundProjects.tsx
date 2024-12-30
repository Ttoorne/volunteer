import first from "@/assets/events__bg_1.jpg";
import second from "@/assets/events__bg_2.jpeg";
import third from "@/assets/events__bg_3.png";

const GenerateBackgroundProjects = () => {
  const backgrounds = [first, second, third];

  // Случайный выбор изображения из массива
  const randomBackground =
    backgrounds[Math.floor(Math.random() * backgrounds.length)];

  return randomBackground;
};

export default GenerateBackgroundProjects;
