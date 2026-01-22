import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Layers, 
  Plus, 
  Sparkles, 
  Download, 
  Trash2, 
  Eye, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  Palette,
  Settings,
  Share2,
  Copy,
  FileImage,
  LayoutGrid,
  Clock,
  FileDown
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// Carousel styles
const CAROUSEL_STYLES = [
  { id: "modern", name: "Moderne", description: "Dégradés colorés et design contemporain", preview: "bg-gradient-to-br from-violet-600 to-pink-500" },
  { id: "minimal", name: "Minimaliste", description: "Design épuré sur fond clair", preview: "bg-gradient-to-br from-gray-100 to-white" },
  { id: "bold", name: "Audacieux", description: "Couleurs vives et contrastes forts", preview: "bg-gradient-to-br from-red-500 to-orange-500" },
  { id: "gradient", name: "Gradient", description: "Dégradés multi-couleurs spectaculaires", preview: "bg-gradient-to-br from-cyan-500 via-purple-500 to-amber-500" },
];

// Slide counts
const SLIDE_COUNTS = [5, 7, 10, 12];

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
  const [activeTab, setActiveTab] = useState<"create" | "library">("create");
  const [topic, setTopic] = useState("");
  const [slideCount, setSlideCount] = useState(7);
  const [style, setStyle] = useState<"modern" | "minimal" | "bold" | "gradient">("modern");
  const [authorTitle, setAuthorTitle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCarousel, setGeneratedCarousel] = useState<{
    slides: any[];
    imageUrls: string[];
  } | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // tRPC queries
  const { data: carousels, isLoading: isLoadingCarousels, refetch: refetchCarousels } = trpc.carousels.list.useQuery({
    limit: 20,
    offset: 0,
  });

  // tRPC mutations
  const generateCarouselMutation = trpc.carousels.generate.useMutation({
    onSuccess: (data) => {
      setGeneratedCarousel({
        slides: data.slides,
        imageUrls: data.imageUrls,
      });
      setIsGenerating(false);
      refetchCarousels();
      toast.success("Carrousel généré !", {
        description: `${data.slides.length} slides créées avec succès`,
      });
    },
    onError: (error) => {
      setIsGenerating(false);
      toast.error("Erreur de génération", {
        description: error.message,
      });
    },
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

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast.error("Veuillez entrer un sujet");
      return;
    }

    setIsGenerating(true);
    setGeneratedCarousel(null);
    setCurrentSlideIndex(0);

    generateCarouselMutation.mutate({
      topic: topic.trim(),
      slideCount,
      style,
      authorTitle: authorTitle || undefined,
    });
  };

  const handleDownloadSlide = (imageUrl: string, index: number) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `carousel-slide-${index + 1}.png`;
    link.click();
    toast.success(`Slide ${index + 1} téléchargée`);
  };

  const handleDownloadAll = () => {
    if (!generatedCarousel) return;
    
    generatedCarousel.imageUrls.forEach((url, index) => {
      setTimeout(() => {
        const link = document.createElement("a");
        link.href = url;
        link.download = `carousel-slide-${index + 1}.png`;
        link.click();
      }, index * 500);
    });
    
    toast.success("Téléchargement de toutes les slides en cours...");
  };

  const handleCopyForLinkedIn = () => {
    toast.info("Publication LinkedIn", {
      description: "Téléchargez les images et uploadez-les sur LinkedIn comme document PDF ou images multiples",
    });
  };

  const handleExportPDF = async () => {
    if (!generatedCarousel) return;
    
    toast.info("Export PDF en cours...", {
      description: "Préparation de votre carrousel au format PDF",
    });

    try {
      // Create a simple PDF-like download by combining images
      // For a real implementation, you'd use a PDF library on the server
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [1080, 1350] // LinkedIn carousel dimensions
      });

      for (let i = 0; i < generatedCarousel.imageUrls.length; i++) {
        if (i > 0) {
          pdf.addPage([1080, 1350]);
        }
        
        // Add image to PDF
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = generatedCarousel.imageUrls[i];
        
        await new Promise((resolve, reject) => {
          img.onload = () => {
            pdf.addImage(img, 'PNG', 0, 0, 1080, 1350);
            resolve(true);
          };
          img.onerror = reject;
        });
      }

      pdf.save(`carousel-${topic.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      toast.success("PDF exporté !", {
        description: "Votre carrousel est prêt à être publié sur LinkedIn",
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error("Erreur d'export", {
        description: "Impossible de générer le PDF. Téléchargez les images individuellement.",
      });
    }
  };

  const handleDeleteCarousel = (id: number) => {
    if (confirm("Supprimer ce carrousel ?")) {
      deleteCarouselMutation.mutate({ id });
    }
  };

  const handleViewCarousel = (carousel: GeneratedCarousel) => {
    setGeneratedCarousel({
      slides: carousel.slides,
      imageUrls: carousel.previewImages,
    });
    setCurrentSlideIndex(0);
    setActiveTab("create");
    setTopic(carousel.topic || carousel.title);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Layers className="h-7 w-7 text-primary" />
              Générateur de Carrousels
            </h1>
            <p className="text-muted-foreground mt-1">
              Créez des carrousels LinkedIn professionnels en quelques clics
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "create" | "library")} className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="create" className="gap-2">
              <Plus className="h-4 w-4" />
              Créer
            </TabsTrigger>
            <TabsTrigger value="library" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              Bibliothèque
              {carousels && carousels.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {carousels.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Create Tab */}
          <TabsContent value="create" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Configuration Panel */}
              <div className="space-y-6">
                {/* Topic */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Sujet du carrousel
                    </CardTitle>
                    <CardDescription>
                      Décrivez le sujet que vous souhaitez traiter
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Input
                      placeholder="Ex: 5 stratégies pour augmenter son engagement LinkedIn"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="bg-background"
                    />
                  </CardContent>
                </Card>

                {/* Style Selection */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Palette className="h-5 w-5 text-primary" />
                      Style visuel
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {CAROUSEL_STYLES.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setStyle(s.id as any)}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            style === s.id
                              ? "border-primary bg-primary/10 ring-2 ring-primary/50"
                              : "border-border/50 hover:border-border"
                          }`}
                        >
                          <div className={`w-full h-12 rounded-lg mb-3 ${s.preview}`} />
                          <p className="font-medium">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.description}</p>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Slide Count */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileImage className="h-5 w-5 text-primary" />
                      Nombre de slides
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      {SLIDE_COUNTS.map((count) => (
                        <button
                          key={count}
                          onClick={() => setSlideCount(count)}
                          className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                            slideCount === count
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted/50 hover:bg-muted"
                          }`}
                        >
                          {count}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Author Title */}
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="h-5 w-5 text-primary" />
                      Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="authorTitle">Titre/Fonction (optionnel)</Label>
                      <Input
                        id="authorTitle"
                        placeholder="Ex: CEO @ MonEntreprise"
                        value={authorTitle}
                        onChange={(e) => setAuthorTitle(e.target.value)}
                        className="bg-background mt-1"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Generate Button */}
                <Button
                  className="w-full h-14 text-lg"
                  onClick={handleGenerate}
                  disabled={isGenerating || !topic.trim()}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Générer le carrousel
                    </>
                  )}
                </Button>
              </div>

              {/* Preview Panel */}
              <div className="space-y-4">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Eye className="h-5 w-5 text-primary" />
                      Aperçu
                    </CardTitle>
                    {generatedCarousel && (
                      <CardDescription>
                        Slide {currentSlideIndex + 1} / {generatedCarousel.imageUrls.length}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {generatedCarousel ? (
                      <div className="space-y-4">
                        {/* Slide Preview */}
                        <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-muted">
                          <img
                            src={generatedCarousel.imageUrls[currentSlideIndex]}
                            alt={`Slide ${currentSlideIndex + 1}`}
                            className="w-full h-full object-cover"
                          />
                          
                          {/* Navigation Arrows */}
                          {generatedCarousel.imageUrls.length > 1 && (
                            <>
                              <button
                                onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                                disabled={currentSlideIndex === 0}
                                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <ChevronLeft className="h-6 w-6" />
                              </button>
                              <button
                                onClick={() => setCurrentSlideIndex(Math.min(generatedCarousel.imageUrls.length - 1, currentSlideIndex + 1))}
                                disabled={currentSlideIndex === generatedCarousel.imageUrls.length - 1}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <ChevronRight className="h-6 w-6" />
                              </button>
                            </>
                          )}
                        </div>

                        {/* Slide Thumbnails */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {generatedCarousel.imageUrls.map((url, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentSlideIndex(index)}
                              className={`flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                currentSlideIndex === index
                                  ? "border-primary ring-2 ring-primary/50"
                                  : "border-transparent opacity-60 hover:opacity-100"
                              }`}
                            >
                              <img
                                src={url}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadSlide(generatedCarousel.imageUrls[currentSlideIndex], currentSlideIndex)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Télécharger cette slide
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={handleDownloadAll}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Tout télécharger
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleExportPDF}
                          >
                            <FileDown className="h-4 w-4 mr-1" />
                            Export PDF
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleCopyForLinkedIn}
                          >
                            <Share2 className="h-4 w-4 mr-1" />
                            Publier sur LinkedIn
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-[4/5] rounded-xl bg-muted/50 flex flex-col items-center justify-center text-center p-6">
                        <Layers className="h-16 w-16 text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground">
                          Configurez votre carrousel et cliquez sur "Générer" pour voir l'aperçu
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library" className="space-y-4">
            {isLoadingCarousels ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : carousels && carousels.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {carousels.map((carousel: GeneratedCarousel) => (
                  <Card key={carousel.id} className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                    {/* Preview Image */}
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
                          onClick={() => handleViewCarousel(carousel)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
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
                  <Button onClick={() => setActiveTab("create")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un carrousel
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
