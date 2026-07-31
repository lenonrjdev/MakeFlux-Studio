import type { ConfiguracaoCriacaoVideo } from "@/types/criar-video";

export type PayloadMoneyPrinter = {
  video_subject: string;
  video_script: string;
  video_terms: string;
  video_aspect: string;
  video_concat_mode: "random" | "sequential";
  video_clip_duration: number;
  video_count: number;
  video_source: "pexels" | "pixabay" | "local";
  video_materials: Array<{ provider: "local"; url: string; duration: number }> | null;
  video_language: string;
  voice_name: string;
  voice_volume: number;
  voice_rate: number;
  custom_audio_file?: string;
  bgm_type: "random" | "custom" | "";
  bgm_file: string;
  bgm_volume: number;
  subtitle_enabled: boolean;
  subtitle_position: string;
  custom_position: number;
  font_name: string;
  text_fore_color: string;
  text_background_color: string;
  font_size: number;
  stroke_color: string;
  stroke_width: number;
  n_threads: number;
  paragraph_number: number;
};

export type RespostaMoneyPrinter = {
  sucesso: boolean;
  status: number;
  mensagem: string;
  dados: Record<string, unknown>;
};

export type EstadoTarefaMoneyPrinter = {
  state: number;
  progress: number;
  videos: string[];
  combinedVideos: string[];
  audioFile: string | null;
  subtitleFile: string | null;
  error: string | null;
};

export type ContextoMotorProjeto = {
  endpoint: string;
  configuracao: ConfiguracaoCriacaoVideo;
};
