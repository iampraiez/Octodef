"use client";
import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { toast } from "sonner";
import axios from "axios";

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post("/api/feedback", {
        message: message.trim(),
        email: email.trim() || undefined,
        name: name.trim() || undefined,
      });

      toast.success("Feedback submitted! Thank you!");
      setMessage("");
      setEmail("");
      setName("");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to submit feedback");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-500 text-white rounded-full p-4 shadow-[0_0_40px_-10px_rgba(37,99,235,0.8)] transition-all duration-300 hover:scale-110 hover:-translate-y-1"
          aria-label="Open feedback"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Feedback Form */}
      {isOpen && (
        <div className="fixed bottom-8 right-8 z-50 w-[350px] bg-[#111]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_50px_-10px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="text-white font-semibold">Send Feedback</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            <div>
              <Input
                type="text"
                placeholder="Name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-black/50 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            <div>
              <Input
                type="email"
                placeholder="Email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/50 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>

            <div>
              <Textarea
                placeholder="Your feedback..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="bg-black/50 border-white/10 text-white placeholder:text-gray-500 resize-none"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white"
            >
              {isSubmitting ? (
                "Sending..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Feedback
                </>
              )}
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
