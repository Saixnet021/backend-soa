import { NextRequest, NextResponse } from 'next/server';

const SOAP_BACKEND = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/ws/`
  : 'http://localhost:8081/ws/';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const soapAction = request.headers.get('SOAPAction') || '';

    const response = await fetch(SOAP_BACKEND, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': soapAction,
      },
      body,
    });

    const responseText = await response.text();

    return new NextResponse(responseText, {
      status: response.status,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error connecting to SOAP backend' },
      { status: 502 }
    );
  }
}
