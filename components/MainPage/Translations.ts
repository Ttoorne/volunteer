// Main Page
export const mainPage_header = (
  token: string | null,
  loadingUser: boolean,
  userName?: string
): Record<"en" | "tr" | "ru", { welcome: string; description: string }> => ({
  en: {
    welcome:
      token && !loadingUser
        ? `Welcome back, ${userName}!`
        : `Welcome to Volunteer!`,
    description:
      token && !loadingUser
        ? `We are excited to have you here. Let's make the world a better place together through volunteering!`
        : `We are excited to have you here. Join us in making the world a better place through volunteering!`,
  },
  tr: {
    welcome:
      token && !loadingUser
        ? `Tekrar hoş geldiniz, ${userName}!`
        : `Volunteer'a hoş geldiniz!`,
    description:
      token && !loadingUser
        ? `Burada olduğunuz için çok mutluyuz. Haydi, gönüllülükle dünyayı daha güzel bir yer yapalım!`
        : `Burada olduğunuz için çok mutluyuz. Haydi, gönüllülükle dünyayı daha güzel bir yer yapalım!`,
  },
  ru: {
    welcome:
      token && !loadingUser
        ? `С возвращением, ${userName}!`
        : `Добро пожаловать на Volunteer!`,
    description:
      token && !loadingUser
        ? `Мы рады, что вы с нами. Давайте вместе сделаем мир лучше через волонтерство!`
        : `Мы рады, что вы с нами. Присоединяйтесь к нам, чтобы сделать мир лучше через волонтерство!`,
  },
});

export const mainPage_activeProjects = {
  en: {
    title: "Active Events",
    noProjects: "No active events at the moment.",
    checkLater: "Check back later for new opportunities.",
    viewAll: "View All Events",
  },
  ru: {
    title: "Активные события",
    noProjects: "В данный момент нет активных событий.",
    checkLater: "Проверьте позже для новых возможностей.",
    viewAll: "Посмотреть все события",
  },
  tr: {
    title: "Aktif Etkinlikler",
    noProjects: "Şu anda aktif etkinlik bulunmamaktadır.",
    checkLater: "Yeni fırsatlar için daha sonra tekrar kontrol edin.",
    viewAll: "Tüm Etkinlikleri Görüntüle",
  },
};

export const mainPage_upcomingEvents = {
  en: {
    title: "Upcoming Events",
    description:
      "Here you can view upcoming events and sign up for volunteering opportunities.",
  },
  ru: {
    title: "Предстоящие события",
    description:
      "Здесь вы можете ознакомиться с предстоящими событиями и записаться для участия.",
  },
  tr: {
    title: "Yaklaşan Etkinlikler",
    description:
      "Burada yaklaşan etkinlikleri görüntüleyebilir ve gönüllü fırsatlarına kaydolabilirsiniz.",
  },
};

