import { cn } from "@hypr/utils";

import { Icon } from "@iconify-icon/react";
import MuxPlayer, { type MuxPlayerRefAttributes } from "@mux/mux-player-react";
import { useEffect, useRef } from "react";

interface VideoModalProps {
  playbackId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function VideoModal({ playbackId, isOpen, onClose }: VideoModalProps) {
  const playerRef = useRef<MuxPlayerRefAttributes>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && playerRef.current) {
      playerRef.current.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-6xl aspect-video"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={cn(
            "absolute -top-12 right-0 p-2",
            "text-white hover:text-neutral-300",
            "transition-colors duration-200",
          )}
          aria-label="Close video"
        >
          <Icon icon="mdi:close" className="text-3xl" />
        </button>

        {/* Video */}
        <MuxPlayer
          ref={playerRef}
          playbackId={playbackId}
          autoPlay
          loop
          accentColor="#78716c"
          className="w-full h-full rounded-lg"
          metadata={{
            videoTitle: "Hyprnote Feature Demo",
          }}
        />
      </div>
    </div>
  );
}
