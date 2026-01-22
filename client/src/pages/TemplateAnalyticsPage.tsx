import DashboardLayout from "@/components/DashboardLayout";
import { TemplateAnalytics } from "@/components/TemplateAnalytics";

export default function TemplateAnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <TemplateAnalytics />
      </div>
    </DashboardLayout>
  );
}
