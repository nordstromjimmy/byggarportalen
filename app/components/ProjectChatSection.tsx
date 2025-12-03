"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import ConfirmDialog from "./ConfirmDialog";

type ChatMessage = {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    id: string;
    full_name: string | null;
    company: string | null;
  } | null;
};

type Props = {
  projectId: string;
  currentUserId: string | null;
};

export default function ProjectChatSection({
  projectId,
  currentUserId,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const [deleteMessageId, setDeleteMessageId] = useState<string | null>(null);
  const [deletingMessage, setDeletingMessage] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // Load initial messages + subscribe to realtime inserts
  useEffect(() => {
    let isMounted = true;

    async function loadMessages() {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("project_messages")
        .select(
          `
          id,
          project_id,
          user_id,
          content,
          created_at,
          profiles (
            id,
            full_name,
            company
          )
        `
        )
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });

      if (!isMounted) return;

      if (error) {
        console.error(error);
        setErrorMsg("Kunde inte hämta chattmeddelanden.");
      } else {
        setMessages((data || []) as unknown as ChatMessage[]);
      }

      setLoading(false);
    }

    loadMessages();

    // Supabase Realtime subscription for new messages
    const channel = supabase
      .channel(`project-messages-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "project_messages",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          // we'll get it without joined profile here; reload profile if needed
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!currentUserId) {
      setErrorMsg("Du måste vara inloggad för att skriva i chatten.");
      return;
    }
    const text = input.trim();
    if (!text) return;

    setSending(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase
        .from("project_messages")
        .insert({
          project_id: projectId,
          user_id: currentUserId,
          content: text,
        })
        .select(
          `
          id,
          project_id,
          user_id,
          content,
          created_at,
          profiles (
            id,
            full_name,
            company
          )
        `
        )
        .single();

      if (error) {
        console.error(error);
        setErrorMsg("Kunde inte skicka meddelande.");
        return;
      }

      // Optimistic update with full row (including profile)
      setMessages((prev) => [...prev, data as unknown as ChatMessage]);
      setInput("");
    } catch (err) {
      console.error(err);
      setErrorMsg("Tekniskt fel vid skickande.");
    } finally {
      setSending(false);
    }
  }

  async function handleDeleteMessage(id: string) {
    setErrorMsg(null);
    setDeletingMessage(true);

    try {
      const { error } = await supabase
        .from("project_messages")
        .delete()
        .eq("id", id);

      if (error) {
        console.error(error);
        setErrorMsg("Kunde inte ta bort meddelandet.");
        return;
      }

      setMessages((prev) => prev.filter((m) => m.id !== id));
      setDeleteMessageId(null);
    } catch (err) {
      console.error(err);
      setErrorMsg("Tekniskt fel vid borttagning.");
    } finally {
      setDeletingMessage(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col h-[360px]">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-100">Chatt</h2>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 space-y-2 text-xs">
        {loading && <p className="text-slate-400">Hämtar meddelanden…</p>}

        {!loading && messages.length === 0 && (
          <p className="text-slate-500">
            Inga meddelanden ännu. Skriv det första meddelandet för att starta
            chatten.
          </p>
        )}

        {messages.map((msg) => {
          const isMine = msg.user_id === currentUserId;
          const senderName =
            msg.profiles?.full_name || (isMine ? "Du" : "Okänd användare");

          return (
            <div
              key={msg.id}
              className={"flex " + (isMine ? "justify-end" : "justify-start")}
            >
              <div
                className={
                  "max-w-[80%] rounded-xl px-3 py-2 " +
                  (isMine
                    ? "bg-sky-500 text-slate-950"
                    : "bg-slate-800 text-slate-100")
                }
              >
                <div className="mb-0.5 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold">
                    {senderName}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] opacity-70">
                      {new Date(msg.created_at).toLocaleTimeString("sv-SE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {isMine && (
                      <button
                        type="button"
                        onClick={() => setDeleteMessageId(msg.id)}
                        className="text-[9px] opacity-80 hover:opacity-100 hover:underline cursor-pointer"
                      >
                        Ta bort
                      </button>
                    )}
                  </div>
                </div>
                <p className="whitespace-pre-wrap text-[11px]">{msg.content}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {errorMsg && <p className="mt-2 text-[11px] text-red-400">{errorMsg}</p>}

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="mt-2 flex items-center gap-2 text-xs"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            currentUserId
              ? "Skriv ett meddelande…"
              : "Logga in för att kunna skriva…"
          }
          disabled={!currentUserId || sending}
          className="flex-1 rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-100 outline-none placeholder-slate-500 focus:border-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!currentUserId || sending || !input.trim()}
          className="rounded-lg bg-sky-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          {sending ? "Skickar…" : "Skicka"}
        </button>
      </form>

      <ConfirmDialog
        open={deleteMessageId !== null}
        title="Ta bort meddelande"
        description="Är du säker på att du vill ta bort detta meddelande?"
        confirmLabel="Ta bort"
        cancelLabel="Avbryt"
        variant="danger"
        loading={deletingMessage}
        onClose={() => {
          if (!deletingMessage) setDeleteMessageId(null);
        }}
        onConfirm={() => {
          if (deleteMessageId) {
            void handleDeleteMessage(deleteMessageId);
          }
        }}
      />
    </div>
  );
}
