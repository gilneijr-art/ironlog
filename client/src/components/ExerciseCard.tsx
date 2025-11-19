import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell } from "lucide-react";

interface ExerciseCardProps {
  name: string;
  muscleGroup?: string;
  equipmentType?: string;
  onClick?: () => void;
}

export default function ExerciseCard({ name, muscleGroup, equipmentType, onClick }: ExerciseCardProps) {
  const equipmentLabels: Record<string, string> = {
    barbell: "Barra",
    dumbbell: "Halter",
    machine: "Máquina",
    cable: "Polia",
    bodyweight: "Peso Corporal",
    other: "Outro",
  };

  return (
    <Card 
      className="p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Dumbbell className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{name}</h3>
          <div className="flex gap-2 mt-1 flex-wrap">
            {muscleGroup && (
              <Badge variant="secondary" className="text-xs">
                {muscleGroup}
              </Badge>
            )}
            {equipmentType && (
              <Badge variant="outline" className="text-xs">
                {equipmentLabels[equipmentType] || equipmentType}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
