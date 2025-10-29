import { CheckCircle2Icon, Loader2Icon } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { Streamdown } from "streamdown";

import { cn } from "@hypr/utils";
import { useAITask } from "../../../../../../contexts/ai-task";
import { createTaskId, type TaskId } from "../../../../../../store/zustand/ai-task/task-configs";
import { getTaskState, type TaskStepInfo } from "../../../../../../store/zustand/ai-task/tasks";

export function StreamingView({ sessionId }: { sessionId: string }) {
  const taskId = createTaskId(sessionId, "enhance");
  const text = useAITask((state) => getTaskState(state.tasks, taskId)?.streamedText ?? "");

  const containerRef = useAutoScrollToBottom(text);

  return (
    <div ref={containerRef} className="flex flex-col pb-2 space-y-1">
      <Streamdown
        components={streamdownComponents}
        disallowedElements={["code", "pre"]}
        className={cn([
          "space-y-2",
        ])}
      >
        {text}
      </Streamdown>

      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, layout: { duration: 0.15 } }}
        className={cn([
          "flex items-center justify-center w-[calc(100%-24px)] gap-3",
          "border border-neutral-200",
          "bg-neutral-800 rounded-lg py-3",
        ])}
      >
        <Status taskId={taskId} />
      </motion.div>
    </div>
  );
}

const HEADING_SHARED = "text-gray-700 font-semibold text-sm mt-0 mb-1 min-h-6";

const streamdownComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => {
    return <h1 className={cn([HEADING_SHARED, "text-xl"])}>{props.children as React.ReactNode}</h1>;
  },
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => {
    return <h2 className={cn([HEADING_SHARED, "text-lg"])}>{props.children as React.ReactNode}</h2>;
  },
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => {
    return <h3 className={cn([HEADING_SHARED, "text-base"])}>{props.children as React.ReactNode}</h3>;
  },
  h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => {
    return <h4 className={cn([HEADING_SHARED, "text-sm"])}>{props.children as React.ReactNode}</h4>;
  },
  h5: (props: React.HTMLAttributes<HTMLHeadingElement>) => {
    return <h5 className={cn([HEADING_SHARED, "text-sm"])}>{props.children as React.ReactNode}</h5>;
  },
  h6: (props: React.HTMLAttributes<HTMLHeadingElement>) => {
    return <h6 className={cn([HEADING_SHARED, "text-xs"])}>{props.children as React.ReactNode}</h6>;
  },
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => {
    return <ul className="list-disc pl-6 mb-1 block relative">{props.children as React.ReactNode}</ul>;
  },
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => {
    return <ol className="list-decimal pl-6 mb-1 block relative">{props.children as React.ReactNode}</ol>;
  },
  li: (props: React.HTMLAttributes<HTMLLIElement>) => {
    return <li className="mb-1">{props.children as React.ReactNode}</li>;
  },
} as const;

function Status({ taskId }: { taskId: TaskId<"enhance"> }) {
  const step = useAITask((state) => getTaskState(state.tasks, taskId)?.currentStep) as
    | TaskStepInfo<"enhance">
    | undefined;

  if (!step) {
    return (
      <div className="flex items-center gap-2">
        <Loader2Icon className="w-4 h-4 animate-spin text-neutral-50" />
        <span className="text-xs text-neutral-50">
          Loading
        </span>
      </div>
    );
  }

  if (step.type === "generating") {
    return (
      <div className="flex items-center gap-2">
        <Loader2Icon className="w-4 h-4 animate-spin text-neutral-50" />
        <span className="text-xs text-neutral-50">
          Generating
        </span>
      </div>
    );
  }

  const icon = step.type === "tool-call"
    ? <Loader2Icon className="w-4 h-4 animate-spin text-neutral-50" />
    : <CheckCircle2Icon className="w-4 h-4 text-neutral-50" />;

  if (step.toolName === "analyzeStructure") {
    return (
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs text-neutral-50">
          Analyzing structure...
        </span>
      </div>
    );
  }
}

function useAutoScrollToBottom(text: string) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const scrollableParent = container.parentElement;
    if (!scrollableParent) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = scrollableParent;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    if (isNearBottom) {
      scrollableParent.scrollTop = scrollHeight;
    }
  }, [text]);

  return containerRef;
}
