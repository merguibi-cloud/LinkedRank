import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Calendar, Clock, Zap, Shield, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type { Agent } from "@/../../shared/agentTypes";

type ScheduleDay = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

const DAYS: { value: ScheduleDay; label: string; short: string }[] = [
  { value: "monday", label: "Lundi", short: "Lun" },
  { value: "tuesday", label: "Mardi", short: "Mar" },
  { value: "wednesday", label: "Mercredi", short: "Mer" },
  { value: "thursday", label: "Jeudi", short: "Jeu" },
  { value: "friday", label: "Vendredi", short: "Ven" },
  { value: "saturday", label: "Samedi", short: "Sam" },
  { value: "sunday", label: "Dimanche", short: "Dim" },
];

const HOURS = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"
];

const OPTIMAL_HOURS = ["08:00", "12:00", "17:00", "18:00"];

interface AgentScheduleModalProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AgentScheduleModal({ agent, isOpen, onClose, onSuccess }: AgentScheduleModalProps) {
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [selectedDays, setSelectedDays] = useState<ScheduleDay[]>(["tuesday", "wednesday", "thursday"]);
  const [selectedHours, setSelectedHours] = useState<string[]>(["08:00", "12:00"]);
  const [tasksPerDay, setTasksPerDay] = useState(1);
  const [autonomyLevel, setAutonomyLevel] = useState<"supervised" | "semi_autonomous" | "autonomous">("supervised");
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load agent's current schedule
  useEffect(() => {
    if (agent) {
      setScheduleEnabled(agent.scheduleEnabled || false);
      setSelectedDays(agent.scheduleDays || ["tuesday", "wednesday", "thursday"]);
      setSelectedHours(agent.scheduleHours || ["08:00", "12:00"]);
      setTasksPerDay(agent.tasksPerDay || 1);
      setAutonomyLevel(agent.autonomyLevel || "supervised");
      setRequiresApproval(agent.requiresApproval ?? true);
    }
  }, [agent]);

  const updateSchedule = trpc.agents.updateSchedule.useMutation({
    onSuccess: () => {
      toast.success("Planification mise à jour", {
        description: scheduleEnabled 
          ? "L'agent générera automatiquement du contenu selon le calendrier."
          : "La planification automatique a été désactivée.",
      });
      onSuccess();
      onClose();
      setIsSaving(false);
    },
    onError: (error) => {
      toast.error("Erreur", { description: error.message });
      setIsSaving(false);
    },
  });

  const updateAutonomy = trpc.agents.updateAutonomy.useMutation({
    onSuccess: () => {
      toast.success("Mode autonome mis à jour", {
        description: autonomyLevel === "autonomous" && !requiresApproval
          ? "L'agent publiera automatiquement sans approbation."
          : "L'agent demandera votre approbation avant de publier.",
      });
    },
    onError: (error) => {
      toast.error("Erreur", { description: error.message });
    },
  });

  const toggleDay = (day: ScheduleDay) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const toggleHour = (hour: string) => {
    if (selectedHours.includes(hour)) {
      setSelectedHours(selectedHours.filter(h => h !== hour));
    } else {
      setSelectedHours([...selectedHours, hour].sort());
    }
  };

  const handleSave = async () => {
    if (!agent) return;
    setIsSaving(true);

    // Update schedule
    await updateSchedule.mutateAsync({
      agentId: agent.id,
      scheduleEnabled,
      scheduleDays: selectedDays,
      scheduleHours: selectedHours,
      scheduleTimezone: "Europe/Paris",
      tasksPerDay,
    });

    // Update autonomy
    await updateAutonomy.mutateAsync({
      agentId: agent.id,
      autonomyLevel,
      requiresApproval,
    });
  };

  const getWeeklyTaskCount = () => {
    return selectedDays.length * selectedHours.length * tasksPerDay;
  };

