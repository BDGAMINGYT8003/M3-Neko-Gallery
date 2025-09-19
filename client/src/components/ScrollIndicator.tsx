import { motion } from 'framer-motion';

interface ScrollIndicatorProps {
  totalItems: number;
  lastVisibleIndex: number;
}

export default function ScrollIndicator({ totalItems, lastVisibleIndex }: ScrollIndicatorProps) {
  const progress = totalItems > 0 ? (lastVisibleIndex + 1) / totalItems : 0;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left"
      style={{ scaleX: progress }}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: progress }}
      transition={{ duration: 0.2 }}
    />
  );
}
