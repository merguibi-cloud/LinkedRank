import DashboardLayout from "@/components/DashboardLayout";
import EditorialCalendar from "@/components/EditorialCalendar";

export default function EditorialCalendarPage() {
  return (
    <DashboardLayout>
      <div className="container max-w-7xl py-8">
        <EditorialCalendar />
      </div>
    </DashboardLayout>
  );
}
