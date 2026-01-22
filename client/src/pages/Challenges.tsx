import DashboardLayout from "@/components/DashboardLayout";
import { CommunityChallenges } from "@/components/CommunityChallenges";

export default function Challenges() {
  return (
    <DashboardLayout>
      <div className="container py-8">
        <CommunityChallenges />
      </div>
    </DashboardLayout>
  );
}
