import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";

interface CategoryCardProps {
  name: string;
  icon: string;
  onClick?: () => void;
}

export function CategoryCard({ name, icon, onClick }: CategoryCardProps) {
  const IconComponent = (Icons as any)[icon] || Icons.Package;
  
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="cursor-pointer border-2 hover:border-primary/50 transition-all rounded-xl hover-elevate active-elevate-2"
        onClick={onClick}
        data-testid={`card-category-${name.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <IconComponent className="w-6 h-6 text-primary" />
          </div>
          <p className="font-semibold text-sm leading-tight">{name}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
