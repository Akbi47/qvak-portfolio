import type { PortfolioMessages } from "@/features/i18n/messages/types";

const messages = {
  metadata: {
    title: "Quách Võ Anh Khoa",
    description: "Nền tảng portfolio của Quách Võ Anh Khoa.",
  },
  localeSwitcher: {
    label: "Đổi ngôn ngữ",
    currentLanguage: "Ngôn ngữ hiện tại",
    english: "English",
    vietnamese: "Tiếng Việt",
  },
  header: {
    primaryNavigation: "Các phần portfolio",
    homeAction: "Đi đến Trang chủ",
    openMenu: "Mở trình đơn điều hướng",
    closeMenu: "Đóng trình đơn điều hướng",
    github: "Mở hồ sơ GitHub",
    sections: {
      home: "Trang chủ",
      about: "Giới thiệu",
      skills: "Kỹ năng",
      projects: "Dự án",
      resume: "Hồ sơ",
      contact: "Liên hệ",
    },
  },
  themeToggle: {
    toggle: "Chuyển giao diện màu",
    switchToLight: "Chuyển sang giao diện sáng",
    switchToDark: "Chuyển sang giao diện tối",
  },
  foundation: {
    eyebrow: "Nền tảng portfolio",
    title: "Một khung nền rõ ràng cho hành trình phía trước.",
    description:
      "Hệ thống thiết kế và khung trang dùng chung đã sẵn sàng cho các phần nội dung portfolio.",
    items: [
      {
        id: "responsive",
        title: "Responsive ngay từ đầu",
        description:
          "Container dùng chung thích ứng từ thiết bị di động đến màn hình rộng.",
      },
      {
        id: "visual-language",
        title: "Một ngôn ngữ thiết kế",
        description:
          "Token ngữ nghĩa giúp các phần sau này đồng nhất và dễ bảo trì.",
      },
      {
        id: "motion",
        title: "Chuyển động có chủ đích",
        description:
          "Nền tảng tôn trọng tùy chọn giảm chuyển động ngay từ đầu.",
      },
    ],
  },
} satisfies PortfolioMessages;

export default messages;
