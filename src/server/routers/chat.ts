import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { getSupabase } from "@/lib/supabaseClient";

export const chatRouter = router({
  list: publicProcedure.query(async () => {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("messages")
      .select("id, text, type, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  }),

  sendMessage: publicProcedure
    .input(z.object({ text: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const supabase = getSupabase();
      if (supabase) {
        const { error } = await supabase.from("messages").insert({
          text: input.text,
          created_at: new Date().toISOString(),
          type: "text",
          user_id: ctx.userId ?? null,
        });
        if (error) throw new Error(error.message);
      }

      // Generate Gemini Cloud Assist reply
      const textApiKey = process.env.GEMINI_API_KEY_TEXT || process.env.GEMINI_API_KEY_IMAGE;
      let reply = "";
      if (textApiKey) {
        try {
          const res = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
            {
              method: "POST",
              headers: { 
                "Content-Type": "application/json", 
                "x-goog-api-key": textApiKey 
              },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [{ text: input.text }],
                  },
                ],
                generationConfig: {
                  temperature: 0.7,
                  topK: 40,
                  topP: 0.95,
                  maxOutputTokens: 1024,
                },
              }),
            }
          );
          
          if (!res.ok) {
            const errorData = await res.json();
            console.error("Gemini API error response:", errorData);
            throw new Error(`API request failed: ${res.status} ${res.statusText}`);
          }
          
          const data: {
            candidates?: Array<{
              content?: { parts?: Array<{ text?: string }> };
            }>;
            output_text?: string;
          } = await res.json();
          
          console.log("Gemini API response:", data);
          
          const parts = data?.candidates?.[0]?.content?.parts ?? [];
          reply =
            parts
              .map((p) => p?.text)
              .filter((t): t is string => Boolean(t))
              .join("\n") ||
            data?.output_text ||
            "";
        } catch (error) {
          console.error("Gemini API error:", error);
          reply = "";
        }
      }

      if (!reply) {
        reply = "Thanks! I received your message.";
      }

      if (supabase) {
        const { error: insertErr } = await supabase.from("messages").insert({
          text: reply,
          created_at: new Date().toISOString(),
          type: "text",
          user_id: ctx.userId ?? null,
        });
        if (insertErr) throw new Error(insertErr.message);
      }

      return { success: true, reply };
    }),

  clearChat: publicProcedure.mutation(async () => {
    const supabase = getSupabase();
    if (!supabase) return { success: true };
    
    const { error } = await supabase
      .from("messages")
      .delete()
      .gt('created_at', '1900-01-01'); // Delete all messages using a date condition
    
    if (error) throw new Error(error.message);
    return { success: true };
  }),
});
