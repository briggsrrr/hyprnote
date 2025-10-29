import { useState } from "react";

import { Button } from "@hypr/ui/components/ui/button";
import { cn } from "@hypr/utils";
import { useListener } from "../../../../../contexts/listener";
import { SoundIndicator } from "../../shared";

export function InMeetingIndicator({ sessionId }: { sessionId: string }) {
  const [hovered, setHovered] = useState(false);
  const { active, stop, amplitude } = useListener((state) => ({
    active: state.status === "running_active" && state.sessionId === sessionId,
    stop: state.stop,
    amplitude: state.amplitude,
  }));

  if (!active) {
    return null;
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={stop}
      className={cn([
        "text-red-500 hover:text-red-600",
        "bg-red-50 hover:bg-red-100",
        "w-[75px]",
      ])}
    >
      {hovered
        ? (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-red-500 rounded-none" />
            <span>Stop</span>
          </div>
        )
        : (
          <SoundIndicator
            value={[amplitude.mic, amplitude.speaker]}
            color="#ef4444"
            size="long"
            height={16}
            width={32}
            stickWidth={2}
            gap={1}
          />
        )}
    </Button>
  );
}
