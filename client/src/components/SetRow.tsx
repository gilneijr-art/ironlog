import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useState } from "react";

interface SetRowProps {
  setNumber: number;
  previousWeight?: number;
  previousReps?: number;
  onSave: (weight: number, reps: number) => void;
  onDelete?: () => void;
  isCompleted?: boolean;
}

export default function SetRow({ 
  setNumber, 
  previousWeight, 
  previousReps, 
  onSave, 
  onDelete,
  isCompleted = false 
}: SetRowProps) {
  const [weight, setWeight] = useState(previousWeight?.toString() || "");
  const [reps, setReps] = useState(previousReps?.toString() || "");

  const handleSave = () => {
    const w = parseFloat(weight);
    const r = parseInt(reps);
    if (!isNaN(w) && !isNaN(r) && w > 0 && r > 0) {
      onSave(w, r);
    }
  };

  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg ${isCompleted ? 'bg-primary/10' : 'bg-secondary/30'}`}>
      <div className="w-8 text-center font-semibold text-muted-foreground">
        {setNumber}
      </div>
      
      <div className="flex-1 flex gap-2">
        <div className="flex-1">
          <Input
            type="number"
            placeholder="kg"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="text-center bg-background"
            disabled={isCompleted}
          />
        </div>
        
        <div className="flex-1">
          <Input
            type="number"
            placeholder="reps"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="text-center bg-background"
            disabled={isCompleted}
          />
        </div>
      </div>

      {!isCompleted ? (
        <div className="flex gap-1">
          <Button 
            size="sm" 
            variant="default"
            onClick={handleSave}
            disabled={!weight || !reps}
          >
            <Check className="w-4 h-4" />
          </Button>
          {onDelete && (
            <Button 
              size="sm" 
              variant="ghost"
              onClick={onDelete}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      ) : (
        <div className="w-20 text-right">
          <span className="text-sm text-primary font-semibold">
            {weight} kg × {reps}
          </span>
        </div>
      )}
    </div>
  );
}
