import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Element, Root, RootContent } from "hast";

const FONT_FAMILIES = new Set(["sans-serif", "serif", "monospace", "system-ui"]);
const STYLE_TOKEN =
  /\[\[(color|font):([^\]]+)\]\]([\s\S]*?)\[\[\/\1\]\]/g;

function rehypeNewsInlineStyles() {
  return (tree: Root) => {
    const visit = (node: Root | Element) => {
      if (!("children" in node)) return;
      const children: RootContent[] = [];

      for (const child of node.children) {
        if (child.type !== "text") {
          children.push(child);
          if (child.type === "element") visit(child);
          continue;
        }

        let lastIndex = 0;
        STYLE_TOKEN.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = STYLE_TOKEN.exec(child.value)) !== null) {
          const [token, kind, value, text] = match;
          const colorIsValid = kind === "color" && /^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value);
          const fontIsValid = kind === "font" && FONT_FAMILIES.has(value);
          if (!colorIsValid && !fontIsValid) continue;

          if (match.index > lastIndex) {
            children.push({ type: "text", value: child.value.slice(lastIndex, match.index) });
          }
          children.push({
            type: "element",
            tagName: "span",
            properties: {
              style: colorIsValid ? `color: ${value}` : `font-family: ${value}`,
            },
            children: [{ type: "text", value: text }],
          } satisfies Element);
          lastIndex = match.index + token.length;
        }

        if (lastIndex === 0) {
          children.push(child);
        } else if (lastIndex < child.value.length) {
          children.push({ type: "text", value: child.value.slice(lastIndex) });
        }
      }

      node.children = children;
    };

    visit(tree);
  };
}

export function NewsArticleContent({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div className={["news-article-content", className].filter(Boolean).join(" ")}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeNewsInlineStyles]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
