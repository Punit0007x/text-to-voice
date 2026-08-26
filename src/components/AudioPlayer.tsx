import { useEffect, useRef, useState, ChangeEvent } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Share2,
  Check,
  Sparkles,
  Repeat,
  FastForward,
} from "lucide-react";
import { base64ToAudioUrl, downloadWav } from "../utils/audioUtils";

interface AudioPlayerProps {
  audioBase64: string;
  personaName: string;
  emotionLabel?: string;
  durationSeconds?: number;
  wordCount?: number;
  textSnippet?: string;
}

export default function AudioPlayer({
  audioBase64,
  personaName,
  emotionLabel,
  durationSeconds = 0,
  wordCount = 0,
  textSnippet = "",
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationSeconds || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isLooping, setIsLooping] = useState(false);
  const [copied, setCopied] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>("");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Generate blob URL whenever base64 changes
  useEffect(() => {
    if (!audioBase64) return;
    const url = base64ToAudioUrl(audioBase64, "audio/wav");
    setAudioUrl(url);
    setCurrentTime(0);
    setIsPlaying(false);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [audioBase64]);

  // Connect Web Audio API for frequency visualization
  const setupWebAudio = () => {
    if (!audioRef.current || audioContextRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      sourceNodeRef.current = source;
    } catch (e) {
      console.warn("Web Audio API not supported or already connected", e);
    }
  };

  // Canvas visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const renderWaveform = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const analyser = analyserRef.current;
      const barCount = 32;
      const barWidth = (width / barCount) - 3;

      if (analyser && isPlaying) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        for (let i = 0; i < barCount; i++) {
          const index = Math.floor((i / barCount) * bufferLength);
          const value = dataArray[index] || 10;
          const percent = value / 255;
          const barHeight = Math.max(6, percent * (height - 8));
          const x = i * (barWidth + 3);
          const y = (height - barHeight) / 2;

          // Gradient color: warm saffron orange to gold
          const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
          gradient.addColorStop(0, "#F59E0B");
          gradient.addColorStop(1, "#E11D48");

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 3);
          ctx.fill();
        }
      } else {
        // Idle state waveform placeholder
        for (let i = 0; i < barCount; i++) {
          const seed = Math.sin((i / barCount) * Math.PI) * 0.7 + 0.3;
          const barHeight = 8 + seed * 20;
          const x = i * (barWidth + 3);
          const y = (height - barHeight) / 2;

          ctx.fillStyle = isPlaying ? "#F59E0B" : "#E2E8F0";
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 2);
          ctx.fill();
        }
      }

      animationFrameRef.current = requestAnimationFrame(renderWaveform);
    };

    renderWaveform();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    setupWebAudio();

    if (audioContextRef.current?.state === "suspended") {
      await audioContextRef.current.resume();
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.error("Playback error:", err);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const cyclePlaybackRate = () => {
    const rates = [0.8, 1.0, 1.25, 1.5, 2.0];
    const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIndex];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (isLooping && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const restartAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      if (!isPlaying) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 5);
    }
  };

  const handleDownload = () => {
    const filename = `${personaName.toLowerCase()}-indian-voice-${Date.now()}.wav`;
    downloadWav(audioBase64, filename);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(textSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div id="audio-player-container" className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
      {/* Hidden native audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="auto"
      />

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white font-bold shadow-sm">
            {personaName[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">{personaName}'s Voice Output</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/70 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                Indian Female Voice
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {emotionLabel || "Natural Conversational"} • {wordCount} words • 24kHz Studio Quality (WAV)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="download-wav-btn"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-amber-500 hover:text-white rounded-xl transition-colors shadow-xs"
            title="Download high-quality uncompressed WAV audio"
          >
            <Download className="w-3.5 h-3.5" />
            Download WAV
          </button>
          <button
            id="copy-text-btn"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            title="Copy text snippet"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy Text"}
          </button>
        </div>
      </div>

      {/* Waveform Frequency Visualizer */}
      <div className="my-5 relative bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={600}
          height={60}
          className="w-full h-14 block"
        />
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-xs font-medium text-slate-400 bg-white/80 backdrop-blur-xs px-3 py-1 rounded-full border border-slate-200">
              Click Play to listen to authentic Indian female narration
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-1 mb-5">
        <input
          id="audio-scrubber-range"
          type="range"
          min="0"
          max={duration || 100}
          step="0.01"
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
        />
        <div className="flex justify-between text-xs text-slate-500 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Playback Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {/* Restart */}
          <button
            id="restart-audio-btn"
            onClick={restartAudio}
            className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition"
            title="Restart audio"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Play/Pause Button */}
          <button
            id="play-pause-main-btn"
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white flex items-center justify-center shadow-md hover:shadow-lg transition-transform active:scale-95"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          {/* Forward 5s */}
          <button
            id="skip-forward-btn"
            onClick={skipForward}
            className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition"
            title="Forward 5 seconds"
          >
            <FastForward className="w-4 h-4" />
          </button>

          {/* Loop toggle */}
          <button
            id="loop-toggle-btn"
            onClick={() => setIsLooping(!isLooping)}
            className={`p-2.5 rounded-full transition ${
              isLooping ? "bg-amber-100 text-amber-800" : "text-slate-500 hover:bg-slate-100"
            }`}
            title={isLooping ? "Looping active" : "Enable loop"}
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Speed & Volume */}
        <div className="flex items-center gap-4">
          {/* Playback Rate Button */}
          <button
            id="playback-speed-cycle-btn"
            onClick={cyclePlaybackRate}
            className="px-2.5 py-1 text-xs font-semibold font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
            title="Cycle Playback Speed"
          >
            {playbackRate}x
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button
              id="mute-toggle-btn"
              onClick={toggleMute}
              className="text-slate-500 hover:text-slate-700 transition"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              id="volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 sm:w-20 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
