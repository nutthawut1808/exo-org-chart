import { NextResponse } from 'next/server';
import { getEmployeeDetailById } from '@/lib/data-service';
import { auth } from '@/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Await params ตามมาตรฐาน Next.js App Router เวอร์ชันใหม่
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // 2. ตรวจสอบ Auth Session
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 3. ใช้ตัวแปร id ที่ดึงออกมาแล้วค้นหาข้อมูล
  const employee = getEmployeeDetailById(id);

  if (!employee) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
  }

  return NextResponse.json(employee);
}