// Main Page Tips
export const mainPage_volunteerTips = {
  en: {
    title: "Volunteer Tips",
    tips: [
      {
        number: 1,
        title: "Plan Your Time Effectively",
        description:
          "Schedule your volunteering hours in advance to ensure you can balance it with your other commitments.",
      },
      {
        number: 2,
        title: "Learn Basic Skills",
        description:
          "Familiarize yourself with common tasks, like organizing events, communicating with team members, or keeping records. Practice makes perfect.",
      },
      {
        number: 3,
        title: "Stay Informed",
        description:
          "Regularly check for updates and stay informed about the latest opportunities and events related to volunteering.",
      },
      {
        number: 4,
        title: "Join a Community",
        description:
          "Connect with fellow volunteers to share experiences and find inspiration for future projects.",
      },
    ],
  },
  ru: {
    title: "Советы для волонтеров",
    tips: [
      {
        number: 1,
        title: "Эффективно планируйте свое время",
        description:
          "Заранее планируйте свои волонтерские часы, чтобы успевать совмещать их с другими обязательствами.",
      },
      {
        number: 2,
        title: "Освойте основные навыки",
        description:
          "Познакомьтесь с типичными задачами, такими как организация мероприятий, общение с коллегами по команде или ведение записей. Практика — залог успеха.",
      },
      {
        number: 3,
        title: "Будьте в курсе событий",
        description:
          "Регулярно проверяйте обновления и будьте в курсе последних возможностей и событий, связанных с волонтерством.",
      },
      {
        number: 4,
        title: "Присоединяйтесь к сообществу",
        description:
          "Связывайтесь с другими волонтерами, чтобы обмениваться опытом и черпать вдохновение для будущих проектов.",
      },
    ],
  },
  tr: {
    title: "Gönüllü İpuçları",
    tips: [
      {
        number: 1,
        title: "Zamanınızı Etkili Planlayın",
        description:
          "Gönüllü saatlerinizi önceden planlayın, böylece diğer sorumluluklarınızla uyumlu bir şekilde zamanınızı dengeleyebilirsiniz.",
      },
      {
        number: 2,
        title: "Temel Becerileri Öğrenin",
        description:
          "Etkinlikleri düzenleme, ekip üyeleriyle iletişim kurma veya kayıt tutma gibi yaygın görevlerle tanışın. Pratik yapmak mükemmellik getirir.",
      },
      {
        number: 3,
        title: "Gelişmeleri Takip Edin",
        description:
          "Düzenli olarak güncellemeleri kontrol edin ve gönüllülükle ilgili en son fırsatlar ve etkinlikler hakkında bilgi sahibi olun.",
      },
      {
        number: 4,
        title: "Bir Topluluğa Katılın",
        description:
          "Diğer gönüllülerle bağlantı kurarak deneyimlerinizi paylaşın ve gelecekteki projeler için ilham alın.",
      },
    ],
  },
};

// Main Page Impact
export const mainPage_ImpactOverview = {
  // Impact Overview
  impactOverviewTitle: {
    en: "Impact Overview",
    ru: "Обзор воздействия",
    tr: "Etkililik Özeti",
  },

  // Volunteers in 2024
  volunteersIn2024: (volunteersCount: number) => ({
    en: `This year, we reached ${volunteersCount} volunteers contributing to various causes. Let's keep it up!`,
    ru: `В этом году мы привлекли ${volunteersCount} волонтеров, которые участвуют в различных проектах. Давайте продолжать!`,
    tr: `Bu yıl, çeşitli nedenlere katkı sağlayan ${volunteersCount} gönüllüye ulaştık. Hadi devam edelim!`,
  }),

  // Completed Projects
  completedProjects: (completedProjectsCount: number) => ({
    en: `We have successfully completed ${completedProjectsCount} projects so far. Together, we are making a difference!`,
    ru: `Мы успешно завершили ${completedProjectsCount} проектов. Вместе мы делаем изменения!`,
    tr: `Şimdiye kadar ${completedProjectsCount} projeyi başarıyla tamamladık. Birlikte fark yaratıyoruz!`,
  }),

  // Volunteers in 2024 Title
  volunteersIn2024Title: (volunteersCount: number) => ({
    en: `${volunteersCount} Volunteers in 2024`,
    ru: `${volunteersCount} волонтеров в 2024 году`,
    tr: `2024'te ${volunteersCount} Gönüllü`,
  }),

  // Completed Projects Title
  completedProjectsTitle: (completedProjectsCount: number) => ({
    en: `${completedProjectsCount} Completed Projects`,
    ru: `${completedProjectsCount} завершенных проектов`,
    tr: `${completedProjectsCount} Tamamlanmış Projeler`,
  }),
};

export const translationsImpact = (language: "en" | "ru" | "tr") => ({
  impactOverviewTitle: mainPage_ImpactOverview.impactOverviewTitle[language],
  volunteersIn2024: (volunteersCount: number) =>
    mainPage_ImpactOverview.volunteersIn2024(volunteersCount)[language],
  completedProjects: (completedProjectsCount: number) =>
    mainPage_ImpactOverview.completedProjects(completedProjectsCount)[language],
  volunteersIn2024Title: (volunteersCount: number) =>
    mainPage_ImpactOverview.volunteersIn2024Title(volunteersCount)[language],
  completedProjectsTitle: (completedProjectsCount: number) =>
    mainPage_ImpactOverview.completedProjectsTitle(completedProjectsCount)[
      language
    ],
});

