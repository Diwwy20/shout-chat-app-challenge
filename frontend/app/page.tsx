"use client";

import { useChat } from "@/hooks/useChat";
import { ChatBubble } from "@/components/features/chat/ChatBubble";
import { ChatInput } from "@/components/features/chat/ChatInput";
import { ChatSkeleton } from "@/components/features/chat/ChatSkeleton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { MessageSquareText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ModeToggle } from "@/components/common/ModeToggle";
import { MessageRole } from "@/types/chat";

export default function ChatPage() {
  const {
    messages,
    isLoading,
    isSending,
    sendMessage,
    scrollRef,
    clearChat,
    stopGeneration,
    inputVal,
    setInputVal,
    editMessage,
  } = useChat();

  const lastUserMessageIndex = messages
    .map((m) => m.role)
    .lastIndexOf(MessageRole.USER);

  return (
    <main className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans transition-colors duration-300">
      <header className="h-16 bg-white dark:bg-slate-900 border-b dark:border-slate-800 flex items-center justify-between px-4 md:px-6 shadow-sm z-20 sticky top-0 transition-colors">
        <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
          <Image
            src="/images/bot-avatar.png"
            alt="AI Assistant Avatar"
            width={32}
            height={32}
            className="object-cover rounded-full w-10 h-10"
          />

          <div>
            <h1 className="font-bold text-lg leading-tight text-slate-800 dark:text-slate-100">
              AI Assistant
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase">
              Powered by Ollama
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

          <ConfirmDialog
            title="ยืนยันการลบประวัติทั้งหมด?"
            description="ข้อความและการสนทนาทั้งหมดใน Session นี้จะถูกลบออกจากระบบถาวร"
            confirmText="ยืนยันลบข้อมูล"
            variant="destructive"
            onConfirm={clearChat}
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 dark:border-red-900/50 dark:bg-red-950/10 dark:text-red-400 dark:hover:bg-red-900/30 transition-all shadow-sm cursor-pointer"
                disabled={messages.length === 0 || isLoading || isSending}
              >
                <Trash2 size={16} />
                <span className="hidden sm:inline font-medium">ลบประวัติ</span>
              </Button>
            }
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
        <div className="max-w-3xl mx-auto p-4 py-8 min-h-full flex flex-col justify-end">
          {isLoading && <ChatSkeleton />}

          {!isLoading && messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-6 animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800">
                <MessageSquareText
                  size={40}
                  className="text-slate-300 dark:text-slate-600"
                />
              </div>
              <p className="text-lg font-semibold text-slate-600 dark:text-slate-300">
                เริ่มสนทนาได้แล้ว ตอนนี้!
              </p>
            </div>
          )}

          <div className="space-y-6">
            {messages.map((msg, index) => (
              <ChatBubble
                key={msg._id}
                message={msg}
                onUpdate={editMessage}
                isEditable={index === lastUserMessageIndex}
              />
            ))}

            {isSending && (
              <div className="flex gap-4 py-4 animate-pulse">
                <Image
                  src="/images/bot-avatar.png"
                  alt="AI Assistant Avatar"
                  width={32}
                  height={32}
                  className="object-cover w-9 h-9 rounded-lg"
                />
                <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl rounded-bl-none px-5 py-4 shadow-sm flex items-center gap-1.5 h-8">
                  <span className="w-2 h-2 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}

            <div ref={scrollRef} className="h-1" />
          </div>
        </div>
      </div>

      <ChatInput
        onSend={sendMessage}
        onStop={stopGeneration}
        isGenerating={isSending}
        disabled={isLoading}
        value={inputVal}
        setValue={setInputVal}
      />
    </main>
  );
}
