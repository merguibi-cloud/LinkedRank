import DashboardLayout from "@/components/DashboardLayout";
import { EmailNotifications } from "@/components/EmailNotifications";

export default function Notifications() {
  return (
    <DashboardLayout>
      <div className="container py-8">
        <EmailNotifications />
      </div>
    </DashboardLayout>
  );
}