// Main Page FAQ
export const mainPage_faq = {
  en: {
    title: "Frequently Asked Questions",
    questions: [
      {
        number: 1,
        title: "How Do I Join a Project?",
        description:
          "Simply browse our active projects, click on one that interests you, and sign up directly from the project page.",
      },
      {
        number: 2,
        title: "What Should I Bring?",
        description:
          "Bring a positive attitude and any required materials mentioned in the project description. We'll provide the rest!",
      },
      {
        number: 3,
        title: "How Do I Register for an Account?",
        description:
          "You can easily register by clicking the 'Sign Up' button on the homepage. Fill out the registration form with your details, and you'll be good to go!",
      },
      {
        number: 4,
        title: "Do I Need Any Special Skills to Participate?",
        description:
          "While specific skills may be required for certain projects, most of our projects are open to everyone. We value enthusiasm and a willingness to help!",
      },
      {
        number: 5,
        title: "When and Where Do Projects Take Place?",
        description:
          "Each project has its own timeline and location, which you can find on the project page. Make sure to check for any updates!",
      },
      {
        number: 6,
        title: "How Can I Get More Information About a Project?",
        description:
          "You can click on any active project to view detailed information. If you have further questions, feel free to contact the project organizer directly.",
      },
    ],
  },
  ru: {
    title: "Часто задаваемые вопросы",
    questions: [
      {
        number: 1,
        title: "Как присоединиться к проекту?",
        description:
          "Просто просматривайте наши активные проекты, выберите интересующий вас и зарегистрируйтесь напрямую на странице проекта.",
      },
      {
        number: 2,
        title: "Что мне нужно взять?",
        description:
          "Возьмите с собой положительное настроение и все необходимые материалы, указанные в описании проекта. Мы предоставим все остальное!",
      },
      {
        number: 3,
        title: "Как зарегистрироваться?",
        description:
          "Вы можете легко зарегистрироваться, нажав кнопку 'Зарегистрироваться' на главной странице. Заполните регистрационную форму, и вы готовы начать!",
      },
      {
        number: 4,
        title: "Нужны ли мне специальные навыки для участия?",
        description:
          "Некоторые проекты могут требовать определенных навыков, но большинство наших проектов открыты для всех. Мы ценим энтузиазм и готовность помогать!",
      },
      {
        number: 5,
        title: "Когда и где проходят проекты?",
        description:
          "У каждого проекта есть свой график и место проведения, которые можно найти на странице проекта. Обязательно следите за обновлениями!",
      },
      {
        number: 6,
        title: "Как получить больше информации о проекте?",
        description:
          "Вы можете кликнуть по любому активному проекту, чтобы просмотреть подробную информацию. Если у вас есть дополнительные вопросы, не стесняйтесь связаться с организатором проекта напрямую.",
      },
    ],
  },
  tr: {
    title: "Sıkça Sorulan Sorular",
    questions: [
      {
        number: 1,
        title: "Bir Projeye Nasıl Katılabilirim?",
        description:
          "Aktif projelerimizi gözden geçirin, ilginizi çeken birine tıklayın ve projeden doğrudan kaydolun.",
      },
      {
        number: 2,
        title: "Ne Getirmeliyim?",
        description:
          "Pozitif bir tutum ve proje açıklamasında belirtilen gerekli malzemeleri getirin. Geri kalanını biz temin edeceğiz!",
      },
      {
        number: 3,
        title: "Hesap Nasıl Kaydolurum?",
        description:
          "Ana sayfada 'Kayıt Ol' butonuna tıklayarak kolayca kaydolabilirsiniz. Kayıt formunu doldurun ve hazırsınız!",
      },
      {
        number: 4,
        title: "Katılmak İçin Özel Bir Yetenek Gerekli mi?",
        description:
          "Bazı projeler özel beceriler gerektirebilir, ancak çoğu projemiz herkese açıktır. Heyecanı ve yardım etmeye istekliyi değerlendiriyoruz!",
      },
      {
        number: 5,
        title: "Projeler Ne Zaman ve Nerede Gerçekleşiyor?",
        description:
          "Her projenin kendine ait bir takvimi ve yeri vardır, bunları proje sayfasında bulabilirsiniz. Güncellemeler için kontrol ettiğinizden emin olun!",
      },
      {
        number: 6,
        title: "Bir Proje Hakkında Daha Fazla Bilgi Nasıl Alabilirim?",
        description:
          "Herhangi bir aktif projeye tıklayarak detaylı bilgileri görebilirsiniz. Daha fazla sorunuz varsa, proje organizatörüyle doğrudan iletişime geçebilirsiniz.",
      },
    ],
  },
};

