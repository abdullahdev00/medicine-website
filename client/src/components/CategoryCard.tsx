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
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="flex-shrink-0"
    >
      <Card
        className="cursor-pointer border-2 hover:border-primary/50 transition-all rounded-2xl hover-elevate active-elevate-2 min-w-[110px]"
        onClick={onClick}
        data-testid={`card-category-${name.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <IconComponent className="w-5 h-5 text-primary" />
          </div>
          <p className="font-semibold text-xs leading-tight">{name}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
