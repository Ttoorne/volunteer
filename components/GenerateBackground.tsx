import fajr from "@/assets/one-project__background_1.jpg";
import dzuhr from "@/assets/one-project__background_2.jpg";
import asr from "@/assets/one-project__background_4.jpg";
import sham from "@/assets/one-project__background_3.jpg";
import isha from "@/assets/one-project__background_5.jpg";

const GenerateBackground = () => {
  const currentHour = new Date().getHours();

  let background = fajr;

  if (currentHour >= 5 && currentHour < 12) {
    background = fajr; // Фон для Fajr (5:00 - 12:00)
  } else if (currentHour >= 12 && currentHour < 15) {
    background = dzuhr; // Фон для Dzuhr (12:00 - 15:00)
  } else if (currentHour >= 15 && currentHour < 18) {
    background = asr; // Фон для Asr (15:00 - 18:00)
  } else if (currentHour >= 18 && currentHour < 19) {
    background = sham; // Фон для Sham (18:00 - 19:00)
  } else {
    background = isha; // Фон для Isha (19:00 - 5:00)
  }

  return dzuhr;
};

export default GenerateBackground;
