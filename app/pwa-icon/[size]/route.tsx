import { ImageResponse } from "next/og";

export function generateStaticParams() {
  return [{ size: "192" }, { size: "512" }, { size: "maskable" }];
}

/** Icon ứng dụng: chữ K trong vòng tròn đỏ, giống logo. "maskable" để Android cắt tròn/vuông không mất chữ. */
export async function GET(_: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const maskable = size === "maskable";
  const px = size === "192" ? 192 : 512;
  const circle = maskable ? px * 0.56 : px * 0.8;
  return new ImageResponse(
    (
      <div style={{ width: px, height: px, display: "flex", alignItems: "center", justifyContent: "center", background: maskable ? "#7c3aed" : "#f5f3ff" }}>
        <div style={{ width: circle, height: circle, borderRadius: "50%", background: "#ffffff", border: `${Math.round(circle * 0.06)}px solid #e02c31`, display: "flex", alignItems: "center", justifyContent: "center", color: "#101621", fontSize: circle * 0.68, fontWeight: 900, fontStyle: "italic" }}>
          K
        </div>
      </div>
    ),
    { width: px, height: px },
  );
}
