import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/user/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token.value}`,
          'cache-control': 'no-cache',
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete user');
    }

    return NextResponse.json({ message: `User ${id} deleted successfully` });
  } catch (error) {
    console.error("[USER_DELETE]", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}