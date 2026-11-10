import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import english from "@/locales/en.json";

export const socialPreviewAlt = "Alexander — Full-Stack and Solidity Developer";
export const socialPreviewSize = {
  width: 1200,
  height: 630,
};
export const socialPreviewContentType = "image/png";

export async function createSocialPreviewImage() {
  const [heroImage, poppinsRegular, poppinsSemiBold, poppinsBold] = await Promise.all([
    readFile(join(process.cwd(), "public/assets/hero.png"), "base64"),
    readFile(join(process.cwd(), "node_modules/@fontsource/poppins/files/poppins-latin-400-normal.woff")),
    readFile(join(process.cwd(), "node_modules/@fontsource/poppins/files/poppins-latin-600-normal.woff")),
    readFile(join(process.cwd(), "node_modules/@fontsource/poppins/files/poppins-latin-700-normal.woff")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background: "#272727",
          color: "#ffffff",
          fontFamily: "Poppins",
        }}
      >
        <img
          src={`data:image/png;base64,${heroImage}`}
          alt=""
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            display: "flex",
            width: "100%",
            height: "100%",
            background: "linear-gradient(90deg, rgba(17, 17, 17, .96) 0%, rgba(17, 17, 17, .82) 48%, rgba(17, 17, 17, .2) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "58px 70px 62px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 44,
                height: 44,
                border: "2px solid #f3ca2f",
                borderRadius: 22,
                color: "#f3ca2f",
                fontSize: 23,
                fontWeight: 700,
              }}
            >
              A
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: 4,
                textTransform: "uppercase",
              }}
            >
              Portfolio · CV
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", maxWidth: 790 }}>
            <div style={{ display: "flex", fontSize: 88, fontWeight: 700, lineHeight: 1.04 }}>
              {english.brand.name}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 13,
                color: "#f3ca2f",
                fontSize: 38,
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              {english.brand.role}
            </div>
            <div
              style={{
                display: "flex",
                maxWidth: 720,
                marginTop: 22,
                color: "rgba(255, 255, 255, .82)",
                fontSize: 21,
                lineHeight: 1.5,
              }}
            >
              {english.meta.description}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 15,
              color: "rgba(255, 255, 255, .7)",
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: 2.5,
              textTransform: "uppercase",
            }}
          >
            <span>Full-Stack</span>
            <span style={{ color: "#f3ca2f" }}>·</span>
            <span>Solidity</span>
            <span style={{ color: "#f3ca2f" }}>·</span>
            <span>Web3</span>
          </div>
        </div>
      </div>
    ),
    {
      ...socialPreviewSize,
      fonts: [
        { name: "Poppins", data: poppinsRegular, weight: 400, style: "normal" },
        { name: "Poppins", data: poppinsSemiBold, weight: 600, style: "normal" },
        { name: "Poppins", data: poppinsBold, weight: 700, style: "normal" },
      ],
    },
  );
}
