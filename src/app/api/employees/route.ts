import { NextResponse } from 'next/server';
import { getAllEmployees } from '@/lib/data-service';
import { auth } from '@/auth';

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || undefined;
  const department = searchParams.get('department') || undefined;
  const division = searchParams.get('division') || undefined;

  const employees = getAllEmployees({ q, department, division });
  return NextResponse.json(employees);
}