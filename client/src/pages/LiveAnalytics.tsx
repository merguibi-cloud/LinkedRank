import DashboardLayout from "@/components/DashboardLayout";
import { RealTimeAnalytics } from "@/components/RealTimeAnalytics";

export default function LiveAnalytics() {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <RealTimeAnalytics />
      </div>
    </DashboardLayout>
  );
}
