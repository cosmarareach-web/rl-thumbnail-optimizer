export const THUMBNAIL_PROMPTS = {
  "minimal": "A clean, minimalist thumbnail design with large bold text and one accent color. Lots of white space.",
  "vibrant": "A bright, energetic thumbnail with bold saturated colors, dynamic angles, and eye-catching elements.",
  "professional": "A sleek professional thumbnail with a dark background, modern typography, and subtle gradients.",
  "playful": "A fun, playful thumbnail with cartoon elements, bright colors, and rounded shapes.",
  "dramatic": "A dramatic thumbnail with high contrast, sharp shadows, and an intense focal point.",
};

export const THUMBNAIL_STYLES = [
  "minimal",
  "vibrant", 
  "professional",
  "playful",
  "dramatic"
];

export function getPromptForVariant(variant: string): string {
  return THUMBNAIL_PROMPTS[variant as keyof typeof THUMBNAIL_PROMPTS] || 
    THUMBNAIL_PROMPTS.vibrant;
}
