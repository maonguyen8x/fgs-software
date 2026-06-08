const SCROLL_OFFSET_PX = 88;
const ADMIN_SCROLL_ROOT_SELECTOR = "[data-admin-scroll-root]";

export function getAdminScrollRoot(): HTMLElement | null {
  return document.querySelector<HTMLElement>(ADMIN_SCROLL_ROOT_SELECTOR);
}

function isElementScrollable(el: HTMLElement): boolean {
  return el.scrollHeight > el.clientHeight + 2;
}

/** Prefer the admin <main> panel; fall back to window when layout scrolls the document. */
export function resolveAdminScrollContainer(): HTMLElement | "window" {
  const main = getAdminScrollRoot();
  if (main && isElementScrollable(main)) return main;
  return "window";
}

export function scrollToAdminSection(sectionId: string): void {
  const target = document.getElementById(sectionId);
  if (!target) return;

  const scroll = () => {
    const container = resolveAdminScrollContainer();
    const targetRect = target.getBoundingClientRect();

    if (container === "window") {
      const top = window.scrollY + targetRect.top - SCROLL_OFFSET_PX;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      return;
    }

    const rootRect = container.getBoundingClientRect();
    const top = container.scrollTop + (targetRect.top - rootRect.top) - SCROLL_OFFSET_PX;
    container.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(scroll);
  });
}
