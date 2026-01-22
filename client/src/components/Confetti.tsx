import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
  size: number;
}

const colors = [
  "#8B5CF6", // violet
  "#EC4899", // rose
  "#F59E0B", // gold
  "#10B981", // emerald
  "#3B82F6", // blue
  "#EF4444", // red
];

export function useConfetti() {
  const [isActive, setIsActive] = useState(false);

  const triggerConfetti = () => {
    setIsActive(true);
    setTimeout(() => setIsActive(false), 3000);
  };

  return { isActive, triggerConfetti };
}

interface ConfettiProps {
  isActive: boolean;
}

export function Confetti({ isActive }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (isActive) {
      const newPieces: ConfettiPiece[] = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
        rotation: Math.random() * 360,
        size: Math.random() * 8 + 4,
      }));
      setPieces(newPieces);
    } else {
      setPieces([]);
    }
  }, [isActive]);

  return (
    <AnimatePresence>
      {isActive && (
        <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{
                x: `${piece.x}vw`,
                y: -20,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                y: "110vh",
                rotate: piece.rotation + 720,
                opacity: [1, 1, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 3,
                delay: piece.delay,
                ease: "linear",
              }}
              style={{
                position: "absolute",
                width: piece.size,
                height: piece.size,
                backgroundColor: piece.color,
                borderRadius: Math.random() > 0.5 ? "50%" : "0%",
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// Success celebration component
export function SuccessCelebration({ 
  show, 
  message = "🎉 Félicitations !" 
}: { 
  show: boolean; 
  message?: string;
}) {
  return (
    <AnimatePresence>
      {show && (
        <>
          <Confetti isActive={show} />
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-[150] flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-gradient-to-r from-violet to-rose text-white px-8 py-4 rounded-2xl shadow-2xl text-2xl font-bold"
            >
              {message}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
