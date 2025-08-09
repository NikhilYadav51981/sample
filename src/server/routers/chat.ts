
import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { getSupabase } from "@/lib/supabaseClient";

export const chatRouter = router({
  list: publicProcedure.query(async () => {
    const supabase = getSupabase();
    if (!supabase) return [];
    
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("id, text, type, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) {
        console.error("Supabase query error:", error);
        return [];
      }
      
      return data ?? [];
    } catch (error) {
      console.error("Database connection error:", error);
      return [];
    }
  }),

  sendMessage: publicProcedure
    .input(z.object({ text: z.string().min(1).max(4000) }))
    .mutation(async ({ ctx, input }) => {
      const supabase = getSupabase();
      
      // Store user message
      if (supabase) {
        try {
          const { error } = await supabase.from("messages").insert({
            text: input.text,
            created_at: new Date().toISOString(),
            type: "text",
            user_id: ctx.userId ?? null,
          });
          if (error) console.error("Error storing user message:", error);
        } catch (error) {
          console.error("Database insert error:", error);
        }
      }

      // Generate Gemini AI reply
      GEMINI_API_KEY_TEXT=AIzaSyDeAeTxy7g1URnMLkxSz1ugZpiApZQl7dY
      GEMINI_API_KEY_IMAGE=AIzaSyDeAeTxy7g1URnMLkxSz1ugZpiApZQl7dY
      const textApiKey = process.env.GEMINI_API_KEY_TEXT || process.env.GEMINI_API_KEY_IMAGE;
      console.log("Environment check - Gemini API Key available:", !!textApiKey);
      console.log("Environment check - All env vars:", Object.keys(process.env).filter(key => key.includes('GEMINI')));
      
      let reply = "";
      
      if (!textApiKey) {
        console.error("❌ No Gemini API key found in environment variables");
        reply = "I'm sorry, but I'm not properly configured to respond right now. Please check the API key configuration.";
      } else {
        try {
          console.log("🔄 Making request to Gemini API...");
          
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${textApiKey}`,
            {
              method: "POST",
              headers: { 
                "Content-Type": "application/json"
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
                safetySettings: [
                  {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                  },
                  {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                  }
                ]
              }),
            }
          );
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Gemini API error:", response.status, response.statusText, errorText);
            
            if (response.status === 400) {
              reply = "I couldn't process your request. Please try rephrasing your message.";
            } else if (response.status === 403) {
              reply = "I'm not authorized to respond right now. Please check the API key permissions.";
            } else {
              reply = "I'm experiencing technical difficulties. Please try again in a moment.";
            }
          } else {
            const data = await response.json();
            console.log("✅ Gemini API response received:", data);
            
            const candidates = data?.candidates;
            if (candidates && candidates.length > 0) {
              const content = candidates[0]?.content;
              if (content && content.parts && content.parts.length > 0) {
                reply = content.parts
                  .map((part: any) => part?.text)
                  .filter((text: string) => text && text.trim())
                  .join("\n")
                  .trim();
              }
            }
            
            if (!reply) {
              console.warn("⚠️ No valid response content from Gemini API");
              reply = "I received your message but couldn't generate a proper response. Please try again.";
            }
          }
        } catch (error) {
          console.error("❌ Network/API error:", error);
          reply = "I'm having trouble connecting to my AI service. Please check your internet connection and try again.";
        }
      }

      // Fallback response
      if (!reply || reply.trim() === "") {
        reply = "Thanks! I received your message, but I'm having trouble generating a response right now.";
      }

      // Store AI reply
      if (supabase && reply) {
        try {
          const { error: insertErr } = await supabase.from("messages").insert({
            text: reply,
            created_at: new Date().toISOString(),
            type: "text",
            user_id: ctx.userId ?? null,
          });
          if (insertErr) console.error("Error storing AI reply:", insertErr);
        } catch (error) {
          console.error("Database insert error for reply:", error);
        }
      }

      console.log("✅ Sending reply:", reply.substring(0, 100) + "...");
      return { success: true, reply };
    }),

  clearChat: publicProcedure.mutation(async () => {
    const supabase = getSupabase();
    if (!supabase) return { success: true };
    
    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .gt('created_at', '1900-01-01');
      
      if (error) {
        console.error("Error clearing chat:", error);
        throw new Error(error.message);
      }
      
      return { success: true };
    } catch (error) {
      console.error("Clear chat error:", error);
      return { success: false, error: "Failed to clear chat" };
    }
  }),
});
