import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseId?: number;
  onSuccess?: () => void;
}

export default function ExerciseDialog({ open, onOpenChange, exerciseId, onSuccess }: ExerciseDialogProps) {
  const [name, setName] = useState("");
  const [muscleGroupId, setMuscleGroupId] = useState<string>("");
  const [equipmentType, setEquipmentType] = useState<string>("");

  const { data: muscleGroups } = trpc.exercises.muscleGroups.useQuery();

  const utils = trpc.useUtils();

  const createMutation = trpc.exercises.create.useMutation({
    onSuccess: () => {
      toast.success("Exercício criado com sucesso!");
      utils.exercises.list.invalidate();
      onOpenChange(false);
      resetForm();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Erro ao criar exercício: ${error.message}`);
    },
  });

  const updateMutation = trpc.exercises.update.useMutation({
    onSuccess: () => {
      toast.success("Exercício atualizado com sucesso!");
      utils.exercises.list.invalidate();
      onOpenChange(false);
      resetForm();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar exercício: ${error.message}`);
    },
  });

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setName("");
    setMuscleGroupId("");
    setEquipmentType("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Nome do exercício é obrigatório");
      return;
    }

    const data = {
      name: name.trim(),
      muscleGroupId: muscleGroupId ? parseInt(muscleGroupId) : undefined,
      equipmentType: equipmentType ? (equipmentType as "barbell" | "dumbbell" | "machine" | "cable" | "bodyweight" | "other") : undefined,
    };

    if (exerciseId) {
      updateMutation.mutate({ id: exerciseId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const equipmentOptions = [
    { value: "barbell", label: "Barra" },
    { value: "dumbbell", label: "Halter" },
    { value: "machine", label: "Máquina" },
    { value: "cable", label: "Polia" },
    { value: "bodyweight", label: "Peso Corporal" },
    { value: "other", label: "Outro" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {exerciseId ? "Editar Exercício" : "Novo Exercício"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Exercício *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Supino Reto"
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="muscleGroup">Grupo Muscular</Label>
              <Select value={muscleGroupId} onValueChange={setMuscleGroupId}>
                <SelectTrigger id="muscleGroup">
                  <SelectValue placeholder="Selecione um grupo" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {muscleGroups?.map((group) => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="equipment">Equipamento</Label>
              <Select value={equipmentType} onValueChange={setEquipmentType}>
                <SelectTrigger id="equipment">
                  <SelectValue placeholder="Selecione um equipamento" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {equipmentOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {exerciseId ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
