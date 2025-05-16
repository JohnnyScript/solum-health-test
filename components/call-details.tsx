"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { formatDuration } from "@/lib/utils";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface CallDetailsProps {
  call: {
    id: string;
    date: string;
    time: string;
    assistant: string;
    clinic: string;
    duration: number;
    outcome: string;
    outcome_score: number;
    audioUrl: string;
  };
}

export function CallDetails({ call }: CallDetailsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;

      const updateTime = () => {
        setCurrentTime(audio.currentTime);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      audio.addEventListener("timeupdate", updateTime);
      audio.addEventListener("ended", handleEnded);

      return () => {
        audio.removeEventListener("timeupdate", updateTime);
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, []);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSliderChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        0,
        audioRef.current.currentTime - 10
      );
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.duration,
        audioRef.current.currentTime + 10
      );
    }
  };

  const changePlaybackRate = () => {
    const rates = [0.5, 1, 1.5, 2];
    const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);

    if (audioRef.current) {
      audioRef.current.playbackRate = rates[nextIndex];
    }
  };

  const getOutcomeColor = (score: number) => {
    if (score > 0.8) return "default";
    if (score < 0.5) return "destructive";
    return "secondary";
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Call Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">ID</p>
                <p className="font-medium">{call.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date and Time</p>
                <p className="font-medium">
                  {call.date} {call.time}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Assistant</p>
                <p className="font-medium">{call.assistant}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clinic</p>
                <p className="font-medium">{call.clinic}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{formatDuration(call.duration)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Outcome</p>
                <Badge variant={getOutcomeColor(call.outcome_score)}>
                  {call.outcome}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Recording</h2>
            <audio ref={audioRef} src={call.audioUrl} className="hidden" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {formatDuration(Math.floor(currentTime))}
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatDuration(call.duration)}
                </span>
              </div>

              <Slider
                value={[currentTime]}
                max={call.duration}
                step={1}
                onValueChange={handleSliderChange}
                className="w-full"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={skipBackward}
                    aria-label="Skip back 10 seconds"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="default"
                    size="icon"
                    onClick={togglePlayPause}
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={skipForward}
                    aria-label="Skip forward 10 seconds"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={changePlaybackRate}
                  className="text-xs"
                >
                  {playbackRate}x
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
