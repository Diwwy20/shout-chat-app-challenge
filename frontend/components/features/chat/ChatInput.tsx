"use client";

import { KeyboardEvent, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendHorizontal, Square, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isGenerating: boolean;
  disabled: boolean;
  value: string;
  setValue: (v: string) => void;
}

export const ChatInput = ({
  onSend,
  onStop,
  isGenerating,
  disabled,
  value,
  setValue,
}: ChatInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const maxLength = 500;

  useEffect(() => {
    if (!disabled && !isGenerating) {
      inputRef.current?.focus();
    }
  }, [disabled, isGenerating]);

  const handleSend = () => {
    if (value.trim() && !isGenerating && !disabled) {
      onSend(value);
    }
  };

  const handleStop = () => {
    onStop();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getPlaceholder = () => {
    if (disabled) return "กำลังเชื่อมต่อ...";
    if (isGenerating) return "AI กำลังคิด...";
    return "พิมพ์ข้อความ...";
  };

  return (
    <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t dark:border-slate-800 sticky bottom-0 z-10 transition-colors">
      <div className="max-w-3xl mx-auto flex gap-2 relative">
        <div className="relative w-full">
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            disabled={disabled || isGenerating}
            maxLength={maxLength}
            className="pr-24 py-6 rounded-full shadow-sm border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500 bg-white dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 transition-colors"
          />

          <div
            className={cn(
              "absolute bottom-1/2 translate-y-1/2 right-12 text-[10px] font-medium transition-colors pointer-events-none",
              value.length > maxLength * 0.9
                ? "text-red-500"
                : "text-slate-400 dark:text-slate-500"
            )}
          >
            {value.length}/{maxLength}
          </div>
        </div>

        {isGenerating ? (
          <Button
            size="icon"
            onClick={handleStop}
            className="absolute right-1 top-1 h-10 w-10 rounded-full bg-red-500 hover:bg-red-600 transition-all shadow-md animate-in zoom-in duration-200 cursor-pointer"
            title="หยุดการสร้าง"
          >
            <Square className="h-4 w-4 fill-current" />
          </Button>
        ) : (
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!value.trim() || disabled}
            className={cn(
              "absolute right-1 top-1 h-10 w-10 rounded-full transition-all shadow-md cursor-pointer",
              disabled
                ? "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600"
                : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {disabled ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizontal className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
