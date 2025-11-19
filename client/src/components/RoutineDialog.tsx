import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, X, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface RoutineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routineId?: number;
  onSuccess?: () => void;
}

interface RoutineExercise {
  id: string;
  exerciseId: number;
  sets: number;
  reps: number;
  order: number;
}

function SortableExerciseItem({ 
  exercise, 
  exercises, 
  onRemove 
}: { 
  exercise: RoutineExercise; 
  exercises: any[];
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: exercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const exerciseData = exercises.find(e => e.id === exercise.exerciseId);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 bg-secondary/30 rounded-lg"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <p className="font-medium text-sm">{exerciseData?.name || 'Exercício'}</p>
        <p className="text-xs text-muted-foreground">
          {exercise.sets} séries × {exercise.reps} reps
        </p>
      </div>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={onRemove}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default function RoutineDialog({ open, onOpenChange, routineId, onSuccess }: RoutineDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [routineExercises, setRoutineExercises] = useState<RoutineExercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");

  const { data: exercises } = trpc.exercises.list.useQuery();
  const utils = trpc.useUtils();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const createMutation = trpc.routines.create.useMutation({
    onSuccess: () => {
      toast.success("Rotina criada com sucesso!");
      utils.routines.list.invalidate();
      onOpenChange(false);
      resetForm();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Erro ao criar rotina: ${error.message}`);
    },
  });

  const updateMutation = trpc.routines.update.useMutation({
    onSuccess: () => {
      toast.success("Rotina atualizada com sucesso!");
      utils.routines.list.invalidate();
      onOpenChange(false);
      resetForm();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar rotina: ${error.message}`);
    },
  });

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setRoutineExercises([]);
    setSelectedExerciseId("");
    setSets("3");
    setReps("10");
  };

  const handleAddExercise = () => {
    if (!selectedExerciseId) {
      toast.error("Selecione um exercício");
      return;
    }

    const newExercise: RoutineExercise = {
      id: `${Date.now()}`,
      exerciseId: parseInt(selectedExerciseId),
      sets: parseInt(sets) || 3,
      reps: parseInt(reps) || 10,
      order: routineExercises.length,
    };

    setRoutineExercises([...routineExercises, newExercise]);
    setSelectedExerciseId("");
    setSets("3");
    setReps("10");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setRoutineExercises((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        return newItems.map((item, index) => ({ ...item, order: index }));
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Nome da rotina é obrigatório");
      return;
    }

    if (routineExercises.length === 0) {
      toast.error("Adicione pelo menos um exercício");
      return;
    }

    const data = {
      name: name.trim(),
      description: description.trim() || undefined,
      exercises: routineExercises.map(ex => ({
        exerciseId: ex.exerciseId,
        sets: ex.sets,
        reps: ex.reps,
        order: ex.order,
      })),
    };

    if (routineId) {
      updateMutation.mutate({ id: routineId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {routineId ? "Editar Rotina" : "Nova Rotina"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Rotina *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Treino A - Peito e Tríceps"
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição opcional da rotina"
                rows={2}
              />
            </div>

            <div className="border-t pt-4">
              <Label className="mb-3 block">Adicionar Exercícios</Label>
              
              <div className="grid grid-cols-[1fr_80px_80px_auto] gap-2 mb-4">
                <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione exercício" />
                  </SelectTrigger>
                  <SelectContent>
                    {exercises?.map((ex) => (
                      <SelectItem key={ex.id} value={ex.id.toString()}>
                        {ex.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Input
                  type="number"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                  placeholder="Séries"
                  min="1"
                />
                
                <Input
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  placeholder="Reps"
                  min="1"
                />
                
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddExercise}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {routineExercises.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    Arraste para reordenar
                  </p>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={routineExercises.map(e => e.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {routineExercises.map((exercise) => (
                        <SortableExerciseItem
                          key={exercise.id}
                          exercise={exercise}
                          exercises={exercises || []}
                          onRemove={() => {
                            setRoutineExercises(routineExercises.filter(e => e.id !== exercise.id));
                          }}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
              )}
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
              {routineId ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
