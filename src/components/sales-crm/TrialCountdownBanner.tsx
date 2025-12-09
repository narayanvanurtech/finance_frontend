"use client"
import { useEffect, useState, useCallback, useMemo } from "react";
import { differenceInDays } from "date-fns";
import dynamic from "next/dynamic";

// Dynamically import the Player component to disable SSR
const Player = dynamic(() => import("@lottiefiles/react-lottie-player").then(mod => mod.Player), {
  ssr: false,
});


type TrialCountdownProps = {
  trialEndsAt: string | Date;
  onTrialExpired?: () => void;
  className?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  theme?: "default" | "warning" | "danger";
  showAnimation?: boolean;
  autoCollapse?: boolean;
  collapseDelay?: number;
  fixed?: boolean;
};

export const TrialCountdownBanner = ({
  trialEndsAt,
  onTrialExpired,
  className = "",
  position = "bottom-right",
  theme = "default",
  showAnimation = true,
  autoCollapse = true,
  collapseDelay = 3000,
  fixed = true,
}: TrialCountdownProps) => {
  const [label, setLabel] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const positionClasses = useMemo(() => {
    const positions = {
      "bottom-right": "bottom-4 right-4",
      "bottom-left": "bottom-4 left-4",
      "top-right": "top-4 right-4",
      "top-left": "top-4 left-4",
    };
    return positions[position];
  }, [position]);

  const updateLabel = useCallback(() => {
    try {
      const end = new Date(trialEndsAt);
      if (isNaN(end.getTime())) {
        setLabel(null);
        setIsVisible(false);
        return;
      }

      const now = new Date();
      const days = differenceInDays(end, now);
      if (days > 1) setLabel(`${days} days left`);
      else if (days === 1) setLabel("1 day left");
      else if (days === 0) setLabel("Ends today");
      else {
        setLabel("Trial expired");
        onTrialExpired?.();
        setTimeout(() => setIsVisible(false), 5000);
      }
    } catch (error) {
      console.error("Error updating trial countdown:", error);
      setLabel(null);
      setIsVisible(false);
    }
  }, [trialEndsAt, onTrialExpired]);

  useEffect(() => {
    updateLabel();
    const interval = setInterval(updateLabel, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [updateLabel]);

  useEffect(() => {
    if (label && autoCollapse) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, collapseDelay);
      return () => clearTimeout(timer);
    }
  }, [label, autoCollapse, collapseDelay]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setIsClicked(!isClicked);
      }
      if (event.key === "Escape") {
        setIsClicked(false);
        setIsHovered(false);
      }
    },
    [isClicked]
  );

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);
  const handleClick = useCallback(() => setIsClicked(!isClicked), [isClicked]);
  const handleDismiss = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
  }, []);

  if (!label || !isVisible) return null;

  const shouldShowText = isExpanded || isHovered || isClicked;
  const isExpired = label === "Trial expired";

  return (
    <div
      className={`${fixed ? `fixed ${positionClasses}` : ""} z-30 ${className}`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="rounded-2xl shadow-xl border border-indigo-600">
        <div
          className={`
            group border rounded-2xl font-medium shadow-md
            flex items-center cursor-pointer transition-all duration-500 ease-out py-2 px-3
            hover:shadow-lg active:scale-95
            focus:outline-none relative overflow-hidden
            ${isExpired ? "border-red-600" : "border-indigo-600"}
            bg-indigo-700
          `}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="button"
          aria-label={`Trial countdown: ${label}. Click or press Enter to ${
            shouldShowText ? "collapse" : "expand"
          }`}
          aria-expanded={shouldShowText}
        >
          <div className="w-12 h-12 flex items-center justify-center p-0 m-0">
            {showAnimation && (
              <Player
                src="/animations/timerIndigo.json"
                loop
                autoplay
                style={{ width: "100%", height: "100%" }}
                className="relative"
              />
            )}
          </div>

          <span
            className={`
              transition-all duration-500 ease-out whitespace-nowrap overflow-hidden
              ${shouldShowText ? "max-w-40 opacity-100 ml-2" : "max-w-0 opacity-0 ml-0"}
              text-sm text-[#e0e0e0]
            `}
          >
            Trial {label}
          </span>

          {shouldShowText && (
            <button
              onClick={handleDismiss}
              className="ml-3 w-6 h-6 flex items-center justify-center bg-indigo-700 hover:bg-indigo-800 text-[#d1d1d1] rounded-full transition-all text-sm"
              title="Dismiss"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
