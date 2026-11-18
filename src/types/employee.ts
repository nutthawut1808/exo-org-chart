export interface Employee {
  id: string;
  name: string;
  job_title: string;
  department: string;
  division: string;
  country: string;
  email: string;
  manager_id: string | null;
  photo_url: string | null;
}

export interface EmployeeDetail extends Employee {
  manager_name: string | null;
  direct_report_count: number;
}