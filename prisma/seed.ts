import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import slugify from "slugify";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL ?? "admin@fgs-software.com";
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD ?? "ChangeMe123!Secure";
  const hashed = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashed,
      name: "FGS Admin",
    },
  });

  const settings: { key: string; value: string }[] = [
    { key: "company_name", value: "FGS Software" },
    { key: "admin_email", value: process.env.ADMIN_EMAIL ?? "contact@fgs-software.com" },
    { key: "admin_email_cc", value: "" },
    { key: "address", value: "Da Nang, Vietnam" },
    { key: "phone", value: "+84 xxx xxx xxx" },
    { key: "facebook_url", value: "" },
    { key: "linkedin_url", value: "https://linkedin.com/company/fgs-software" },
    { key: "github_url", value: "" },
    { key: "ga_id", value: process.env.NEXT_PUBLIC_GA_ID ?? "" },
    { key: "meta_title", value: "FGS Software — IT Outsourcing Partner" },
    { key: "meta_description", value: "FGS Software delivers high-quality software development for Japanese businesses from Vietnam." },
    { key: "working_hours", value: "Mon–Fri 9:00–18:00 (ICT)" },
    { key: "hero_headline", value: "Your Trusted IT Outsourcing Partner in Vietnam" },
    { key: "hero_headline_ja", value: "ベトナムの信頼できるITアウトソーシングパートナー" },
    { key: "hero_headline_vi", value: "Đối tác Outsourcing IT đáng tin cậy tại Việt Nam" },
    { key: "hero_subheadline", value: "We build high-quality software for Japanese businesses" },
    { key: "hero_subheadline_ja", value: "日本企業向けに高品質なソフトウェアを開発します" },
    { key: "hero_subheadline_vi", value: "Chúng tôi phát triển phần mềm chất lượng cao cho doanh nghiệp Nhật Bản" },
    { key: "chatbot_enabled", value: "true" },
    { key: "chatbot_name", value: "Nova" },
    { key: "chatbot_name_ja", value: "ノヴァ" },
    { key: "chatbot_name_vi", value: "Nova" },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  const statCount = await prisma.stat.count();
  if (statCount === 0) {
    await prisma.stat.createMany({
      data: [
        { label: "Years of Experience", labelJa: "年の経験", labelVi: "Năm kinh nghiệm", value: "8", suffix: "+", order: 1 },
        { label: "Projects Delivered", labelJa: "完了プロジェクト", labelVi: "Dự án hoàn thành", value: "50", suffix: "+", order: 2 },
        { label: "Happy Clients", labelJa: "満足したクライアント", labelVi: "Khách hàng hài lòng", value: "30", suffix: "+", order: 3 },
        { label: "Technologies", labelJa: "技術スタック", labelVi: "Công nghệ", value: "20", suffix: "+", order: 4 },
      ],
    });
  }

  const whyCount = await prisma.whyChooseUs.count();
  if (whyCount === 0) {
    await prisma.whyChooseUs.createMany({
      data: [
        {
          icon: "Globe",
          title: "Japan Market Experience",
          titleJa: "日本市場の経験",
          titleVi: "Kinh nghiệm thị trường Nhật",
          description: "Deep understanding of Japanese business culture, quality standards, and communication style.",
          descriptionJa: "日本のビジネス文化、品質基準、コミュニケーションスタイルへの深い理解。",
          descriptionVi: "Hiểu sâu văn hóa kinh doanh, tiêu chuẩn chất lượng và phong cách giao tiếp của Nhật Bản.",
          order: 1,
        },
        {
          icon: "Shield",
          title: "Quality Assurance",
          titleJa: "品質保証",
          titleVi: "Đảm bảo chất lượng",
          description: "Rigorous code review, testing practices, and documentation for every deliverable.",
          descriptionJa: "厳格なコードレビュー、テスト、ドキュメント。",
          descriptionVi: "Review code, kiểm thử và tài liệu kỹ lưỡng cho mọi deliverable.",
          order: 2,
        },
        {
          icon: "MessageCircle",
          title: "Clear Communication",
          titleJa: "明確なコミュニケーション",
          titleVi: "Giao tiếp rõ ràng",
          description: "Daily standups, progress reports in Japanese or English, and responsive support.",
          descriptionJa: "デイリースタンドアップ、日本語・英語の進捗報告。",
          descriptionVi: "Standup hàng ngày, báo cáo tiến độ bằng tiếng Nhật hoặc Anh.",
          order: 3,
        },
        {
          icon: "Zap",
          title: "Flexible Engagement",
          titleJa: "柔軟な契約形態",
          titleVi: "Hợp tác linh hoạt",
          description: "Dedicated team, staff augmentation, or project-based — tailored to your needs.",
          descriptionJa: "専任チーム、人材派遣、プロジェクトベースに対応。",
          descriptionVi: "Team chuyên trách, bổ sung nhân sự hoặc theo dự án — tùy nhu cầu.",
          order: 4,
        },
      ],
    });
  }

  const serviceCount = await prisma.service.count();
  if (serviceCount === 0) {
    await prisma.service.createMany({
      data: [
        {
          icon: "Globe",
          title: "Web Application Development",
          titleJa: "Webアプリケーション開発",
          titleVi: "Phát triển Web Application",
          description: "Custom web applications built with modern frameworks and best practices.",
          descriptionJa: "最新フレームワークとベストプラクティスによるカスタムWebアプリ。",
          descriptionVi: "Ứng dụng web tùy chỉnh với framework hiện đại và best practices.",
          techStack: ["React", "Next.js", "Vue.js", "Node.js"],
          order: 1,
        },
        {
          icon: "Smartphone",
          title: "Mobile App Development",
          titleJa: "モバイルアプリ開発",
          titleVi: "Phát triển Mobile App",
          description: "Native and cross-platform mobile apps for iOS and Android.",
          descriptionJa: "iOS・Android向けネイティブ・クロスプラットフォームアプリ。",
          descriptionVi: "Ứng dụng mobile native và cross-platform cho iOS và Android.",
          techStack: ["React Native", "Flutter", "Swift", "Kotlin"],
          order: 2,
        },
        {
          icon: "Plug",
          title: "API Development & Integration",
          titleJa: "API開発・連携",
          titleVi: "Phát triển & Tích hợp API",
          description: "RESTful APIs, GraphQL, and third-party system integrations.",
          descriptionJa: "REST API、GraphQL、サードパーティ連携。",
          descriptionVi: "REST API, GraphQL và tích hợp hệ thống bên thứ ba.",
          techStack: ["REST", "GraphQL", "PostgreSQL", "Redis"],
          order: 3,
        },
        {
          icon: "Palette",
          title: "UI/UX Design",
          titleJa: "UI/UXデザイン",
          titleVi: "Thiết kế UI/UX",
          description: "User-centered design, prototypes, and usability testing.",
          descriptionJa: "ユーザー中心設計、プロトタイプ、ユーザビリティテスト。",
          descriptionVi: "Thiết kế lấy người dùng làm trung tâm, prototype và usability testing.",
          techStack: ["Figma", "Adobe XD", "Prototyping"],
          order: 4,
        },
        {
          icon: "Search",
          title: "Code Review & Consulting",
          titleJa: "コードレビュー・コンサル",
          titleVi: "Review Code & Tư vấn",
          description: "Architecture review, code quality audits, and technical advisory.",
          descriptionJa: "アーキテクチャレビュー、コード品質監査、技術アドバイザリー。",
          descriptionVi: "Review kiến trúc, audit chất lượng code và tư vấn kỹ thuật.",
          techStack: ["Architecture", "Security", "Performance"],
          order: 5,
        },
        {
          icon: "Wrench",
          title: "Maintenance & Support",
          titleJa: "保守・サポート",
          titleVi: "Bảo trì & Hỗ trợ",
          description: "Ongoing maintenance, bug fixes, and system upgrades.",
          descriptionJa: "継続的な保守、バグ修正、システムアップグレード。",
          descriptionVi: "Bảo trì liên tục, sửa lỗi và nâng cấp hệ thống.",
          techStack: ["DevOps", "Monitoring", "CI/CD"],
          order: 6,
        },
      ],
    });
  }

  const techCount = await prisma.techStack.count();
  if (techCount === 0) {
    const techs = [
      { name: "React", category: "frontend" },
      { name: "Next.js", category: "frontend" },
      { name: "Vue.js", category: "frontend" },
      { name: "TypeScript", category: "frontend" },
      { name: "Node.js", category: "backend" },
      { name: "Python", category: "backend" },
      { name: "Java", category: "backend" },
      { name: "PostgreSQL", category: "database" },
      { name: "MongoDB", category: "database" },
      { name: "React Native", category: "mobile" },
      { name: "Flutter", category: "mobile" },
      { name: "Docker", category: "devops" },
      { name: "AWS", category: "devops" },
      { name: "Git", category: "tools" },
      { name: "Figma", category: "tools" },
    ];
    await prisma.techStack.createMany({
      data: techs.map((t, i) => ({ ...t, order: i + 1 })),
    });
  }

  const aboutCount = await prisma.aboutContent.count();
  if (aboutCount === 0) {
    await prisma.aboutContent.createMany({
      data: [
        {
          section: "history",
          title: "Our Story",
          titleJa: "私たちの歩み",
          titleVi: "Câu chuyện của chúng tôi",
          content: "FGS Software was founded with a mission to bridge Vietnamese engineering talent with Japanese businesses seeking reliable, high-quality software partners.",
          contentJa: "FGS Softwareは、ベトナムのエンジニアリング人材と、信頼できる高品質なソフトウェアパートナーを求める日本企業をつなぐ使命で設立されました。",
          contentVi: "FGS Software được thành lập với sứ mệnh kết nối đội ngũ kỹ sư Việt Nam với doanh nghiệp Nhật Bản cần đối tác phần mềm đáng tin cậy.",
        },
        {
          section: "mission",
          title: "Mission",
          titleJa: "ミッション",
          titleVi: "Sứ mệnh",
          content: "Deliver exceptional software solutions that help our clients succeed in the digital economy.",
          contentJa: "お客様のデジタル経済での成功を支援する卓越したソフトウェアソリューションを提供する。",
          contentVi: "Cung cấp giải pháp phần mềm xuất sắc giúp khách hàng thành công trong nền kinh tế số.",
        },
        {
          section: "vision",
          title: "Vision",
          titleJa: "ビジョン",
          titleVi: "Tầm nhìn",
          content: "To be the most trusted IT outsourcing partner for Japanese companies in Southeast Asia.",
          contentJa: "東南アジアで日本企業に最も信頼されるITアウトソーシングパートナーになる。",
          contentVi: "Trở thành đối tác outsourcing IT đáng tin cậy nhất cho doanh nghiệp Nhật Bản tại Đông Nam Á.",
        },
      ],
    });
  }

  const teamCount = await prisma.teamMember.count();
  if (teamCount === 0) {
    await prisma.teamMember.create({
      data: {
        name: "Sample Member",
        role: "Senior Full-Stack Developer",
        roleJa: "シニアフルスタック開発者",
        roleVi: "Lập trình viên Full-Stack Senior",
        bio: "Experienced developer specializing in web and mobile applications for Japanese clients.",
        bioJa: "日本のクライアント向けWeb・モバイルアプリを専門とする経験豊富な開発者。",
        bioVi: "Lập trình viên giàu kinh nghiệm chuyên ứng dụng web và mobile cho khách hàng Nhật.",
        experience: 8,
        skills: ["TypeScript", "React", "Node.js", "PostgreSQL"],
        order: 1,
        featured: true,
        isVisible: true,
      },
    });
  }

  const workCount = await prisma.work.count();
  if (workCount === 0) {
    await prisma.work.create({
      data: {
        title: "E-Commerce Platform",
        titleJa: "ECプラットフォーム",
        titleVi: "Nền tảng Thương mại điện tử",
        slug: slugify("E-Commerce Platform", { lower: true, strict: true }),
        summary: "Full-stack e-commerce solution for a Japanese retail client.",
        summaryJa: "日本の小売クライアント向けフルスタックECソリューション。",
        summaryVi: "Giải pháp thương mại điện tử full-stack cho khách hàng bán lẻ Nhật Bản.",
        description: "## Challenge\nThe client needed a scalable online store with Japanese payment integration.\n\n## Solution\nBuilt with Next.js, PostgreSQL, and Stripe-compatible payment flow.\n\n## Result\n40% increase in online sales within 6 months.",
        descriptionJa: "## 課題\n日本の決済連携が必要なスケーラブルなオンラインストア。\n\n## 解決策\nNext.js、PostgreSQL、決済フローで構築。\n\n## 結果\n6ヶ月でオンライン売上40%増。",
        descriptionVi: "## Thách thức\nCần cửa hàng trực tuyến có tích hợp thanh toán Nhật Bản.\n\n## Giải pháp\nXây dựng với Next.js, PostgreSQL và luồng thanh toán.\n\n## Kết quả\nTăng 40% doanh số online sau 6 tháng.",
        techStack: ["Next.js", "PostgreSQL", "Stripe", "Tailwind CSS"],
        category: "web",
        duration: "6 months",
        order: 1,
        featured: true,
        isVisible: true,
      },
    });
  }

  const timelineCount = await prisma.timelineMilestone.count();
  if (timelineCount === 0) {
    await prisma.timelineMilestone.createMany({
      data: [
        {
          milestoneDate: "2026-05",
          title: "Company Founded — Da Nang HQ",
          titleJa: "会社設立 — ダナン本社",
          titleVi: "Thành lập công ty — Trụ sở Đà Nẵng",
          description:
            "FGS Software officially established with headquarters in Da Nang, Vietnam, beginning our mission to serve Japanese and global clients.",
          descriptionJa: "ベトナム・ダナンに本社を置き、FGS Software を設立。日本およびグローバル向けサービスを開始。",
          descriptionVi:
            "FGS Software chính thức thành lập với trụ sở tại Đà Nẵng, bắt đầu sứ mệnh phục vụ khách hàng Nhật Bản và quốc tế.",
          order: 1,
        },
        {
          milestoneDate: "2026-08",
          title: "First Japanese Client Projects",
          titleJa: "初の日本企業プロジェクト",
          titleVi: "Dự án khách hàng Nhật đầu tiên",
          description: "Delivered first outsourcing projects for Japanese enterprises with dedicated engineering teams.",
          descriptionJa: "専任エンジニアチームで初の日本企業向けアウトソーシングプロジェクトを納品。",
          descriptionVi: "Hoàn thành các dự án outsourcing đầu tiên cho doanh nghiệp Nhật Bản với team kỹ sư chuyên trách.",
          order: 2,
        },
        {
          milestoneDate: "2026-11",
          title: "Expanded Service Portfolio",
          titleJa: "サービス拡充",
          titleVi: "Mở rộng danh mục dịch vụ",
          description: "Added web, mobile, API integration, and AI-assisted solutions to our core offerings.",
          descriptionJa: "Web・モバイル・API連携・AI支援ソリューションをコアサービスに追加。",
          descriptionVi: "Bổ sung web, mobile, tích hợp API và giải pháp hỗ trợ AI vào dịch vụ cốt lõi.",
          order: 3,
        },
        {
          milestoneDate: "2027-03",
          title: "Regional Partnership Growth",
          titleJa: "地域パートナー拡大",
          titleVi: "Mở rộng đối tác khu vực",
          description: "Built strategic partnerships across APAC to scale delivery capacity and client success.",
          descriptionJa: "APAC地域で戦略的パートナーシップを構築し、提供体制を強化。",
          descriptionVi: "Thiết lập quan hệ đối tác chiến lược tại APAC để mở rộng năng lực triển khai.",
          order: 4,
        },
      ],
    });
  } else {
    const extraMilestones = [
      {
        milestoneDate: "2026-08",
        title: "First Japanese Client Projects",
        titleJa: "初の日本企業プロジェクト",
        titleVi: "Dự án khách hàng Nhật đầu tiên",
        description: "Delivered first outsourcing projects for Japanese enterprises with dedicated engineering teams.",
        descriptionJa: "専任エンジニアチームで初の日本企業向けアウトソーシングプロジェクトを納品。",
        descriptionVi: "Hoàn thành các dự án outsourcing đầu tiên cho doanh nghiệp Nhật Bản với team kỹ sư chuyên trách.",
        order: 2,
      },
      {
        milestoneDate: "2026-11",
        title: "Expanded Service Portfolio",
        titleJa: "サービス拡充",
        titleVi: "Mở rộng danh mục dịch vụ",
        description: "Added web, mobile, API integration, and AI-assisted solutions to our core offerings.",
        descriptionJa: "Web・モバイル・API連携・AI支援ソリューションをコアサービスに追加。",
        descriptionVi: "Bổ sung web, mobile, tích hợp API và giải pháp hỗ trợ AI vào dịch vụ cốt lõi.",
        order: 3,
      },
      {
        milestoneDate: "2027-03",
        title: "Regional Partnership Growth",
        titleJa: "地域パートナー拡大",
        titleVi: "Mở rộng đối tác khu vực",
        description: "Built strategic partnerships across APAC to scale delivery capacity and client success.",
        descriptionJa: "APAC地域で戦略的パートナーシップを構築し、提供体制を強化。",
        descriptionVi: "Thiết lập quan hệ đối tác chiến lược tại APAC để mở rộng năng lực triển khai.",
        order: 4,
      },
    ];
    for (const m of extraMilestones) {
      const exists = await prisma.timelineMilestone.findFirst({
        where: { milestoneDate: m.milestoneDate },
      });
      if (!exists) await prisma.timelineMilestone.create({ data: m });
    }
  }

  const coreValueCount = await prisma.coreValue.count();
  if (coreValueCount === 0) {
    await prisma.coreValue.createMany({
      data: [
        {
          icon: "Heart",
          title: "Quality First",
          titleJa: "品質第一",
          titleVi: "Chất lượng là trên hết",
          description: "We deliver software that meets rigorous standards expected by Japanese enterprises.",
          descriptionJa: "日本企業が求める厳格な品質基準を満たすソフトウェアを提供します。",
          descriptionVi: "Chúng tôi giao phần mềm đạt tiêu chuẩn khắt khe mà doanh nghiệp Nhật Bản yêu cầu.",
          order: 1,
        },
        {
          icon: "Users",
          title: "Partnership",
          titleJa: "パートナーシップ",
          titleVi: "Đồng hành",
          description: "Long-term collaboration built on trust, transparency, and shared success.",
          descriptionJa: "信頼・透明性・共有の成功に基づく長期的な協業。",
          descriptionVi: "Hợp tác lâu dài dựa trên tin cậy, minh bạch và thành công chung.",
          order: 2,
        },
        {
          icon: "Lightbulb",
          title: "Innovation",
          titleJa: "イノベーション",
          titleVi: "Đổi mới",
          description: "Modern technologies and continuous improvement in every project.",
          descriptionJa: "最新技術と継続的な改善をすべてのプロジェクトに。",
          descriptionVi: "Công nghệ hiện đại và cải tiến liên tục trong mọi dự án.",
          order: 3,
        },
      ],
    });
  }

  const branchCount = await prisma.companyBranch.count();
  if (branchCount === 0) {
    await prisma.companyBranch.create({
      data: {
        name: "FGS Software HQ",
        nameJa: "FGS Software 本社",
        nameVi: "Trụ sở FGS Software",
        city: "Da Nang",
        cityJa: "ダナン",
        cityVi: "Đà Nẵng",
        address: "Da Nang, Vietnam",
        addressJa: "ベトナム・ダナン",
        addressVi: "Đà Nẵng, Việt Nam",
        latitude: 16.0544,
        longitude: 108.2022,
        isHeadquarters: true,
        order: 1,
      },
    });
  }

  const founderCount = await prisma.founder.count();
  if (founderCount === 0) {
    await prisma.founder.create({
      data: {
        name: "Founder Name",
        role: "Co-Founder & CEO",
        roleJa: "共同創業者・CEO",
        roleVi: "Đồng sáng lập & CEO",
        slogan: "Building trust through quality software.",
        sloganJa: "品質のソフトウェアで信頼を築く。",
        sloganVi: "Xây dựng niềm tin qua phần mềm chất lượng.",
        order: 1,
      },
    });
  }

  const partnerCount = await prisma.partner.count();
  if (partnerCount === 0) {
    await prisma.partner.createMany({
      data: [
        { name: "Partner A", nameJa: "パートナーA", nameVi: "Đối tác A", order: 1, isVisible: true },
        { name: "Partner B", nameJa: "パートナーB", nameVi: "Đối tác B", order: 2, isVisible: true },
        { name: "Partner C", nameJa: "パートナーC", nameVi: "Đối tác C", order: 3, isVisible: true },
      ],
    });
  }

  const extraSettings: { key: string; value: string }[] = [
    { key: "map_latitude", value: "16.0544" },
    { key: "map_longitude", value: "108.2022" },
    { key: "google_maps_embed_url", value: "" },
    { key: "theme_default", value: "light" },
    { key: "font_family", value: "inter" },
    { key: "font_weight", value: "normal" },
    { key: "theme_primary_color", value: "#2563eb" },
    { key: "theme_radius", value: "1rem" },
    { key: "locale_enabled_en", value: "true" },
    { key: "locale_enabled_ja", value: "true" },
    { key: "locale_enabled_vi", value: "true" },
  ];
  for (const s of extraSettings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }

  console.log("Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
