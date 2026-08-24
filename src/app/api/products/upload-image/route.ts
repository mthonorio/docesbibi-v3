import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth-guards";
import {
  uploadProductImage,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
} from "@/lib/r2";
import type { ApiResponse } from "@/types/api";

// POST /api/products/upload-image - Sobe uma imagem de produto pro R2 (só
// gestora) e devolve a URL pública. O client então usa essa URL no
// `image` de POST/PATCH /api/products — o upload em si não toca no banco.
export async function POST(request: NextRequest) {
  const guard = await requireStaff();
  if (!guard.ok) return guard.response;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Nenhum arquivo enviado",
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Formato de imagem não suportado (use JPEG, PNG, WEBP ou GIF)",
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Imagem maior que 5MB",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadProductImage(buffer, file.type);

    const response: ApiResponse<{ url: string }> = {
      success: true,
      data: { url },
    };
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("POST /api/products/upload-image error:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao enviar imagem",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
