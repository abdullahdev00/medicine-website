import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  iconColor?: string;
  testId?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  iconColor = "primary",
  testId = "button-empty-action",
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center py-16 bg-background"
    >
      <div className="p-12 text-center space-y-6 max-w-md w-full bg-background">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-${iconColor}/20 to-${iconColor}/5 flex items-center justify-center`}
        >
          <Icon className={`w-12 h-12 text-${iconColor}`} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h3 className="font-serif text-2xl font-bold text-foreground">
            {title}
          </h3>
          <p className="text-muted-foreground text-base leading-relaxed">
            {description}
          </p>
        </motion.div>

        {actionLabel && onAction && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={onAction}
              size="lg"
              className="rounded-full px-8 h-14 text-base font-semibold shadow-lg"
              data-testid={testId}
            >
              {actionLabel}
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
