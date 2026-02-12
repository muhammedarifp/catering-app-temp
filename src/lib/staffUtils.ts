import { Staff, StaffRole, EventStaffAssignment } from './types';
import { staff } from './data';

export const getStaffByRole = (role: StaffRole): Staff[] => {
    return staff.filter((s) => s.role === role && s.status === 'active');
};

export const autoAssignStaff = (
    eventId: string,
    requirements: Partial<Record<StaffRole, number>>
): EventStaffAssignment[] => {
    const assignments: EventStaffAssignment[] = [];

    Object.entries(requirements).forEach(([roleString, count]) => {
        const role = roleString as StaffRole;
        if (!count || count <= 0) return;

        const availableStaff = getStaffByRole(role);
        // In a real app, we would check for conflicts with other events here.
        // For now, we just pick the first 'count' available staff.

        // Sort by reliability score to assign best staff first
        const sortedStaff = [...availableStaff].sort((a, b) => b.reliabilityScore - a.reliabilityScore);
        const selectedStaff = sortedStaff.slice(0, count);

        selectedStaff.forEach((s) => {
            const assignment: EventStaffAssignment = {
                id: `assign-${Date.now()}-${s.id}`,
                eventId,
                staffId: s.id,
                role: s.role,
                shiftStart: '00:00', // Default placeholder
                shiftEnd: '00:00',   // Default placeholder
                payRate: s.hourlyRate || 0,
                payType: 'hourly',
                estimatedPay: (s.hourlyRate || 0) * 5, // Estimate 5 hours
                status: 'pending',
                paymentStatus: 'pending',
                whatsappAlertSent: false,
                reminderSent: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            assignments.push(assignment);
        });
    });

    return assignments;
};
