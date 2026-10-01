import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      token: process.env.CITY_IMAGES_PUB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN,
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Тут можна додати перевірку авторизації користувача (наприклад, через сесію)
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            // Опціональні метадані
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Callback, що викликається Vercel після успішного завершення завантаження
        console.log('Blob uploaded:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
