import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function Welcome() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full text-center space-y-8"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center"
        >
          <div className="bg-primary/10 p-8 rounded-3xl">
            <Activity className="w-24 h-24 text-primary" strokeWidth={1.5} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-foreground tracking-tight">
            MediSwift
          </h1>
          <p className="text-2xl md:text-3xl text-primary font-medium">
            Your Health, Delivered.
          </p>
          <p className="text-muted-foreground text-base leading-relaxed max-w-sm mx-auto">
            Order authentic medicines and health products with fast, reliable delivery across Pakistan.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            size="lg"
            className="rounded-xl px-12 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            onClick={() => setLocation("/login")}
            data-testid="button-get-started"
          >
            Get Started
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-sm text-muted-foreground"
        >
          Trusted by thousands across Pakistan
        </motion.p>
      </motion.div>
    </div>
  );
}
