import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Instagram, 
  Facebook, 
  Download, 
  Copy, 
  Sparkles,
  Image,
  Video,
  Square,
  RectangleVertical,
  Palette,
  Type,
  Layers
} from "lucide-react";
import { toast } from "sonner";

// Types de templates visuels
interface VisualTemplate {
  id: string;
  name: string;
  type: "post" | "story" | "reel" | "carousel" | "ad";
  platform: "instagram" | "facebook" | "both";
  dimensions: string;
  aspectRatio: string;
  preview: string;
  colors: string[];
  description: string;
  bestFor: string[];
}

// Templates visuels prédéfinis
const visualTemplates: VisualTemplate[] = [
  // Instagram Templates
  {
    id: "ig-story-gradient",
    name: "Story Gradient",
    type: "story",
    platform: "instagram",
    dimensions: "1080x1920",
    aspectRatio: "9:16",
    preview: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    colors: ["#667eea", "#764ba2", "#f093fb"],
    description: "Fond dégradé moderne pour stories Instagram",
    bestFor: ["Annonces", "Citations", "Témoignages"],
  },
  {
    id: "ig-post-minimal",
    name: "Post Minimaliste",
    type: "post",
    platform: "instagram",
    dimensions: "1080x1080",
    aspectRatio: "1:1",
    preview: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
    colors: ["#1a1a2e", "#16213e", "#e94560"],
    description: "Design épuré avec accent de couleur",
    bestFor: ["Tips", "Stats", "Quotes"],
  },
  {
    id: "ig-carousel-pro",
    name: "Carrousel Pro",
    type: "carousel",
    platform: "instagram",
    dimensions: "1080x1350",
    aspectRatio: "4:5",
    preview: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
    colors: ["#0f0c29", "#302b63", "#24243e"],
    description: "Format carrousel optimisé pour l'engagement",
    bestFor: ["Tutoriels", "Listes", "Avant/Après"],
  },
  {
    id: "ig-reel-dynamic",
    name: "Reel Dynamique",
    type: "reel",
    platform: "instagram",
    dimensions: "1080x1920",
    aspectRatio: "9:16",
    preview: "linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #48dbfb 100%)",
    colors: ["#ff6b6b", "#feca57", "#48dbfb"],
    description: "Couleurs vives pour capter l'attention",
    bestFor: ["Démos", "Behind the scenes", "Tendances"],
  },
  // Facebook Templates
  {
    id: "fb-post-corporate",
    name: "Post Corporate",
    type: "post",
    platform: "facebook",
    dimensions: "1200x630",
    aspectRatio: "1.91:1",
    preview: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
    colors: ["#1e3c72", "#2a5298", "#ffffff"],
    description: "Design professionnel pour entreprises",
    bestFor: ["Annonces", "Articles", "Événements"],
  },
  {
    id: "fb-ad-conversion",
    name: "Ad Conversion",
    type: "ad",
    platform: "facebook",
    dimensions: "1080x1080",
    aspectRatio: "1:1",
    preview: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    colors: ["#11998e", "#38ef7d", "#ffffff"],
    description: "Optimisé pour les conversions publicitaires",
    bestFor: ["Promos", "Offres", "Lead gen"],
  },
  {
    id: "fb-story-brand",
    name: "Story Brand",
    type: "story",
    platform: "facebook",
    dimensions: "1080x1920",
    aspectRatio: "9:16",
    preview: "linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)",
    colors: ["#8e2de2", "#4a00e0", "#ffffff"],
    description: "Stories Facebook avec identité de marque",
    bestFor: ["Branding", "Promos flash", "Sondages"],
  },
  // Templates multi-plateformes
  {
    id: "both-testimonial",
    name: "Témoignage Client",
    type: "post",
    platform: "both",
    dimensions: "1080x1080",
    aspectRatio: "1:1",
    preview: "linear-gradient(135deg, #2c3e50 0%, #3498db 100%)",
    colors: ["#2c3e50", "#3498db", "#ecf0f1"],
    description: "Mise en valeur des témoignages clients",
    bestFor: ["Avis clients", "Success stories", "Recommandations"],
  },
  {
    id: "both-stats",
    name: "Statistiques Impact",
    type: "post",
    platform: "both",
    dimensions: "1080x1080",
    aspectRatio: "1:1",
    preview: "linear-gradient(135deg, #141e30 0%, #243b55 100%)",
    colors: ["#141e30", "#243b55", "#00d9ff"],
    description: "Présentation de données et résultats",
    bestFor: ["KPIs", "Résultats", "Comparatifs"],
  },
];

