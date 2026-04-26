import sharp from "sharp";
import { writeFileSync, readFileSync } from "fs";
import { join } from "path";

const PUBLIC_DIR = join(process.cwd(), "public");

export async function generateThumbnailVariants(
  baseImageUrl: string,
  variants: string[]
): Promise<Record<string, string>> {
  const results: Record<string, string> = {};

  for (const variant of variants) {
    try {
      // Fetch base image
      const response = await fetch(baseImageUrl);
      const buffer = await response.arrayBuffer();

      // Apply transformations based on variant
      let transformed = sharp(Buffer.from(buffer));

      switch (variant) {
        case "vibrant":
          transformed = transformed
            .modulate({ saturation: 1.5 })
            .normalise();
          break;
        case "minimal":
          transformed = transformed
            .modulate({ saturation: 0.5 })
            .brightness(1.1);
          break;
        case "professional":
          transformed = transformed
            .modulate({ lightness: -20 })
            .normalise();
          break;
        case "playful":
          transformed = transformed
            .modulate({ saturation: 1.2, hue: 15 })
            .normalise();
          break;
        case "dramatic":
          transformed = transformed
            .modulate({ saturation: 1.3 })
            .sharpen();
          break;
      }

      // Optimize and resize
      const optimized = await transformed
        .resize(1280, 720, {
          fit: "cover",
          position: "center"
        })
        .webp({ quality: 85 })
        .toBuffer();

      // Save to public folder
      const filename = `thumb-${variant}-${Date.now()}.webp`;
      const filepath = join(PUBLIC_DIR, filename);
      
      writeFileSync(filepath, optimized);
      results[variant] = `/${filename}`;
    } catch (error) {
      console.error(`Failed to generate ${variant} variant:`, error);
      results[variant] = baseImageUrl;
    }
  }

  return results;
}

export async function optimizeImage(
  buffer: Buffer,
  options?: { quality?: number; width?: number; height?: number }
): Promise<Buffer> {
  const { quality = 80, width = 1280, height = 720 } = options || {};

  return sharp(buffer)
    .resize(width, height, {
      fit: "cover",
      position: "center"
    })
    .webp({ quality })
    .toBuffer();
}

export function getThumbnailMetadata(url: string) {
  return {
    url,
    generatedAt: new Date().toISOString(),
    format: "webp",
    dimensions: { width: 1280, height: 720 }
  };
}
