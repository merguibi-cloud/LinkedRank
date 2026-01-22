import DashboardLayout from "@/components/DashboardLayout";
import { PremiumTemplatePacks } from "@/components/PremiumTemplatePacks";

export default function PremiumPacks() {
  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <PremiumTemplatePacks />
      </div>
    </DashboardLayout>
  );
}
