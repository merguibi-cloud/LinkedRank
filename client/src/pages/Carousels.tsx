import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Layers,
  Plus,
  Trash2,
  Loader2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { LinkedInConnectBanner } from "@/components/LinkedInConnectBanner";
import { ToolsQuickNav } from "@/components/tools/ToolsQuickNav";
import { useLocation } from "wouter";

interface GeneratedCarousel {
  id: number;
  title: string;
  topic: string | null;
  slides: any[];
  previewImages: string[];
  status: string | null;
  createdAt: string | Date;
}

export default function Carousels() {
  const [, setLocation] = useLocation();

  const { data: carousels, isLoading: isLoadingCarousels, refetch: refetchCarousels } = trpc.carousels.list.useQuery({
    limit: 20,
    offset: 0,
  });

  const deleteCarouselMutation = trpc.carousels.delete.useMutation({
    onSuccess: () => {
      refetchCarousels();
      toast.success("Carrousel supprimé");
    },
    onError: (error) => {
      toast.error("Erreur", {
        description: error.message,
      });
    },
  });

  const handleDeleteCarousel = (id: number) => {
    if (confirm("Supprimer ce carrousel ?")) {
      deleteCarouselMutation.mutate({ id });
    }
  };

  // Charge ce carrousel dans le générateur unifié pour le finaliser et le publier.
  const handleUseCarousel = (carousel: GeneratedCarousel) => {
    const caption = carousel.slides
      .map(
        (slide: { title?: string; content?: string }, index: number) =>
          `${index + 1}. ${slide.title || "Slide"}\n${slide.content || ""}`
      )
      .join("\n\n")
      .slice(0, 2800);

    sessionStorage.setItem(
      "linkedrank-draft-post",
      JSON.stringify({
        title: carousel.topic || carousel.title,
        content: caption,
        hashtags: ["carrousel", "linkedin"],
        imageUrl: carousel.previewImages?.[0],
      })
    );

    setLocation("/generate");
    toast.success("Carrousel chargé — finalisez et publiez");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ToolsQuickNav />
        <LinkedInConnectBanner />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Layers className="h-7 w-7 text-primary" />
              Mes carrousels
            </h1>
            <p className="text-muted-foreground mt-1">
              Retrouvez vos carrousels générés — créez-en un nouveau depuis le générateur unifié
            </p>
          </div>
          <Button onClick={() => setLocation("/generate")} className="btn-gradient gap-2">
            <Plus className="h-4 w-4" />
            Créer un carrousel
          </Button>
        </div>

        {isLoadingCarousels ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : carousels && carousels.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {carousels.map((carousel: GeneratedCarousel) => (
              <Card key={carousel.id} className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                <div className="aspect-[4/5] relative">
                  {carousel.previewImages && carousel.previewImages.length > 0 ? (
                    <img
                      src={carousel.previewImages[0]}
                      alt={carousel.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Layers className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                  )}
                  <Badge className="absolute top-2 right-2">
                    {carousel.slides?.length || 0} slides
                  </Badge>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-medium truncate">{carousel.title}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {new Date(carousel.createdAt).toLocaleDateString("fr-FR")}
                  </p>

                  <div className="flex gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleUseCarousel(carousel)}
                    >
                      Utiliser <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCarousel(carousel.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="py-12 text-center">
              <Layers className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium">Aucun carrousel</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                Créez votre premier carrousel LinkedIn
              </p>
              <Button onClick={() => setLocation("/generate")} className="btn-gradient">
                <Plus className="h-4 w-4 mr-2" />
                Créer un carrousel
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
