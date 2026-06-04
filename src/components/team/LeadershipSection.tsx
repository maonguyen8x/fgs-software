import type { Founder } from "@prisma/client";
import { Crown } from "lucide-react";
import { LeadershipMemberCard } from "@/components/team/LeadershipMemberCard";
import { TeamSectionHeading } from "@/components/team/TeamSectionHeading";

interface LeadershipSectionProps {
  title: string;
  founders: Founder[];
}

export function LeadershipSection({ title, founders }: LeadershipSectionProps) {
  if (founders.length === 0) return null;

  return (
    <section className="team-flow-section">
      <div className="container-narrow">
        <TeamSectionHeading icon={Crown} title={title} />
        <div className="grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {founders.map((member) => (
            <LeadershipMemberCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}
