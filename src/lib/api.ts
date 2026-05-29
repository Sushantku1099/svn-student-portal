import { NextResponse } from 'next/server';

export function ok(data: unknown = {}, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(message = 'Something went wrong', status = 400, details?: unknown) {
  return NextResponse.json({ success: false, message, details }, { status });
}
