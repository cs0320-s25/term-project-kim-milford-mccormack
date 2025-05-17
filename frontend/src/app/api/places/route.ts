// app/api/places/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius');
    const keyword = searchParams.get('keyword');

    if (!lat || !lng || !radius) {
        return NextResponse.json({ message: 'Missing required query params' }, { status: 400 });
    }

    const queryParams = new URLSearchParams({ lat, lng, radius });
    if (keyword) queryParams.append('keyword', keyword);

    const apiUrl = `http://localhost:8080/places?${queryParams}`;
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching data', error }, { status: 500 });
    }
}
