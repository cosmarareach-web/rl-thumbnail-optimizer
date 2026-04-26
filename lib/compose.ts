import { THUMBNAIL_STYLES, getPromptForVariant } from "./prompts";

export interface ThumbnailConfig {
  baseImageUrl: string;
  title?: string;
  subtitle?: string;
  style?: string;
}

export async function composeThumbnailVariants(
  config: ThumbnailConfig
): Promise<string[]> {
  const { baseImageUrl, title, subtitle, style } = config;
  const variants: string[] = [];

  // Generate one variant per style, or use provided style
  const stylesToGenerate = style ? [style] : THUMBNAIL_STYLES;

  for (const variantStyle of stylesToGenerate) {
    const prompt = getPromptForVariant(variantStyle);
    const variantId = `thumb-${variantStyle}-${Date.now()}`;
    
    try {
      // Here you would call your image generation API (Replicate, OpenAI DALL-E, etc)
      // For now, we'll create a variant identifier
      variants.push(variantId);
    } catch (error) {
      console.error(`Failed to compose ${variantStyle}:`, error);
    }
  }

  return variants;
}

export function getCompositionPrompt(
  baseUrl: string,
  style: string,
  title?: string
): string {
  const stylePrompt = getPromptForVariant(style);
  const titleText = title ? `with prominent text: "${title}"` : "";
  
  return `Create a YouTube thumbnail ${titleText}. Style: ${stylePrompt}. Base on this image: ${baseUrl}`;
}

export function validateThumbnailConfig(config: ThumbnailConfig): boolean {
  if (!config.baseImageUrl) return false;
  if (config.style && !THUMBNAIL_STYLES.includes(config.style)) return false;
  return true;
}
