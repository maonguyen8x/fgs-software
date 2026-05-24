import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface RequiredLabelProps {
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}

export function RequiredLabel({ htmlFor, children, required = false, className }: RequiredLabelProps) {
  return (
    <Label htmlFor={htmlFor} className={cn(className)}>
      {children}
      {required && (
        <span className="ml-0.5 text-red-500" aria-hidden>
          *
        </span>
      )}
    </Label>
  );
}
