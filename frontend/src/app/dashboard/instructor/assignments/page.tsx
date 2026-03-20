"use client";

import DashboardLayout from "@/components/DashboardLayout";
import AssignmentManager from "@/components/AssignmentManager";

export default function InstructorAssignmentsPage() {
    return (
        <div className="max-w-7xl mx-auto pb-10">
            <AssignmentManager />
        </div>
    );
}
