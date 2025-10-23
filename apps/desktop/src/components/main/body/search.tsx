import useMediaQuery from "beautiful-react-hooks/useMediaQuery";
import { Loader2Icon, SearchIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Kbd, KbdGroup } from "@hypr/ui/components/ui/kbd";
import { cn } from "@hypr/utils";
import { useSearch } from "../../../contexts/search/ui";
import { useCmdKeyPressed } from "../../../hooks/useCmdKeyPressed";

export function Search() {
  const hasSpace = useMediaQuery("(min-width: 900px)");

  const { focus, setFocusImpl, inputRef } = useSearch();
  const [isManuallyExpanded, setIsManuallyExpanded] = useState(false);

  const shouldShowExpanded = hasSpace || isManuallyExpanded;

  useEffect(() => {
    if (!shouldShowExpanded) {
      setFocusImpl(() => {
        setIsManuallyExpanded(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      });
    } else {
      setFocusImpl(() => {
        inputRef.current?.focus();
      });
    }
  }, [shouldShowExpanded, setFocusImpl, inputRef]);

  const handleCollapsedClick = () => {
    focus();
  };

  const handleExpandedFocus = () => {
    if (!hasSpace) {
      setIsManuallyExpanded(true);
    }
  };

  const handleExpandedBlur = () => {
    if (!hasSpace) {
      setIsManuallyExpanded(false);
    }
  };

  if (shouldShowExpanded) {
    return <ExpandedSearch onFocus={handleExpandedFocus} onBlur={handleExpandedBlur} />;
  }

  return <CollapsedSearch onClick={handleCollapsedClick} />;
}

function CollapsedSearch({ onClick }: { onClick: () => void }) {
  const { isSearching, isIndexing } = useSearch();
  const showLoading = isSearching || isIndexing;

  return (
    <button
      onClick={onClick}
      className={cn([
        "flex items-center justify-center h-full w-10",
        "rounded-lg bg-neutral-100 border border-transparent",
        "hover:bg-neutral-200 transition-colors",
      ])}
      aria-label="Open search"
    >
      {showLoading
        ? <Loader2Icon className="h-4 w-4 text-neutral-400 animate-spin" />
        : <SearchIcon className="h-4 w-4 text-neutral-400" />}
    </button>
  );
}

function ExpandedSearch({ onFocus, onBlur }: { onFocus?: () => void; onBlur?: () => void }) {
  const { query, setQuery, isSearching, isIndexing, inputRef } = useSearch();
  const [isFocused, setIsFocused] = useState(false);
  const isCmdPressed = useCmdKeyPressed();

  const showLoading = isSearching || isIndexing;
  const showShortcut = isCmdPressed && !query;

  return (
    <div
      className={cn([
        "flex items-center h-full transition-all duration-300",
        isFocused ? "w-[250px]" : "w-[180px]",
      ])}
    >
      <div className="relative flex items-center w-full h-full">
        {showLoading
          ? <Loader2Icon className={cn(["h-4 w-4 absolute left-3 text-neutral-400 animate-spin"])} />
          : <SearchIcon className={cn(["h-4 w-4 absolute left-3 text-neutral-400"])} />}
        <input
          ref={inputRef}
          type="text"
          placeholder="Search anything..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.currentTarget.blur();
            }
          }}
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          className={cn([
            "text-sm",
            "w-full pl-9 h-full",
            query ? "pr-9" : showShortcut ? "pr-14" : "pr-4",
            "rounded-lg bg-neutral-100 border border-transparent",
            "focus:outline-none focus:bg-neutral-200 focus:border-black",
          ])}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className={cn([
              "absolute right-3",
              "h-4 w-4",
              "text-neutral-400 hover:text-neutral-600",
              "transition-colors",
            ])}
            aria-label="Clear search"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}
        {showShortcut && (
          <div className="absolute right-2 top-1">
            <KbdGroup>
              <Kbd className="bg-neutral-200">⌘</Kbd>
              <Kbd className="bg-neutral-200">K</Kbd>
            </KbdGroup>
          </div>
        )}
      </div>
    </div>
  );
}
