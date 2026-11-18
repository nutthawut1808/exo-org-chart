import fs from 'fs';
import path from 'path';
import { Employee, EmployeeDetail } from '@/types/employee';

function getEmployeesData(): Employee[] {
  const filePath = path.join(process.cwd(), 'data', 'employees.json');
  const fileData = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileData);
}

export function getAllEmployees(query?: {
  q?: string;
  department?: string;
  division?: string;
}): Employee[] {
  let employees = getEmployeesData();

  if (query?.department) {
    employees = employees.filter((e) => e.department === query.department);
  }

  if (query?.division) {
    employees = employees.filter((e) => e.division === query.division);
  }

  if (query?.q) {
    const keyword = query.q.toLowerCase();
    employees = employees.filter(
      (e) =>
        e.name.toLowerCase().includes(keyword) ||
        e.job_title.toLowerCase().includes(keyword)
    );
  }

  return employees;
}

export function getEmployeeDetailById(id: string): EmployeeDetail | null {
  const employees = getEmployeesData();
  const employee = employees.find((e) => e.id === id);

  if (!employee) return null;

  // หาชื่อ Manager
  let managerName: string | null = null;
  if (employee.manager_id) {
    const manager = employees.find((e) => e.id === employee.manager_id);
    managerName = manager ? manager.name : null;
  }

  // นับจำนวนลูกน้องโดยตรง (Direct Reports)
  const directReports = employees.filter((e) => e.manager_id === employee.id);

  return {
    ...employee,
    manager_name: managerName,
    direct_report_count: directReports.length,
  };
}

export function getSubordinates(managerId: string | null): Employee[] {
  const employees = getEmployeesData();
  return employees.filter((e) => e.manager_id === managerId);
}