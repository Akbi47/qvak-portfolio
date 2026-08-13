import type { Locale } from "@/features/i18n/config";

type LocalizedText = Readonly<Record<Locale, string>>;

interface ProfileImage {
  src: string;
  width: number;
  height: number;
  alt: LocalizedText;
  focalPoint: string;
}

interface LocalizedProfileContent {
  role: LocalizedText;
  hero: {
    eyebrow: LocalizedText;
    title: LocalizedText;
    description: LocalizedText;
    aboutAction: LocalizedText;
  };
  about: {
    eyebrow: LocalizedText;
    heading: LocalizedText;
    intro: LocalizedText;
    description: LocalizedText;
  };
}

export interface PortfolioProfileView {
  name: string;
  shortName: string;
  role: string;
  githubUrl: string;
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    aboutAction: string;
    image: Omit<ProfileImage, "alt"> & { alt: string };
  };
  about: {
    eyebrow: string;
    heading: string;
    intro: string;
    description: string;
    portraits: ReadonlyArray<Omit<ProfileImage, "alt"> & { alt: string }>;
  };
}

export const portfolioProfile = {
  name: "Quach Vo Anh Khoa",
  shortName: "Khoa",
  githubUrl: "https://github.com/Akbi47",
  media: {
    hero: {
      src: "/images/profile/portrait-hero-banner.jpg",
      width: 852,
      height: 1280,
      focalPoint: "44% 42%",
      alt: {
        en: "Khoa in a patterned shirt, seated outdoors in profile",
        vi: "Khoa mặc áo họa tiết, ngồi ngoài trời và nhìn nghiêng",
      },
    },
    aboutPortraits: [
      {
        src: "/images/profile/portrait-slider-01.jpg",
        width: 734,
        height: 1280,
        focalPoint: "50% 43%",
        alt: {
          en: "Khoa wearing glasses while seated outdoors during the day",
          vi: "Khoa đeo kính, ngồi ngoài trời vào ban ngày",
        },
      },
      {
        src: "/images/profile/portrait-slider-02.jpg",
        width: 725,
        height: 1280,
        focalPoint: "50% 40%",
        alt: {
          en: "Khoa seated at an evening rooftop venue with the city behind him",
          vi: "Khoa ngồi tại một không gian sân thượng buổi tối với thành phố phía sau",
        },
      },
    ],
  },
} as const;

const localizedProfile = {
  role: {
    en: "Software engineer · Full-stack developer",
    vi: "Kỹ sư phần mềm · Lập trình viên full-stack",
  },
  hero: {
    eyebrow: {
      en: "Hello, I’m Khoa",
      vi: "Xin chào, mình là Khoa",
    },
    title: {
      en: "Building thoughtful digital experiences with clarity.",
      vi: "Kiến tạo trải nghiệm số chỉn chu và rõ ràng.",
    },
    description: {
      en: "I shape dependable web products where useful engineering and considered design work together.",
      vi: "Mình xây dựng các sản phẩm web đáng tin cậy, nơi kỹ thuật hữu ích song hành cùng thiết kế có chủ đích.",
    },
    aboutAction: {
      en: "Discover my story",
      vi: "Tìm hiểu về mình",
    },
  },
  about: {
    eyebrow: {
      en: "A little about me",
      vi: "Đôi nét về mình",
    },
    heading: {
      en: "Hi There",
      vi: "Xin chào",
    },
    intro: {
      en: "I am Khoa, a software engineer and full-stack developer who enjoys turning complex ideas into calm, useful experiences.",
      vi: "Mình là Khoa, một kỹ sư phần mềm và lập trình viên full-stack yêu thích việc biến những ý tưởng phức tạp thành trải nghiệm gần gũi, hữu ích.",
    },
    description: {
      en: "I care about the details behind a polished interface: resilient systems, accessible interactions, and decisions that keep products maintainable as they grow.",
      vi: "Mình chú trọng cả những chi tiết phía sau một giao diện hoàn thiện: hệ thống bền vững, tương tác dễ tiếp cận và những quyết định giúp sản phẩm dễ phát triển lâu dài.",
    },
  },
} satisfies LocalizedProfileContent;

export function getPortfolioProfile(locale: Locale): PortfolioProfileView {
  const content = localizedProfile;

  return {
    name: portfolioProfile.name,
    shortName: portfolioProfile.shortName,
    role: content.role[locale],
    githubUrl: portfolioProfile.githubUrl,
    hero: {
      eyebrow: content.hero.eyebrow[locale],
      title: content.hero.title[locale],
      description: content.hero.description[locale],
      aboutAction: content.hero.aboutAction[locale],
      image: {
        ...portfolioProfile.media.hero,
        alt: portfolioProfile.media.hero.alt[locale],
      },
    },
    about: {
      eyebrow: content.about.eyebrow[locale],
      heading: content.about.heading[locale],
      intro: content.about.intro[locale],
      description: content.about.description[locale],
      portraits: portfolioProfile.media.aboutPortraits.map((portrait) => ({
        ...portrait,
        alt: portrait.alt[locale],
      })),
    },
  };
}
