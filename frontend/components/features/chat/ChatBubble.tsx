import { useState, useRef, useEffect } from "react";
import { IMessage, MessageRole } from "@/types/chat";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, User, Copy, Pencil, Check, X } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";
import { toast } from "sonner";

interface ChatBubbleProps {
  message: IMessage;
  onUpdate?: (id: string, newContent: string) => void;
}

export const ChatBubble = ({ message, onUpdate }: ChatBubbleProps) => {
  const isUser = message.role === MessageRole.USER;
  const maxLength = 500;

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      const val = textareaRef.current.value;
      textareaRef.current.setSelectionRange(val.length, val.length);
    }
  }, [isEditing]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast.success("คัดลอกข้อความแล้ว");
  };

  const handleSave = () => {
    if (!editContent.trim()) {
      toast.error("ข้อความห้ามว่าง");
      return;
    }
    if (editContent.trim() !== message.content) {
      onUpdate?.(message._id, editContent);
      toast.success("แก้ไขข้อความสำเร็จ");
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        "group flex w-full gap-3 py-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar className="h-9 w-9 border shadow-sm mt-1 shrink-0">
        <AvatarImage src={isUser ? "" : "/images/bot-avatar.png"} />
        <AvatarFallback
          className={cn(isUser ? "bg-slate-200" : "bg-blue-600 text-white")}
        >
          {isUser ? <User size={18} /> : <Bot size={18} />}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "flex flex-col max-w-[85%] md:max-w-[75%] min-w-[100px] relative",
          isUser ? "items-end" : "items-start"
        )}
      >
        {!isEditing ? (
          <div className="relative group/bubble">
            <div
              className={cn(
                "rounded-2xl px-5 py-3 shadow-sm text-[15px] leading-relaxed transition-colors",
                isUser
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-white dark:bg-slate-800 border dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none w-full"
              )}
            >
              {isUser ? (
                <p className="whitespace-pre-wrap">{message.content}</p>
              ) : (
                <MarkdownRenderer content={message.content} />
              )}
            </div>

            {isUser && (
              <div className="absolute top-0 -left-2 -translate-x-full opacity-0 group-hover/bubble:opacity-100 transition-all duration-200 flex gap-1 bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-md p-1 shadow-sm scale-95 group-hover/bubble:scale-100 origin-right border dark:border-slate-700">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-700 rounded-sm transition-colors cursor-pointer"
                  onClick={handleCopy}
                  title="คัดลอก"
                >
                  <Copy size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-700 rounded-sm transition-colors cursor-pointer"
                  onClick={() => setIsEditing(true)}
                  title="แก้ไข"
                >
                  <Pencil size={16} />
                </Button>
              </div>
            )}

            {!isUser && (
              <div className="absolute top-0 -right-2 translate-x-full opacity-0 group-hover/bubble:opacity-100 transition-all duration-200 flex gap-1 bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-md p-1 shadow-sm scale-95 group-hover/bubble:scale-100 origin-left border dark:border-slate-700">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-700 rounded-sm transition-colors cursor-pointer"
                  onClick={handleCopy}
                  title="คัดลอก"
                >
                  <Copy size={16} />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full min-w-[300px] bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-3 shadow-md ring-2 ring-blue-100 dark:ring-blue-900/50 animate-in zoom-in-95 duration-200 relative z-10">
            <Textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              maxLength={maxLength}
              className="min-h-20 border-none focus-visible:ring-0 p-0 text-[15px] resize-none bg-transparent text-slate-800 dark:text-slate-100 leading-relaxed"
            />

            <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100 dark:border-slate-700">
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  editContent.length > maxLength * 0.9
                    ? "text-red-500"
                    : "text-slate-400 dark:text-slate-500"
                )}
              >
                {editContent.length}/{maxLength}
              </span>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancel}
                  className="h-7 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X size={12} className="mr-1" /> ยกเลิก
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!editContent.trim()}
                  className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                >
                  <Check size={12} className="mr-1" /> บันทึก
                </Button>
              </div>
            </div>
          </div>
        )}

        {!isEditing && (
          <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 px-1 select-none">
            {new Date(message.createdAt).toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
    </div>
  );
};
