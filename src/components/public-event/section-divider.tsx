import { Heart } from "lucide-react";

export function SectionDivider() {
  return (
    <div className="flex items-center justify-center py-2" aria-hidden="true">
      <div className="h-px w-16 bg-border" />
      <Heart className="mx-3 h-3 w-3 text-primary/40 fill-primary/40" />
      <div className="h-px w-16 bg-border" />
    </div>
  );
}
