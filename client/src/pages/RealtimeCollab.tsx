import DashboardLayout from "@/components/DashboardLayout";
import { RealtimeCollaboration } from "@/components/RealtimeCollaboration";

export default function RealtimeCollab() {
  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <RealtimeCollaboration />
      </div>
    </DashboardLayout>
  );
}
