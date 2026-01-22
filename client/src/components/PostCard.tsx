/*
 * DESIGN: Executive Dark Mode - PostCard Component
 * - Glassmorphism card with gold border on hover
 * - Copy button with elegant animation
 * - Language badge (FR/EN)
 */

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface PostCardProps {
  id: number;
  title: string;
  content: string;
  language: "FR" | "EN";
  theme: string;
  mediaType?: "video" | "image";
  mediaSource?: string;
}

export function PostCard({ id, title, content, language, theme, mediaType, mediaSource }: PostCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Post copié dans le presse-papiers !", {
        description: `${title} - prêt à publier sur LinkedIn`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Erreur lors de la copie");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="group relative glass-card rounded-xl p-6 transition-all duration-300 hover:scale-[1.02]"
    >
      {/* Gold border gradient on hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none border-gold-gradient" />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Post number */}
          <span className="text-4xl font-bold text-gold-gradient opacity-30 font-['Playfair_Display']">
            {String(id).padStart(2, '0')}
          </span>
          
          {/* Language badge */}
          <span className={`
            px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider
            ${language === 'FR' 
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }
          `}>
            {language === 'FR' ? '🇫🇷 Français' : '🇬🇧 English'}
          </span>
        </div>
        
        {/* Copy button */}
        <motion.button
          onClick={handleCopy}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
            transition-all duration-300
            ${copied 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 hover:gold-glow'
            }
          `}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copié !
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copier
            </>
          )}
        </motion.button>
      </div>
      
      {/* Title & Theme */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-1 font-['Playfair_Display']">
          {title}
        </h3>
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          Thème : {theme}
        </span>
      </div>
      
      {/* Content preview */}
      <div className="relative">
        <pre className="whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed font-['Inter'] max-h-[300px] overflow-y-auto pr-2">
          {content}
        </pre>
        
        {/* Fade gradient at bottom if content is long */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none" />
      </div>
      
      {/* Media suggestion */}
      {mediaType && mediaSource && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ExternalLink className="w-3 h-3" />
            <span>Média suggéré : </span>
            <span className="text-primary/80">{mediaType === 'video' ? '🎥 Vidéo' : '🖼️ Image'}</span>
            <span className="truncate max-w-[200px]">{mediaSource}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
