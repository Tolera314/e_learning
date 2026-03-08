import DashboardLayout from "@/components/DashboardLayout";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout role="student">
      <ErrorBoundary componentName="StudentDashboard">
        {children}
      </ErrorBoundary>
    </DashboardLayout>
  );
}
