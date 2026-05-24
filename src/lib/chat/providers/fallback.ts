import type { Locale } from "@/i18n/routing";
import type { ChatTurn } from "../ai";

function scoreKeyword(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.reduce((score, kw) => (lower.includes(kw) ? score + 1 : score), 0);
}

type TopicKey = "identity" | "service" | "price" | "contact" | "japan" | "default";

export function generateFallbackReply(
  locale: Locale,
  messages: ChatTurn[],
  knowledge: string,
  assistantName: string
): string {
  const last = messages[messages.length - 1]?.content ?? "";
  const lower = last.toLowerCase();

  const replies: Record<Locale, Record<TopicKey, string>> = {
    en: {
      identity: `I'm **${assistantName}**, the AI assistant for FGS Software — an IT outsourcing company in Vietnam serving Japanese and international clients.\n\nI can advise you on:\n- Our **services** (web, mobile, API, UI/UX, maintenance)\n- **Portfolio** and delivery approach\n- **Collaboration models** and how to start a project\n- **Contact** and next steps with our team\n\nWhat would you like to know first?`,
      service:
        "We offer web & mobile development, API integration, UI/UX, code review, and maintenance — tailored for Japanese market quality standards. Which area interests you most?",
      price:
        "Budget depends on scope and team size. Share your project type and timeline — our team will respond within 1–2 business days with a tailored proposal.",
      contact:
        "You can reach us via the Contact page on this site, or share your email here and we'll follow up personally.",
      japan:
        "We specialize in Japanese client collaboration: clear communication, quality-focused delivery, and cultural understanding.",
      default: `I'm ${assistantName}, FGS Software's assistant. Ask me about our services, products, outsourcing process, or how to contact our team — I'll answer based on our company information.`,
    },
    ja: {
      identity: `私は **${assistantName}**、ベトナムのITアウトソーシング企業 FGS Software のAIアシスタントです。日本および海外のお客様をサポートしています。\n\nご案内できる内容：\n- **サービス**（Web・モバイル・API・UI/UX・保守）\n- **制作実績**と開発体制\n- **協業の進め方**・お見積りの流れ\n- **お問い合わせ**方法\n\nまずどの点について知りたいですか？`,
      service:
        "Web・モバイル開発、API連携、UI/UX、コードレビュー、保守などを提供しています。どの分野にご興味がありますか？",
      price:
        "ご予算はプロジェクト規模により異なります。種別とスケジュールをお聞かせください。1〜2営業日以内にご提案いたします。",
      contact:
        "お問い合わせページからご連絡いただくか、メールアドレスをお知らせください。担当者よりご返信します。",
      japan: "日本企業との協業に強みがあります。明確なコミュニケーションと品質重視の開発が特徴です。",
      default: `${assistantName} です。サービス、製品、協業方法、お問い合わせについて、当社の情報に基づいてお答えします。`,
    },
    vi: {
      identity: `Tôi là **${assistantName}**, trợ lý AI của **FGS Software** — công ty outsourcing IT tại Việt Nam, chuyên phục vụ khách hàng Nhật Bản và quốc tế.\n\nTôi có thể tư vấn cho bạn về:\n- **Dịch vụ**: web, mobile, API, UI/UX, bảo trì\n- **Sản phẩm / portfolio** và quy trình giao hàng\n- **Mô hình hợp tác** và cách bắt đầu dự án\n- **Liên hệ** đội ngũ FGS\n\nBạn muốn tìm hiểu phần nào trước?`,
      service:
        "Chúng tôi cung cấp phát triển web/mobile, API, UI/UX, review code và bảo trì — phù hợp tiêu chuẩn chất lượng cho khách hàng Nhật Bản. Bạn quan tâm lĩnh vực nào?",
      price:
        "Ngân sách phụ thuộc quy mô dự án. Hãy chia sẻ loại dự án và timeline — team sẽ phản hồi trong 1–2 ngày làm việc.",
      contact:
        "Bạn có thể dùng trang Liên hệ trên website hoặc để lại email tại đây để chúng tôi liên hệ lại.",
      japan:
        "FGS Software chuyên hợp tác với doanh nghiệp Nhật Bản: giao tiếp rõ ràng, chất lượng cao.",
      default: `Tôi là ${assistantName}, trợ lý FGS Software. Hãy hỏi về dịch vụ, sản phẩm, quy trình outsourcing hoặc liên hệ — tôi trả lời dựa trên thông tin công ty.`,
    },
  };

  const topics: { key: TopicKey; keywords: string[] }[] = [
    {
      key: "identity",
      keywords: [
        "who are you",
        "what are you",
        "bạn là ai",
        "ban la ai",
        "bạn là gì",
        "tư vấn gì",
        "tu van gi",
        "có thể giúp",
        "co the giup",
        "làm được gì",
        "lam duoc gi",
        "あなたは誰",
        "何ができる",
        "誰ですか",
        "introduce",
        "giới thiệu",
      ],
    },
    {
      key: "service",
      keywords: ["service", "dịch vụ", "サービス", "develop", "phát triển", "outsourcing", "web", "mobile"],
    },
    {
      key: "price",
      keywords: ["price", "budget", "giá", "ngân sách", "予算", "báo giá", "quote"],
    },
    {
      key: "contact",
      keywords: ["contact", "liên hệ", "お問い合わせ", "email", "gọi"],
    },
    {
      key: "japan",
      keywords: ["japan", "nhật", "日本", "japanese"],
    },
  ];

  const dict = replies[locale];
  let best: { key: TopicKey; score: number } = { key: "default", score: 0 };
  for (const topic of topics) {
    const score = scoreKeyword(lower, topic.keywords);
    if (score > best.score) best = { key: topic.key, score };
  }

  if (best.score > 0) return dict[best.key];

  if (last.trim().length > 8 && knowledge.length > 0) {
    const lines = knowledge.split("\n").filter(Boolean);
    const relevant = lines
      .filter((line) => {
        const words = lower.split(/\s+/).filter((w) => w.length > 3);
        return words.some((w) => line.toLowerCase().includes(w));
      })
      .slice(0, 8);
    const snippet = (relevant.length > 0 ? relevant : lines.slice(0, 10)).join("\n");
    const templates: Record<Locale, string> = {
      en: `Regarding your question, here is relevant information from FGS Software:\n\n${snippet}\n\nFor a detailed quote or consultation, please use our Contact page.`,
      ja: `ご質問に関連する当社の情報です：\n\n${snippet}\n\n詳しいお見積りはお問い合わせページをご利用ください。`,
      vi: `Về câu hỏi của bạn, đây là thông tin liên quan từ FGS Software:\n\n${snippet}\n\nĐể được tư vấn chi tiết hoặc báo giá, vui lòng dùng trang Liên hệ.`,
    };
    return templates[locale];
  }

  return dict.default;
}
