import DashboardLayout from "@/components/DashboardLayout";
import { AICoachingPanel } from "@/components/AICoachingPanel";

export default function Coaching() {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <AICoachingPanel />
      </div>
    </DashboardLayout>
  );
}
