"use client";

import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { chatService } from "@/services/chatService";
import { IMessage, MessageRole } from "@/types/chat";
import { isAxiosError } from "axios";

export const useChat = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [inputVal, setInputVal] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const initChat = async () => {
      let currentSession = localStorage.getItem("chat_session_id");
      if (!currentSession) {
        currentSession = uuidv4();
        localStorage.setItem("chat_session_id", currentSession);
      }
      setSessionId(currentSession);

      try {
        const history = await chatService.getHistory(currentSession);
        setMessages(history);
      } catch (error) {
        console.error("Load history error:", error);
        toast.error("ไม่สามารถโหลดประวัติการแชทได้");
      } finally {
        setIsLoading(false);
      }
    };
    initChat();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsSending(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!sessionId) return;
    abortControllerRef.current = new AbortController();

    const tempId = uuidv4();

    const optimisticMsg: IMessage = {
      _id: tempId,
      sessionId,
      role: MessageRole.USER,
      content,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setIsSending(true);
    setInputVal("");

    try {
      const { userMessage, aiMessage } = await chatService.sendMessage(
        { sessionId, content },
        abortControllerRef.current.signal
      );

      setMessages((prev) =>
        prev
          .map((msg) => (msg._id === tempId ? userMessage : msg))
          .concat(aiMessage)
      );
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        if (error.code === "ERR_CANCELED" || error.name === "CanceledError") {
          const stopMsg: IMessage = {
            _id: uuidv4(),
            sessionId,
            role: MessageRole.AI,
            content: "You stopped this response",
            createdAt: new Date().toISOString(),
            isExcluded: true,
          };
          setMessages((prev) => [...prev, stopMsg]);
          return;
        }
      }

      setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
      toast.error("AI ไม่สามารถให้บริการในตอนนี้");
    } finally {
      setIsSending(false);
      abortControllerRef.current = null;
    }
  };

  const clearChat = async () => {
    if (!sessionId) return;
    try {
      await chatService.clearHistory(sessionId);
      setMessages([]);
      toast.success("ลบประวัติการสนทนาเรียบร้อย");
    } catch (error) {
      console.error("Clear error: ", error);
      toast.error("ไม่สามารถลบประวัติแชทได้");
    }
  };

  const editMessage = async (id: string, newContent: string) => {
    const targetIndex = messages.findIndex((m) => m._id === id);
    if (targetIndex === -1) return;

    const keepMessages = messages.slice(0, targetIndex + 1);

    keepMessages[targetIndex] = {
      ...keepMessages[targetIndex],
      content: newContent,
    };

    setMessages(keepMessages);
    setIsSending(true);

    try {
      await chatService.regenerateMessage(id, newContent);

      const freshHistory = await chatService.getHistory(sessionId);
      setMessages(freshHistory);
      toast.success("แก้ไขและสร้างข้อความใหม่สำเร็จ");
    } catch (error) {
      console.error("Edit error:", error);
      toast.error("เกิดข้อผิดพลาดในการแก้ไข");
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  return {
    messages,
    isLoading,
    isSending,
    sendMessage,
    clearChat,
    scrollRef,
    stopGeneration,
    inputVal,
    setInputVal,
    editMessage,
  };
};
