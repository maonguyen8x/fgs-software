export function TeamIntroBlocks({ copy }: { copy: string[] }) {
  const items = copy.filter((text) => text.trim().length > 0);
  if (items.length === 0) return null;

  return (
    <section className="team-flow-section">
      <div className="team-page-inner">
        <div className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md shadow-slate-200/60 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {items.map((text, index) => (
            <p
              key={`${index}-${text.slice(0, 24)}`}
              className="whitespace-pre-line px-6 py-5 text-base leading-relaxed text-slate-700 md:px-8 dark:text-slate-300"
            >
              {text}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}