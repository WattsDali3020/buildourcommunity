import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ExpandableSectionProps {
  id: string;
  isOpen: boolean;
  children: ReactNode;
  className?: string;
}

export function ExpandableSection({ id, isOpen, children, className }: ExpandableSectionProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = contentRef.current;
    const inner = innerRef.current;
    if (!el || !inner) return;

    if (isOpen) {
      el.style.height = inner.scrollHeight + "px";
      el.style.opacity = "1";
      const timer = setTimeout(() => {
        el.style.height = "auto";
      }, 300);
      return () => clearTimeout(timer);
    } else {
      el.style.height = inner.scrollHeight + "px";
      requestAnimationFrame(() => {
        el.style.height = "0px";
        el.style.opacity = "0";
      });
    }
  }, [isOpen]);

  return (
    <div
      ref={contentRef}
      id={`section-${id}`}
      className={cn("overflow-hidden transition-all", className)}
      style={{
        height: isOpen ? undefined : "0px",
        opacity: isOpen ? 1 : 0,
        transitionProperty: "height, opacity",
        transitionDuration: "0.3s",
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      data-testid={`expandable-section-${id}`}
    >
      <div ref={innerRef} className="pt-6">
        {children}
      </div>
    </div>
  );
}
