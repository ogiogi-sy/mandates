import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Smartphone } from 'lucide-react';

interface ScreenTransitionProps {
  onAdvance: () => void;
}

export function ScreenTransition({ onAdvance }: ScreenTransitionProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (ready) {
      const autoAdvance = setTimeout(onAdvance, 1500);
      return () => clearTimeout(autoAdvance);
    }
  }, [ready, onAdvance]);

  return (
    <div
      className="fixed inset-0 bg-[var(--background-hero)] flex flex-col items-center justify-center cursor-pointer z-50"
      onClick={onAdvance}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-24 h-24 rounded-[var(--radius-xl)] bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-10"
      >
        <Smartphone className="text-white" size={40} />
      </motion.div>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-white/60 mb-2"
        style={{ fontSize: '16px', lineHeight: '22px', fontWeight: 400 }}
      >
        Later that day...
      </motion.p>

      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-white"
      >
        Sophie logs in for the first time
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="text-white/40 mt-10"
        style={{ fontSize: '13px', lineHeight: '16px', fontWeight: 500 }}
      >
        Tap anywhere to continue
      </motion.p>
    </div>
  );
}
