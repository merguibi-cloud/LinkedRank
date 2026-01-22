import DashboardLayout from "@/components/DashboardLayout";
import { ReferralSystem } from "@/components/ReferralSystem";

export default function Referral() {
  return (
    <DashboardLayout>
      <div className="container py-8">
        <ReferralSystem />
      </div>
    </DashboardLayout>
  );
}
