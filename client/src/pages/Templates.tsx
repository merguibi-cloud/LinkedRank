import DashboardLayout from "@/components/DashboardLayout";
import { PostTemplates } from "@/components/PostTemplates";
import { useLocation } from "wouter";

export default function Templates() {
  const [, setLocation] = useLocation();

  const handleSelectTemplate = (template: string) => {
    // Store template in sessionStorage and redirect to generator
    sessionStorage.setItem("selectedTemplate", template);
    setLocation("/generate");
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-3">
            📝 Bibliothèque de Templates
          </h1>
          <p className="text-white/60">
            Des templates éprouvés pour créer des posts LinkedIn qui génèrent de l'engagement.
            Choisissez, personnalisez et publiez !
          </p>
        </div>

        {/* Templates component */}
        <PostTemplates onSelectTemplate={handleSelectTemplate} />

        {/* Tips section */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-violet/10 to-rose/10 border border-violet/20">
          <h3 className="text-xl font-bold text-white mb-4">
            💡 Comment utiliser les templates efficacement ?
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-2xl">1️⃣</div>
              <h4 className="font-semibold text-white">Choisissez votre template</h4>
              <p className="text-sm text-white/60">
                Sélectionnez un template adapté à votre message et votre audience.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">2️⃣</div>
              <h4 className="font-semibold text-white">Personnalisez le contenu</h4>
              <p className="text-sm text-white/60">
                Remplacez les placeholders par votre propre histoire et vos insights.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-2xl">3️⃣</div>
              <h4 className="font-semibold text-white">Ajoutez votre touche</h4>
              <p className="text-sm text-white/60">
                Adaptez le ton et le style pour qu'il corresponde à votre personal branding.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
