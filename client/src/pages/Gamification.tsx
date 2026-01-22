import DashboardLayout from "@/components/DashboardLayout";
import { GamificationSystem } from "@/components/GamificationSystem";

export default function Gamification() {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <GamificationSystem />
      </div>
    </DashboardLayout>
  );
}
