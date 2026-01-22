import DashboardLayout from "@/components/DashboardLayout";
import { ABTestingPanel } from "@/components/ABTestingPanel";

export default function ABTesting() {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <ABTestingPanel />
      </div>
    </DashboardLayout>
  );
}