// Composant de prévisualisation de template
function TemplatePreview({ template, onSelect }: { template: VisualTemplate; onSelect: () => void }) {
  const getTypeIcon = () => {
    switch (template.type) {
      case "story":
      case "reel":
        return <RectangleVertical className="h-4 w-4" />;
      case "carousel":
        return <Layers className="h-4 w-4" />;
      case "ad":
        return <Sparkles className="h-4 w-4" />;
      default:
        return <Square className="h-4 w-4" />;
    }
  };

  const getPlatformBadge = () => {
    if (template.platform === "both") {
      return (
        <div className="flex gap-1">
          <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-[10px]">
            <Instagram className="mr-1 h-3 w-3" />
            IG
          </Badge>
          <Badge className="bg-blue-500 text-[10px]">
            <Facebook className="mr-1 h-3 w-3" />
            FB
          </Badge>
        </div>
      );
    }
    return template.platform === "instagram" ? (
      <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-[10px]">
        <Instagram className="mr-1 h-3 w-3" />
        Instagram
      </Badge>
    ) : (
      <Badge className="bg-blue-500 text-[10px]">
        <Facebook className="mr-1 h-3 w-3" />
        Facebook
      </Badge>
    );
  };

  return (
    <Card 
      className="group cursor-pointer border-white/10 bg-white/5 transition-all hover:border-violet/50 hover:bg-white/10"
      onClick={onSelect}
    >
      <CardContent className="p-4">
        {/* Preview */}
        <div 
          className="relative mb-3 overflow-hidden rounded-lg"
          style={{ 
            background: template.preview,
            aspectRatio: template.type === "story" || template.type === "reel" ? "9/16" : "1/1",
            maxHeight: "200px"
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
              {getTypeIcon()}
            </div>
          </div>
          <div className="absolute bottom-2 right-2">
            {getPlatformBadge()}
          </div>
        </div>

        {/* Info */}
        <h4 className="mb-1 font-semibold text-white">{template.name}</h4>
        <p className="mb-2 text-xs text-muted-foreground">{template.description}</p>
        
        {/* Dimensions */}
        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Image className="h-3 w-3" />
          <span>{template.dimensions}</span>
          <span className="text-white/30">•</span>
          <span>{template.aspectRatio}</span>
        </div>

        {/* Colors */}
        <div className="mb-3 flex gap-1">
          {template.colors.map((color, i) => (
            <div
              key={i}
              className="h-4 w-4 rounded-full border border-white/20"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>

        {/* Best For */}
        <div className="flex flex-wrap gap-1">
          {template.bestFor.map((use) => (
            <span key={use} className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-muted-foreground">
              {use}
            </span>
          ))}
        </div>

        {/* Hover Actions */}
        <div className="mt-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button size="sm" variant="outline" className="flex-1 border-white/20 text-xs">
            <Copy className="mr-1 h-3 w-3" />
            Copier
          </Button>
          <Button size="sm" className="flex-1 btn-gradient text-xs">
            <Download className="mr-1 h-3 w-3" />
            Utiliser
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Composant principal
export function VisualTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState<VisualTemplate | null>(null);
  const [customText, setCustomText] = useState("");

  const handleSelectTemplate = (template: VisualTemplate) => {
    setSelectedTemplate(template);
    toast.success(`Template "${template.name}" sélectionné !`);
  };

  const instagramTemplates = visualTemplates.filter(
    (t) => t.platform === "instagram" || t.platform === "both"
  );
  const facebookTemplates = visualTemplates.filter(
    (t) => t.platform === "facebook" || t.platform === "both"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Templates Visuels</h3>
          <p className="text-sm text-muted-foreground">
            Créez des visuels professionnels pour vos campagnes
          </p>
        </div>
        <Button className="btn-gradient">
          <Palette className="mr-2 h-4 w-4" />
          Créer un template
        </Button>
      </div>

      {/* Tabs par plateforme */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-white/5">
          <TabsTrigger value="all">
            Tous
          </TabsTrigger>
          <TabsTrigger value="instagram" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500">
            <Instagram className="mr-2 h-4 w-4" />
            Instagram
          </TabsTrigger>
          <TabsTrigger value="facebook" className="data-[state=active]:bg-blue-500">
            <Facebook className="mr-2 h-4 w-4" />
            Facebook
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visualTemplates.map((template) => (
              <TemplatePreview
                key={template.id}
                template={template}
                onSelect={() => handleSelectTemplate(template)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="instagram">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {instagramTemplates.map((template) => (
              <TemplatePreview
                key={template.id}
                template={template}
                onSelect={() => handleSelectTemplate(template)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="facebook">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {facebookTemplates.map((template) => (
              <TemplatePreview
                key={template.id}
                template={template}
                onSelect={() => handleSelectTemplate(template)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Selected Template Editor */}
      {selectedTemplate && (
        <Card className="border-violet/30 bg-violet/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Type className="h-5 w-5" />
              Personnaliser : {selectedTemplate.name}
            </CardTitle>
            <CardDescription>
              Ajoutez votre texte et personnalisez le template
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Preview */}
              <div 
                className="relative overflow-hidden rounded-xl"
                style={{ 
                  background: selectedTemplate.preview,
                  aspectRatio: selectedTemplate.type === "story" || selectedTemplate.type === "reel" ? "9/16" : "1/1",
                  maxHeight: "400px"
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white drop-shadow-lg">
                      {customText || "Votre texte ici..."}
                    </p>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between rounded-lg bg-black/30 px-4 py-2 backdrop-blur-sm">
                    <span className="text-sm text-white">LinkedAgents</span>
                    <span className="text-xs text-white/70">{selectedTemplate.dimensions}</span>
                  </div>
                </div>
              </div>

              {/* Editor */}
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Texte principal
                  </label>
                  <textarea
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Entrez votre texte..."
                    className="h-32 w-full rounded-lg border border-white/10 bg-white/5 p-3 text-white placeholder:text-muted-foreground focus:border-violet focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Palette de couleurs
                  </label>
                  <div className="flex gap-2">
                    {selectedTemplate.colors.map((color, i) => (
                      <button
                        key={i}
                        className="h-10 w-10 rounded-lg border-2 border-white/20 transition-transform hover:scale-110"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                    <button className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-dashed border-white/20 text-muted-foreground hover:border-white/40">
                      +
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1 border-white/20">
                    <Copy className="mr-2 h-4 w-4" />
                    Copier le code
                  </Button>
                  <Button className="flex-1 btn-gradient">
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
