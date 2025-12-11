// hooks/useChat.ts
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
      toast.info("หยุดการสร้างข้อความแล้ว");
    }
  };

  const sendMessage = async (content: string) => {
    if (!sessionId) return;
    abortControllerRef.current = new AbortController();

    const tempId = uuidv4();

    // 1. สร้างข้อความ User เพื่อแสดงผลทันที (Optimistic Update)
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
      const responseData = await chatService.sendMessage(
        { sessionId, content },
        abortControllerRef.current.signal
      );

      // ✅ FIX: แก้ไขตรงนี้ครับ
      // เอาข้อความ AI ที่ได้จาก Server มา "ต่อท้าย" Array เดิม
      // (ไม่ใช้ .map ไปทับข้อความ User เดิมแล้ว)
      setMessages((prev) => [...prev, responseData]);
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        if (error.code === "ERR_CANCELED" || error.name === "CanceledError") {
          return;
        }
      }
      // กรณี Error ให้ลบข้อความ User (optimisticMsg) ที่สร้างไว้ชั่วคราวออก
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

    // เก็บข้อความไว้แค่ถึงตัวก่อนหน้าที่จะแก้
    const keepMessages = messages.slice(0, targetIndex + 1);

    // อัปเดตเนื้อหาใน UI ทันที
    keepMessages[targetIndex] = {
      ...keepMessages[targetIndex],
      content: newContent,
    };

    setMessages(keepMessages);
    setIsSending(true);

    try {
      await chatService.regenerateMessage(id, newContent);

      // ดึงประวัติใหม่ทั้งหมดเพื่อให้ Sync กับ DB
      const freshHistory = await chatService.getHistory(sessionId);
      setMessages(freshHistory);
    } catch (error) {
      console.error("Edit error:", error);
      toast.error("เกิดข้อผิดพลาดในการแก้ไข");
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
