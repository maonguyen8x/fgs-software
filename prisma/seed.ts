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
    update: { role: "super_admin", isActive: true, password: hashed },
    create: {
      email: adminEmail,
      password: hashed,
      name: "FGS Admin",
      role: "super_admin",
      isActive: true,
    },
  });

  const settings: { key: string; value: string }[] = [
    { key: "company_name", value: "FGS Software" },
    { key: "admin_email", value: process.env.ADMIN_EMAIL ?? "contact.fgssoftware@gmail.com" },
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
    { key: "hero_headline", value: "" },
    { key: "hero_headline_ja", value: "" },
    { key: "hero_headline_vi", value: "" },
    { key: "hero_subheadline", value: "" },
    { key: "hero_subheadline_ja", value: "" },
    { key: "hero_subheadline_vi", value: "" },
    { key: "hero_typewriter_enabled", value: "true" },
    { key: "site_tagline", value: "We help businesses develop products and optimize operations through technology" },
    { key: "site_tagline_ja", value: "" },
    { key: "site_tagline_vi", value: "Chúng tôi giúp doanh nghiệp phát triển sản phẩm và tối ưu vận hành bằng công nghệ" },
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

  const capabilityServices = [
    {
      icon: "Blocks",
      title: "Web3.0",
      titleJa: "Web3.0",
      titleVi: "Web3.0",
      description: "Build connected applications with wallet-aware experiences, decentralized identity, and thoughtful on-chain integrations.",
      descriptionJa: "ウォレット連携、分散型ID、オンチェーン連携を取り入れたアプリケーションを開発します。",
      descriptionVi: "Xây dựng ứng dụng kết nối với ví điện tử, định danh phi tập trung và các tích hợp on-chain phù hợp.",
      techStack: ["Wallet integration", "Decentralized identity", "Smart contracts"],
    },
    {
      icon: "Link2",
      title: "Blockchain",
      titleJa: "ブロックチェーン",
      titleVi: "Blockchain",
      description: "Design and integrate blockchain services, smart-contract workflows, and dependable data interfaces.",
      descriptionJa: "ブロックチェーンサービスやスマートコントラクトのワークフロー、信頼性の高いデータ連携を設計・実装します。",
      descriptionVi: "Thiết kế và tích hợp dịch vụ blockchain, quy trình smart contract cùng giao diện dữ liệu đáng tin cậy.",
      techStack: ["Smart contracts", "Web3", "Distributed systems"],
    },
    {
      icon: "Landmark",
      title: "Digital Banking",
      titleJa: "デジタルバンキング",
      titleVi: "Ngân hàng số",
      description: "Create accessible digital banking experiences with secure account journeys, payment flows, and operational tools.",
      descriptionJa: "安全な口座利用、決済フロー、業務ツールを備えた使いやすいデジタルバンキング体験をつくります。",
      descriptionVi: "Tạo trải nghiệm ngân hàng số dễ tiếp cận với luồng tài khoản, thanh toán và công cụ vận hành an toàn.",
      techStack: ["Account services", "Payment flows", "Security"],
    },
    {
      icon: "WalletCards",
      title: "FinApps & FinTech",
      titleJa: "金融アプリ・FinTech",
      titleVi: "FinApps & FinTech",
      description: "Develop financial applications that connect users, transactions, and business operations in one clear experience.",
      descriptionJa: "ユーザー、取引、業務プロセスをわかりやすくつなぐ金融アプリケーションを開発します。",
      descriptionVi: "Phát triển ứng dụng tài chính kết nối người dùng, giao dịch và vận hành doanh nghiệp trong một trải nghiệm rõ ràng.",
      techStack: ["Financial applications", "Payments", "Integrations"],
    },
    {
      icon: "PanelsTopLeft",
      title: "Mobile & Web Apps",
      titleJa: "モバイル・Webアプリ",
      titleVi: "Ứng dụng Mobile & Web",
      description: "Deliver responsive web and mobile products shaped around real user needs and maintainable engineering.",
      descriptionJa: "ユーザーのニーズに寄り添い、保守性にも配慮したWeb・モバイルプロダクトを提供します。",
      descriptionVi: "Phát triển sản phẩm web và di động thích ứng theo nhu cầu người dùng, với nền tảng kỹ thuật dễ bảo trì.",
      techStack: ["React", "Next.js", "Flutter", "React Native"],
    },
    {
      icon: "ShieldCheck",
      title: "Web Security",
      titleJa: "Webセキュリティ",
      titleVi: "Bảo mật Web",
      description: "Strengthen application security through architecture reviews, secure implementation, and ongoing maintenance.",
      descriptionJa: "アーキテクチャレビュー、安全な実装、継続的な保守を通じてアプリケーションを守ります。",
      descriptionVi: "Tăng cường bảo mật ứng dụng qua đánh giá kiến trúc, triển khai an toàn và bảo trì liên tục.",
      techStack: ["Architecture review", "Secure coding", "Monitoring"],
    },
    {
      icon: "Webhook",
      title: "API Development",
      titleJa: "API開発",
      titleVi: "Phát triển API",
      description: "Connect products and services with well-structured APIs, integrations, and reliable data exchange.",
      descriptionJa: "適切に設計されたAPIやシステム連携を通じて、サービス間の安定したデータ交換を実現します。",
      descriptionVi: "Kết nối sản phẩm và dịch vụ bằng API có cấu trúc tốt, tích hợp hệ thống và trao đổi dữ liệu ổn định.",
      techStack: ["REST", "GraphQL", "PostgreSQL", "Redis"],
    },
    {
      icon: "ChartNoAxesCombined",
      title: "Big Data",
      titleJa: "ビッグデータ",
      titleVi: "Big Data",
      description: "Organize data pipelines and analytics foundations so teams can turn complex information into useful signals.",
      descriptionJa: "複雑な情報を価値あるインサイトへつなげるデータパイプラインと分析基盤を整備します。",
      descriptionVi: "Tổ chức luồng dữ liệu và nền tảng phân tích để chuyển thông tin phức tạp thành tín hiệu hữu ích.",
      techStack: ["Data pipelines", "Analytics", "Data platforms"],
    },
    {
      icon: "Gamepad2",
      title: "Gaming",
      titleJa: "ゲーム",
      titleVi: "Gaming",
      description: "Build engaging game services and supporting web or mobile experiences with scalable back-end foundations.",
      descriptionJa: "拡張性のあるバックエンドを基盤に、魅力的なゲームサービスやWeb・モバイル体験を開発します。",
      descriptionVi: "Xây dựng dịch vụ trò chơi cùng trải nghiệm web hoặc mobile trên nền tảng back-end có thể mở rộng.",
      techStack: ["Web applications", "Mobile applications", "Cloud services"],
    },
    {
      icon: "Bot",
      title: "AI Automations",
      titleJa: "AIオートメーション",
      titleVi: "Tự động hóa AI",
      description: "Apply AI to repetitive workflows, knowledge discovery, and decision support with human oversight in the loop.",
      descriptionJa: "人の確認を大切にしながら、定型業務、ナレッジ活用、意思決定支援にAIを取り入れます。",
      descriptionVi: "Ứng dụng AI vào quy trình lặp lại, khai thác tri thức và hỗ trợ quyết định với sự giám sát của con người.",
      techStack: ["AI", "Workflow automation", "Knowledge systems"],
    },
  ];

  for (const [index, service] of capabilityServices.entries()) {
    const existing = await prisma.service.findFirst({ where: { title: service.title } });
    if (!existing) {
      await prisma.service.create({
        data: { ...service, order: 101 + index, isVisible: true },
      });
    }
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
          content:
            "To become a trusted technology partner, accompanying Japanese businesses on their digital transformation and sustainable growth journey.",
          contentJa:
            "信頼されるテクノロジーパートナーとして、日本企業のデジタル変革と持続可能な成長の旅に伴走する。",
          contentVi:
            "Trở thành đối tác công nghệ tin cậy, đồng hành cùng doanh nghiệp Nhật Bản trong hành trình chuyển đổi số và phát triển bền vững.",
        },
      ],
    });
  }

  await prisma.aboutContent.upsert({
    where: { section: "vision" },
    update: {
      content:
        "To become a trusted technology partner, accompanying Japanese businesses on their digital transformation and sustainable growth journey.",
      contentJa:
        "信頼されるテクノロジーパートナーとして、日本企業のデジタル変革と持続可能な成長の旅に伴走する。",
      contentVi:
        "Trở thành đối tác công nghệ tin cậy, đồng hành cùng doanh nghiệp Nhật Bản trong hành trình chuyển đổi số và phát triển bền vững.",
    },
    create: {
      section: "vision",
      title: "Vision",
      titleJa: "ビジョン",
      titleVi: "Tầm nhìn",
      content:
        "To become a trusted technology partner, accompanying Japanese businesses on their digital transformation and sustainable growth journey.",
      contentJa:
        "信頼されるテクノロジーパートナーとして、日本企業のデジタル変革と持続可能な成長の旅に伴走する。",
      contentVi:
        "Trở thành đối tác công nghệ tin cậy, đồng hành cùng doanh nghiệp Nhật Bản trong hành trình chuyển đổi số và phát triển bền vững.",
    },
  });

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

  const aiProducts = [
    {
      title: "AI Meeting Assistant",
      titleJa: "AIミーティングアシスタント",
      titleVi: "Trợ lý họp AI",
      slug: "ai-meeting-assistant",
      summary: "A meeting companion for Google Meet and Zoom that captures conversations, creates notes and summaries, analyzes discussions, translates speech, and suggests next steps.",
      summaryJa: "Google MeetやZoomの会話を記録し、議事録・要約・分析・音声翻訳と次のアクション提案を行う会議アシスタントです。",
      summaryVi: "Trợ lý cho Google Meet và Zoom, ghi chú, tóm tắt, phân tích cuộc họp, dịch lời nói và đề xuất các bước tiếp theo.",
      description: "## Meeting intelligence\nCapture meeting notes, summarize discussions, surface key points, translate speech across languages, and suggest follow-up actions for the team.",
      descriptionJa: "## 会議インテリジェンス\n議事録の作成、会話の要約、重要事項の抽出、多言語音声翻訳、フォローアップの提案を支援します。",
      descriptionVi: "## Trí tuệ họp trực tuyến\nGhi chú, tóm tắt nội dung, làm rõ điểm chính, dịch lời nói đa ngôn ngữ và đề xuất việc cần theo dõi.",
      techStack: ["Google Meet", "Zoom", "Meeting notes", "AI summaries", "Speech translation", "Action items"],
      category: "ai",
      order: 101,
    },
    {
      title: "AI Recruiting Platform",
      titleJa: "AI採用プラットフォーム",
      titleVi: "Nền tảng tuyển dụng AI",
      slug: "ai-recruiting-platform",
      summary: "A recruiting workspace for SaaS-based hiring, with automated interview assistance, candidate evaluation, and interview-session and screen tracking.",
      summaryJa: "SaaS型の採用ワークスペースです。面接の自動化支援、候補者評価、面接セッションと画面のトラッキングを備えています。",
      summaryVi: "Nền tảng SaaS hỗ trợ tuyển dụng với phỏng vấn tự động, đánh giá ứng viên và theo dõi phiên phỏng vấn cũng như màn hình.",
      description: "## Hiring workflow\nSupport recruiting teams with structured candidate screening, automated interview assistance, evaluation workflows, and session and screen tracking.",
      descriptionJa: "## 採用ワークフロー\n候補者のスクリーニング、面接の自動化支援、評価フロー、面接セッションと画面のトラッキングを支援します。",
      descriptionVi: "## Quy trình tuyển dụng\nHỗ trợ sàng lọc ứng viên, phỏng vấn tự động, quy trình đánh giá và theo dõi phiên phỏng vấn cùng màn hình.",
      techStack: ["SaaS", "Automated interviews", "Candidate evaluation", "Session tracking", "Screen tracking"],
      category: "ai",
      order: 102,
    },
    {
      title: "Personal AI Assistant",
      titleJa: "パーソナルAIアシスタント",
      titleVi: "Trợ lý AI cá nhân",
      slug: "personal-ai-assistant",
      summary: "A personal assistant that organizes tasks and notifications, reminds users about upcoming work, and helps catch important messages and information.",
      summaryJa: "タスクや通知を整理し、予定をリマインドしながら、大切なメッセージや情報の見落としを防ぐパーソナルアシスタントです。",
      summaryVi: "Trợ lý cá nhân giúp quản lý công việc và thông báo, nhắc việc sắp tới, đồng thời hạn chế bỏ sót tin nhắn và thông tin quan trọng.",
      description: "## Personal productivity\nKeep tasks and reminders organized, highlight important messages and updates, and help users stay on top of information they might otherwise miss.",
      descriptionJa: "## パーソナル生産性\nタスクやリマインダーを整理し、重要なメッセージや更新情報を知らせ、情報の見落としを防ぎます。",
      descriptionVi: "## Năng suất cá nhân\nSắp xếp công việc và lời nhắc, làm nổi bật tin nhắn và cập nhật quan trọng, giúp người dùng không bỏ lỡ thông tin.",
      techStack: ["Task management", "Smart reminders", "Message notifications", "Personal knowledge"],
      category: "ai",
      order: 103,
    },
  ];

  for (const work of aiProducts) {
    await prisma.work.upsert({
      where: { slug: work.slug },
      update: {},
      create: {
        ...work,
        gallery: [],
        isVisible: true,
        featured: true,
      },
    });
  }

  const timelineMilestones = [
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
      memberCount: 5,
      images: [],
      order: 1,
    },
    {
      milestoneDate: "2026-06",
      title: "Partnership Agreement with ABC Company",
      titleJa: "ABC社とのパートナーシップ締結",
      titleVi: "Ký kết đối tác với công ty ABC",
      description:
        "Signed a strategic partnership with ABC Company to expand delivery capacity and client success.",
      descriptionJa: "ABC社と戦略的パートナーシップを締結し、提供体制と顧客成功を強化。",
      descriptionVi:
        "Ký kết đối tác chiến lược với công ty ABC nhằm mở rộng năng lực triển khai và mang lại giá trị cho khách hàng.",
      memberCount: 0,
      images: [],
      order: 2,
    },
    {
      milestoneDate: "2026-12",
      title: "",
      titleJa: "",
      titleVi: "",
      description: "",
      descriptionJa: "",
      descriptionVi: "",
      memberCount: 0,
      images: [],
      order: 3,
    },
  ];

  await prisma.timelineMilestone.deleteMany({ where: { order: { gt: 3 } } });
  for (const m of timelineMilestones) {
    const existing = await prisma.timelineMilestone.findFirst({ where: { order: m.order } });
    if (existing) {
      await prisma.timelineMilestone.update({ where: { id: existing.id }, data: m });
    } else {
      await prisma.timelineMilestone.create({ data: m });
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

  const heroSlideCount = await prisma.heroScrollSlide.count();
  if (heroSlideCount === 0) {
    await prisma.heroScrollSlide.createMany({
      data: [
        {
          mediaType: "video",
          imageUrl: "/images/hero-bridge-night.jpg",
          videoUrl: "https://assets.mixkit.co/videos/4087/4087-720.mp4",
          alt: "Cầu Rồng Đà Nẵng về đêm",
          title: "Dragon Bridge",
          titleVi: "Cầu Rồng",
          order: 0,
          isVisible: true,
        },
        {
          mediaType: "video",
          imageUrl: "/images/hero-city-traffic.jpg",
          videoUrl: "https://assets.mixkit.co/videos/11/11-720.mp4",
          alt: "Cầu Trần Thị Lý Đà Nẵng về đêm",
          title: "Tran Thi Ly Bridge",
          titleVi: "Cầu Trần Thị Lý",
          order: 1,
          isVisible: true,
        },
        {
          mediaType: "video",
          imageUrl: "/images/hero-city-aerial.jpg",
          videoUrl: "https://assets.mixkit.co/videos/42342/42342-720.mp4",
          alt: "Cầu Sông Hàn Đà Nẵng về đêm",
          title: "Han River Bridge",
          titleVi: "Cầu Sông Hàn",
          order: 2,
          isVisible: true,
        },
      ],
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
    { key: "site_logo_url", value: "/logo.png" },
    { key: "site_logo_url_backup", value: "/logo.png" },
    { key: "home_clients_title", value: "Our clients" },
    { key: "home_clients_title_vi", value: "Khách hàng của chúng tôi" },
    { key: "home_clients_title_ja", value: "お客様" },
    { key: "home_clients_subtitle", value: "Trusted on their digital transformation journey." },
    { key: "home_clients_subtitle_vi", value: "Đồng hành cùng các doanh nghiệp trên hành trình chuyển đổi số." },
    { key: "home_clients_subtitle_ja", value: "デジタル変革の旅路でご一緒している企業様です。" },
    { key: "site_logo_mode", value: "image" },
    { key: "site_notice_enabled", value: "false" },
    { key: "site_maintenance_mode", value: "false" },
    { key: "site_notice_variant", value: "info" },
    { key: "site_notice_title_vi", value: "" },
    { key: "site_notice_title_en", value: "" },
    { key: "site_notice_message_vi", value: "" },
    { key: "site_notice_message_en", value: "" },
    { key: "about_branch_hq_address", value: "7 Vung Trung 9, Ngu Hanh Son Ward, Da Nang, Vietnam" },
    { key: "about_branch_hq_address_vi", value: "7 Vùng Trung 9, Phường Ngũ Hành Sơn, Đà Nẵng, Việt Nam" },
    { key: "about_branch_hq_address_ja", value: "ベトナム・ダナン市・五行山区 Vung Trung 9-7" },
  ];

  const pageBlocks = [
    { page: "home", key: "services_section", title: "Our Services", titleVi: "Dịch vụ của chúng tôi", subtitle: "Full-stack development tailored to your business", subtitleVi: "Phát triển phần mềm trọn gói phù hợp doanh nghiệp của bạn", order: 1 },
    { page: "home", key: "why_section", title: "Why Choose FGS Software", titleVi: "Tại sao chọn FGS Software", subtitle: "Your trusted partner for Japan-market projects", subtitleVi: "Đối tác đáng tin cậy cho dự án thị trường Nhật Bản", order: 2 },
    { page: "home", key: "team_section", title: "Our Team", titleVi: "Đội ngũ của chúng tôi", subtitle: "Experienced engineers committed to quality", subtitleVi: "Kỹ sư giàu kinh nghiệm cam kết chất lượng", order: 3 },
    { page: "home", key: "works_section", title: "Featured Works", titleVi: "Dự án tiêu biểu", subtitle: "Real solutions delivered to clients", subtitleVi: "Giải pháp thực tế đã giao cho khách hàng", order: 4 },
    { page: "home", key: "testimonials_section", title: "What Clients Say", titleVi: "Khách hàng nói gì", order: 5 },
    { page: "home", key: "partners_section", title: "Clients & Partners", titleVi: "Khách hàng & Đối tác", subtitle: "Trusted by teams in Japan and worldwide", subtitleVi: "Được tin tưởng bởi các đội ngũ tại Nhật Bản và quốc tế", order: 6 },
    { page: "home", key: "cta_section", title: "Ready to start your project?", titleVi: "Sẵn sàng bắt đầu dự án?", subtitle: "Let's discuss how we can help your business grow", subtitleVi: "Hãy trao đổi cách chúng tôi giúp doanh nghiệp bạn phát triển", order: 7 },
    { page: "about", key: "page_header", title: "About Us", titleVi: "Giới thiệu", titleJa: "会社概要", subtitle: "Building trust through quality software", subtitleVi: "Xây dựng niềm tin qua phần mềm chất lượng", subtitleJa: "品質の高いソフトウェアで信頼を築く", order: 1 },
    { page: "about", key: "timeline_section", title: "Company History", titleVi: "Lịch sử hình thành", titleJa: "沿革", order: 2 },
    { page: "about", key: "activities_section", title: "Company Activities", titleVi: "Hoạt động công ty", titleJa: "会社の活動", order: 3 },
    { page: "about", key: "branches_section", title: "Branches", titleVi: "Chi nhánh", titleJa: "拠点", order: 4 },
    { page: "services", key: "page_header", title: "Services & Capabilities", titleVi: "Dịch vụ & Năng lực", subtitle: "End-to-end IT outsourcing solutions", subtitleVi: "Giải pháp outsourcing IT toàn diện", order: 1 },
    { page: "services", key: "tech_section", title: "Technologies We Use", titleVi: "Công nghệ sử dụng", subtitle: "Modern tools and frameworks we master", subtitleVi: "Công cụ và framework hiện đại chúng tôi thành thạo", order: 2 },
    { page: "works", key: "page_header", title: "Portfolio", titleVi: "Portfolio", subtitle: "Projects we are proud to have delivered", subtitleVi: "Các dự án chúng tôi tự hào đã hoàn thành", order: 1 },
    { page: "contact", key: "page_header", title: "Contact", titleVi: "Liên hệ", titleJa: "お問い合わせ", subtitle: "We typically reply within 1–2 business days", subtitleVi: "Chúng tôi phản hồi trong 1–2 ngày làm việc", subtitleJa: "ご相談をお待ちしています（1〜2営業日以内に返信）", order: 1 },
  ];

  for (const block of pageBlocks) {
    await prisma.pageContentBlock.upsert({
      where: { page_key: { page: block.page, key: block.key } },
      update: {},
      create: {
        page: block.page,
        key: block.key,
        title: block.title,
        titleVi: block.titleVi,
        subtitle: block.subtitle ?? undefined,
        subtitleVi: block.subtitleVi ?? undefined,
        order: block.order,
        isVisible: true,
      },
    });
  }

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