// Main Page Footer
export const mainPage_footer = {
  en: {
    readyToMakeADifference: "Ready to Make a Difference?",
    joinUsText:
      "Join us today and start volunteering! Your time and effort can change lives.",
    makeADifferenceButton: "Make a Difference!",
    joinAsVolunteerButton: "Join as a Volunteer",
  },
  ru: {
    readyToMakeADifference: "Готовы изменить мир?",
    joinUsText:
      "Присоединяйтесь к нам сегодня и начинайте волонтерить! Ваше время и усилия могут изменить жизни.",
    makeADifferenceButton: "Сделать разницу!",
    joinAsVolunteerButton: "Присоединиться как волонтер",
  },
  tr: {
    readyToMakeADifference: "Fark Yaratmaya Hazır Mısınız?",
    joinUsText:
      "Bugün bize katılın ve gönüllü olmaya başlayın! Zamanınız ve çabanız hayatları değiştirebilir.",
    makeADifferenceButton: "Fark Yaratın!",
    joinAsVolunteerButton: "Gönüllü Olarak Katıl",
  },
};

// Main Page Projects Card
export const mainPage_Card = {
  en: {
    noImageText: "No Image",
    startText: "Start:",
    endText: "End:",
    locationText: "Location:",
    inProgressText: "IN PROGRESS",
    openText: "OPEN",
    completedText: "COMPLETED",
    watchEventText: "Watch Event",
  },
  ru: {
    noImageText: "Нет изображения",
    startText: "Начало:",
    endText: "Конец:",
    locationText: "Местоположение:",
    inProgressText: "В ПРОЦЕССЕ",
    openText: "ОТКРЫТ",
    completedText: "ЗАВЕРШЕНО",
    watchEventText: "Посмотреть событие",
  },
  tr: {
    noImageText: "Resim Yok",
    startText: "Başlangıç:",
    endText: "Bitiş:",
    locationText: "Konum:",
    inProgressText: "DEVAM EDİYOR",
    openText: "AÇIK",
    completedText: "TAMAMLANDI",
    watchEventText: "Etkinliği İzle",
  },
};

// Main Page Calendar
export const mainPage_Calendar = {
  en: {
    eventsOnSelectedDateText: "Events on",
    upcomingEventsText: "Upcoming Events",
    noEventsOnSelectedDateText: "No events on this day",
    allUpcomingEventsText: "All Upcoming Events",
    noUpcomingEventsText: "At the moment, there are no upcoming events",
    viewMoreText: "View More",
  },
  ru: {
    eventsOnSelectedDateText: "События на",
    upcomingEventsText: "Предстоящие события",
    noEventsOnSelectedDateText: "Нет событий в этот день",
    allUpcomingEventsText: "Все предстоящие события",
    noUpcomingEventsText: "На данный момент нет предстоящих событий",
    viewMoreText: "Посмотреть больше",
  },
  tr: {
    eventsOnSelectedDateText: "Seçilen tarihteki etkinlikler",
    upcomingEventsText: "Yaklaşan Etkinlikler",
    noEventsOnSelectedDateText: "Bu günde etkinlik yok",
    allUpcomingEventsText: "Tüm Yaklaşan Etkinlikler",
    noUpcomingEventsText: "Şu anda yaklaşan etkinlik yok",
    viewMoreText: "Daha Fazla Gör",
  },
};
