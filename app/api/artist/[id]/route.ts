import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest, {params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  console.log(`🎨 POST /api/artist/${id}`);
  
  try {
    // Get cookies for authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    // Log user info from token if available
    if (token) {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      console.log('👤 User:', { id: tokenData.id, role: tokenData.role });
    }

    // Handle FormData
    const formData = await request.formData();
    console.log('📤 Sending form data:', Object.fromEntries(formData.entries()));

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/artist/${id}`,
      {
        method: "POST",
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
          "cache-control": "no-cache"
        },
        body: formData // Send formData directly without JSON.stringify
      }
    );

    if (!response.ok) {
      console.log('❌ Error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to process request' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Success:', data);
    return NextResponse.json(data);

  } catch (error) {
    console.log('💥 Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, {params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  console.log(`🗑️ DELETE /api/artist/${id}`);

  try {
    // Get cookies for authentication if needed
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    // Log user info from token if available
    if (token) {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      console.log('👤 User:', { id: tokenData.id, role: tokenData.role });
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/artist/${id}`,
      {
        method: "DELETE",
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      }
    );

    if (!response.ok) {
      console.log('❌ Error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to process request' },
        { status: response.status }
      );
    }

    console.log('✅ Artist deleted successfully');
    return NextResponse.json({ message: 'Artist deleted successfully' });

  } catch (error) {
    console.log('💥 Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}