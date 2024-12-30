import { cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    console.group('⚙️ User Settings Update');
    try {
        const formData = await request.formData();
        const userCookies = await cookies();
        const session = userCookies.get('session_token');

        if (!session) {
            console.warn('⚠️ No session token found');
            console.groupEnd();
            return NextResponse.redirect('/login');
        }

        console.log('🌐 API URL:', process.env.NEXT_PUBLIC_API_URL);
        console.log('🎫 Token Present:', !!session.value);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/user/me`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.value}`,
                'cache-control': 'no-cache',
            },
            body: formData,
        });

        console.log('📥 API Response Status:', res.status);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('❌ API Error:', errorText);
            console.groupEnd();
            return NextResponse.json({ message: 'Failed to update settings' }, { status: res.status });
        }

        const updatedUserData = await res.json();
        userCookies.set('username', updatedUserData.data.username);
        console.log('👤 Updated User Data:', JSON.stringify(updatedUserData, null, 2));
        
        console.log('✅ Settings updated successfully');
        console.groupEnd();
        return NextResponse.json({
            message: 'Settings updated successfully',
            user: updatedUserData
        });
    } catch (error) {
        console.error('❌ Error in settings update:', error);
        console.groupEnd();
        return new NextResponse("Internal error", { status: 500 });
    }
}

