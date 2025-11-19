import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Dumbbell, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WorkoutCardProps {
  name: string;
  date: Date;
  totalVolume?: number;
  totalSets?: number;
  onClick?: () => void;
}

export default function WorkoutCard({ name, date, totalVolume, totalSets, onClick }: WorkoutCardProps) {
  return (
    <Card 
      className="p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{name}</h3>
          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formatDistanceToNow(date, { addSuffix: true, locale: ptBR })}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {totalVolume !== undefined && (
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground">{totalVolume} kg</span>
            </div>
          )}
          {totalSets !== undefined && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Dumbbell className="w-4 h-4" />
              <span>{totalSets} séries</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
