import { cn } from "@/lib/utils";

interface SurfaceBlockProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "article" | "section";
}

export function SurfaceBlock({ children, className, as: Tag = "div" }: SurfaceBlockProps) {
  return <Tag className={cn("surface-block", className)}>{children}</Tag>;
}
