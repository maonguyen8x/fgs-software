import type { Founder } from "@prisma/client";
import { LeadershipMemberCard } from "@/components/team/LeadershipMemberCard";

interface LeadershipSectionProps {
  title: string;
  founders: Founder[];
}

export function LeadershipSection({ title, founders }: LeadershipSectionProps) {
  if (founders.length === 0) return null;

  return (
    <section className="team-flow-section team-flow-section--tight">
      <div className="team-page-inner">
        <div className="w-full max-w-4xl">
          <h2 className="mb-[5px] text-left text-2xl font-bold uppercase leading-tight tracking-wide text-primary-600 md:text-3xl dark:text-primary-400">
            {title}
          </h2>
          <div className="team-leadership-grid grid w-full grid-cols-2 gap-[15px] lg:grid-cols-3">
            {founders.map((member) => (
              <LeadershipMemberCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
