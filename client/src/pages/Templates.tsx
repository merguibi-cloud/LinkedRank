import DashboardLayout from "@/components/DashboardLayout";
import { PostTemplates } from "@/components/PostTemplates";
import { IllustrationSlot } from "@/components/IllustrationSlot";
import { FileText, Lightbulb } from "lucide-react";
import { useLocation } from "wouter";

const TIPS = [
  {
    title: "Choisissez votre template",
    description: "Sélectionnez un template adapté à votre message et votre audience.",
  },
  {
    title: "Personnalisez le contenu",
    description: "Remplacez les placeholders par votre propre histoire et vos insights.",
  },
  {
    title: "Ajoutez votre touche",
    description: "Adaptez le ton et le style pour qu'il corresponde à votre personal branding.",
  },
];

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
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet/20 via-rose/10 to-transparent border border-white/10 p-8">
          <div className="relative flex items-center justify-between gap-6">
            <div className="flex-1 max-w-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-violet to-rose">
                  <FileText className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Bibliothèque de Templates
                </h1>
              </div>
              <p className="text-white/60 mt-2">
                Des templates éprouvés pour créer des posts LinkedIn qui génèrent de l&apos;engagement.
                Choisissez, personnalisez et publiez !
              </p>
            </div>

            {/* Drop an image at public/images/hero-templates.png to fill this */}
            <IllustrationSlot
              src="/images/hero-templates.png"
              alt=""
              className="hidden lg:block w-56 h-36 shrink-0"
            />
          </div>
        </div>

        {/* Templates component */}
        <PostTemplates onSelectTemplate={handleSelectTemplate} />

        {/* Tips section */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-violet/10 to-rose/10 border border-violet/20">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-violet-light" />
            Comment utiliser les templates efficacement ?
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {TIPS.map((tip, index) => (
              <div key={tip.title} className="space-y-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet to-rose text-sm font-bold text-white">
                  {index + 1}
                </div>
                <h4 className="font-semibold text-white">{tip.title}</h4>
                <p className="text-sm text-white/60">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
