import DashboardLayout from "@/components/DashboardLayout";
import DailyMissions from "@/components/DailyMissions";

export default function Missions() {
  return (
    <DashboardLayout>
      <div className="container max-w-6xl py-8">
        <DailyMissions />
      </div>
    </DashboardLayout>
  );
}
