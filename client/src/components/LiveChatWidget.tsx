import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { shouldShowMobileNav } from "@/lib/mobileNav";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const quickReplies = [
  "Comment démarrer gratuitement ?",
  "Quelles fonctionnalités sont disponibles ?",
  "Comment connecter mon LinkedIn ?",
  "Comment générer du contenu IA ?",
];

const botResponses: Record<string, string> = {
  "essai": "LinkedAgents est entièrement gratuit pour l'instant. Créez un compte et accédez à toutes les fonctionnalités sans carte bancaire.",
  "plan": "Toutes les fonctionnalités sont actuellement gratuites : générations IA, publication automatique, analytics et plus encore.",
  "linkedin": "Pour connecter votre LinkedIn, utilisez le bouton « Connecter LinkedIn » dans le Dashboard ou les paramètres. La connexion est sécurisée via OAuth.",
  "generer": "Rendez-vous sur /generate pour créer un post avec l'IA. Choisissez un thème, un ton et laissez Léa rédiger pour vous.",
  "fonctionnalite": "Vous pouvez générer du contenu IA, planifier des posts, connecter LinkedIn pour publier, et explorer les classements de créateurs.",
  "annuler": "Aucun abonnement n'est requis pour l'instant. Profitez librement de toutes les fonctionnalités !",
  "default": "Je suis l'assistant FAQ de LinkedAgents. Posez une question ou utilisez les suggestions ci-dessous.",
};

function getBotResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes("essai") || lowerMessage.includes("gratuit")) {
    return botResponses.essai;
  }
  if (lowerMessage.includes("plan") || lowerMessage.includes("différence") || lowerMessage.includes("prix")) {
    return botResponses.plan;
  }
  if (lowerMessage.includes("générer") || lowerMessage.includes("generer") || lowerMessage.includes("contenu")) {
    return botResponses.generer;
  }
  if (lowerMessage.includes("fonctionnalit") || lowerMessage.includes("disponible")) {
    return botResponses.fonctionnalite;
  }
  if (lowerMessage.includes("linkedin") || lowerMessage.includes("connecter")) {
    return botResponses.linkedin;
  }
  if (lowerMessage.includes("annuler") || lowerMessage.includes("engagement")) {
    return botResponses.annuler;
  }
  return botResponses.default;
}

export function LiveChatWidget() {
  const [location] = useLocation();
  const hasMobileNav = shouldShowMobileNav(location);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Bonjour. Je suis l'assistant FAQ de LinkedAgents. Posez une question sur l'utilisation de la plateforme.",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text,
      isBot: false,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate bot typing
    setIsTyping(true);
    setTimeout(() => {
      const botMessage: Message = {
        id: messages.length + 2,
        text: getBotResponse(text),
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: "spring" }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed right-4 z-50 rounded-full p-3.5 shadow-2xl transition-all md:bottom-6 md:right-6 md:p-4",
          hasMobileNav ? "floating-above-mobile-nav" : "bottom-4",
          "bg-gradient-to-r from-violet to-violet-light hover:opacity-90",
          isOpen && "hidden"
        )}
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              "fixed right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-white/10 bg-card shadow-2xl md:bottom-6 md:right-6",
              hasMobileNav ? "floating-above-mobile-nav" : "bottom-4"
            )}
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-violet to-violet-light flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-white/20">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Assistant FAQ</h3>
                  <p className="text-xs text-white/80">Réponses automatisées</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="h-[300px] overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    message.isBot ? "justify-start" : "justify-end"
                  )}
                >
                  {message.isBot && (
                    <div className="p-1.5 rounded-full bg-violet/20 h-fit">
                      <Bot className="w-4 h-4 text-violet-light" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] p-3 rounded-2xl text-sm",
                      message.isBot
                        ? "bg-white/5 text-white rounded-tl-none"
                        : "bg-violet text-white rounded-tr-none"
                    )}
                  >
                    {message.text}
                  </div>
                  {!message.isBot && (
                    <div className="p-1.5 rounded-full bg-violet/20 h-fit">
                      <User className="w-4 h-4 text-violet-light" />
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-2 justify-start">
                  <div className="p-1.5 rounded-full bg-violet/20 h-fit">
                    <Bot className="w-4 h-4 text-violet-light" />
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-violet-light rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-violet-light rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-violet-light rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Replies */}
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => sendMessage(reply)}
                    className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-muted-foreground hover:bg-violet/20 hover:text-violet-light transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="flex-1 h-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-10 w-10 bg-violet hover:bg-violet-light"
                  disabled={!inputValue.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>

            {/* Powered by */}
            <div className="px-4 pb-3 flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Sparkles className="w-3 h-3" />
              Assistant automatisé — pas de support humain en direct
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
