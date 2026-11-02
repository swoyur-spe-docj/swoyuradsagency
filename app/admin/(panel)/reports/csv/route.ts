import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/session-user';
import { can } from '@/lib/roles';
import { ordersCsv } from '@/lib/repo';

export async function GET() {
  // A cookie alone is not enough: the account must still be active and have the 'reports' permission.
  const user = await currentUser();
  if (!user || !can(user.role, 'reports')) return new NextResponse('Unauthorized', { status: 401 });
  return new NextResponse(await ordersCsv(), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="padmaarc-orders.csv"',
    },
  });
}