  if (!agent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Planification automatique - {agent.name}
          </DialogTitle>
          <DialogDescription>
            Configurez quand et comment l'agent génère du contenu automatiquement
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Enable/Disable Schedule */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label className="text-base font-semibold">Planification automatique</Label>
                <p className="text-sm text-muted-foreground">
                  L'agent génère du contenu selon le calendrier
                </p>
              </div>
            </div>
            <Switch 
              checked={scheduleEnabled}
              onCheckedChange={setScheduleEnabled}
            />
          </div>

          {scheduleEnabled && (
            <>
              {/* Days Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Jours de génération</Label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => (
                    <Button
                      key={day.value}
                      variant={selectedDays.includes(day.value) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleDay(day.value)}
                      className="min-w-[60px]"
                    >
                      {day.short}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommandé : Mardi, Mercredi, Jeudi (meilleur engagement)
                </p>
              </div>

              {/* Hours Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Heures de génération</Label>
                <div className="flex flex-wrap gap-2">
                  {HOURS.map((hour) => (
                    <Button
                      key={hour}
                      variant={selectedHours.includes(hour) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleHour(hour)}
                      className={`min-w-[60px] ${OPTIMAL_HOURS.includes(hour) ? "ring-1 ring-green-500/50" : ""}`}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {hour}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                  Heures optimales : 8h, 12h, 17h, 18h
                </p>
              </div>

              {/* Tasks per day */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Tâches par créneau</Label>
                  <Badge variant="secondary">{tasksPerDay}</Badge>
                </div>
                <Slider
                  value={[tasksPerDay]}
                  onValueChange={([value]) => setTasksPerDay(value)}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Estimation : {getWeeklyTaskCount()} tâches/semaine
                </p>
              </div>
            </>
          )}

          {/* Autonomy Section */}
          <div className="border-t pt-6 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <Label className="text-base font-semibold">Mode autonome</Label>
            </div>

            {/* Autonomy Level */}
            <div className="space-y-3">
              <Select 
                value={autonomyLevel} 
                onValueChange={(value: "supervised" | "semi_autonomous" | "autonomous") => {
                  setAutonomyLevel(value);
                  if (value === "supervised") {
                    setRequiresApproval(true);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supervised">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <div>
                        <span className="font-medium">Supervisé</span>
                        <span className="text-xs text-muted-foreground ml-2">Approbation requise</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="semi_autonomous">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <div>
                        <span className="font-medium">Semi-autonome</span>
                        <span className="text-xs text-muted-foreground ml-2">Approbation pour les actions importantes</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="autonomous">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <div>
                        <span className="font-medium">Autonome</span>
                        <span className="text-xs text-muted-foreground ml-2">Publication automatique</span>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Requires Approval Toggle */}
            {autonomyLevel !== "supervised" && (
              <div className="flex items-center justify-between p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
                <div>
                  <Label className="text-base font-semibold">Publication sans approbation</Label>
                  <p className="text-sm text-muted-foreground">
                    L'agent publie directement sur LinkedIn
                  </p>
                </div>
                <Switch 
                  checked={!requiresApproval}
                  onCheckedChange={(checked) => setRequiresApproval(!checked)}
                />
              </div>
            )}

            {autonomyLevel === "autonomous" && !requiresApproval && (
              <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-500">Mode autonome activé</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      L'agent publiera automatiquement sur LinkedIn sans demander votre approbation.
                      Assurez-vous d'avoir bien configuré ses paramètres.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          {scheduleEnabled && (
            <div className="p-4 rounded-lg bg-muted/50 border">
              <h4 className="font-semibold mb-2">Résumé de la planification</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Jours : {selectedDays.map(d => DAYS.find(day => day.value === d)?.short).join(", ") || "Aucun"}</li>
                <li>• Heures : {selectedHours.join(", ") || "Aucune"}</li>
                <li>• Tâches par semaine : {getWeeklyTaskCount()}</li>
                <li>• Mode : {autonomyLevel === "supervised" ? "Supervisé" : autonomyLevel === "semi_autonomous" ? "Semi-autonome" : "Autonome"}</li>
                <li>• Approbation : {requiresApproval ? "Requise" : "Automatique"}</li>
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              "Enregistrer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
