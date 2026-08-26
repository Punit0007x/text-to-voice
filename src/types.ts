export interface PersonaConfig {
  id: string;
  name: string;
  sublabel: string;
  description: string;
  accentStyle: string;
  recommendedVoice: string;
  tags: string[];
  avatarColor: string;
  samplePhrase: string;
}

export interface EmotionConfig {
  id: string;
  label: string;
  description: string;
  iconName: string;
}

export interface TTSHistoryItem {
  id: string;
  text: string;
  personaId: string;
  personaName: string;
  emotion: string;
  speed: string;
  audioBase64: string;
  mimeType: string;
  durationSeconds: number;
  wordCount: number;
  timestamp: number;
  engine: "neural-ai" | "browser-speech";
}

export interface SamplePreset {
  id: string;
  title: string;
  category: "Professional" | "Storytelling" | "Conversational" | "Travel & Culture" | "Customer Care" | "Hinglish";
  recommendedPersona: string;
  recommendedEmotion: string;
  text: string;
}
