import { AttendanceEntity } from '../types';
export function exportAttendanceToCSV(records: AttendanceEntity[]): string {
  const headers = [
    'Employee ID',
    'Employee Name',
    'Department',
    'Date',
    'Check In',
    'Check Out',
    'Working Hours',
    'Overtime (Hrs)',
    'Status',
    'Location',
  ];
  const rows = records.map((rec) => {
    const checkInStr = rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A';
    const checkOutStr = rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A';
    const empName = rec.employee?.name || 'N/A';
    const dept = rec.employee?.department || 'N/A';
    const empCode = rec.employee?.employeeCode || rec.employeeId;
    return [
      `"${empCode}"`,
      `"${empName.replace(/"/g, '""')}"`,
      `"${dept.replace(/"/g, '""')}"`,
      `"${rec.date}"`,
      `"${checkInStr}"`,
      `"${checkOutStr}"`,
      rec.workingHours.toFixed(2),
      rec.overtime.toFixed(2),
      `"${rec.status}"`,
      `"${rec.location || 'Office HQ'}"`,
    ].join(',');
  });
  return [headers.join(','), ...rows].join('\n');
}
