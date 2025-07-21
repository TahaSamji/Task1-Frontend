export interface EncodingProfile {
  id?: number;
  name: string;
  ffmpeg_args: string;
  resolution: string;
  bitrate: string;
  format_type: string;
  created_at?: string;
  isAdminSelected :boolean;
}