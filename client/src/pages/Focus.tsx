import DashboardLayout from "@/components/DashboardLayout";
import FocusMode from "@/components/FocusMode";

export default function Focus() {
  return (
    <DashboardLayout>
      <div className="container max-w-4xl py-8">
        <FocusMode />
      </div>
    </DashboardLayout>
  );
}
