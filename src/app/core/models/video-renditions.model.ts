export interface VideoRenditionDto {
  variantId: number;
  type: string;
  resolution: string;
  bitrateKbps: string;
  size: number;
  durationSeconds: number;
  videoUrl: string;
  createdAt: string;
}