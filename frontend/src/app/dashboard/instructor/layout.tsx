import DashboardLayout from "@/components/DashboardLayout";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function InstructorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout role="instructor">
      <ErrorBoundary componentName="InstructorDashboard">
        {children}
      </ErrorBoundary>
    </DashboardLayout>
  );
}
