'use client';
import { ChangeEvent, useEffect, useRef, useState } from 'react';

type TVideoPlayerProps = {
    src: string;
    className?: string;
    autoPlay?: boolean;
};

export const VideoPlayer = ({ src, className = '', autoPlay = false }: TVideoPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isControlsVisible, setIsControlsVisible] = useState(true);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
            setProgress((video.currentTime / video.duration) * 100);
        };

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
            video.currentTime = 0;
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('ended', handleEnded);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('ended', handleEnded);
        };
    }, []);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            video.play().catch(() => setIsPlaying(false));
        } else {
            video.pause();
        }
    }, [isPlaying]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        video.volume = isMuted ? 0 : volume;
    }, [volume, isMuted]);

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
        showControlsTemporarily();
    };

    const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (newVolume === 0) {
            setIsMuted(true);
        } else if (isMuted) {
            setIsMuted(false);
        }
        showControlsTemporarily();
    };

    const handleMuteToggle = () => {
        setIsMuted(!isMuted);
        showControlsTemporarily();
    };

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const video = videoRef.current;
        if (!video) return;

        const newProgress = parseFloat(e.target.value);
        setProgress(newProgress);
        video.currentTime = (newProgress / 100) * video.duration;
        showControlsTemporarily();
    };

    const formatTime = (timeInSeconds: number) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const showControlsTemporarily = () => {
        setIsControlsVisible(true);

        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }

        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) {
                setIsControlsVisible(false);
            }
        }, 3000);
    };

    const handleVideoContainerInteraction = () => {
        showControlsTemporarily();
    };

    return (
        <div
            className={`relative w-full ${className}`}
            onMouseMove={handleVideoContainerInteraction}
            onTouchStart={handleVideoContainerInteraction}
            onClick={handlePlayPause}
        >
            {' '}
            <button onClick={handleMuteToggle} className="absolute top-5 right-5 rounded-full bg-lime-400 p-2">
                {isMuted ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {' '}
                        <path d="M11 5L6 9H2V15H6L11 19V5Z" fill="white" />{' '}
                        <path d="M23 9L17 15" stroke="white" strokeWidth="2" strokeLinecap="round" />{' '}
                        <path d="M17 9L23 15" stroke="white" strokeWidth="2" strokeLinecap="round" />{' '}
                    </svg>
                ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {' '}
                        <path d="M11 5L6 9H2V15H6L11 19V5Z" fill="white" />{' '}
                        <path
                            d="M15.54 8.46C16.4774 9.39764 17.0039 10.6692 17.0039 11.995C17.0039 13.3208 16.4774 14.5924 15.54 15.53"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />{' '}
                        <path
                            d="M18.07 5.93C19.9447 7.80528 20.9979 10.3447 20.9979 13C20.9979 15.6553 19.9447 18.1947 18.07 20.07"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />{' '}
                    </svg>
                )}{' '}
            </button>{' '}
            <video
                ref={videoRef}
                className="h-full w-full object-cover"
                playsInline
                muted={autoPlay}
                autoPlay={autoPlay}
                loop={false}
            >
                {' '}
                <source src={src} type="video/mp4" />
                Your browser does not support the video tag.{' '}
            </video>
            {/* Custom controls overlay */}
            <div
                className={`absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/70 to-transparent p-3 transition-opacity duration-300 ${
                    isControlsVisible ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Progress bar */}
                <div className="mb-2 flex w-full items-center">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={handleProgressChange}
                        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/30 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-lime-400"
                    />
                </div>

                {/* Controls row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Play/Pause button */}
                        <button
                            onClick={handlePlayPause}
                            className="text-white focus:outline-none"
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isPlaying ? (
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <rect x="6" y="4" width="4" height="16" rx="1" fill="white" />
                                    <rect x="14" y="4" width="4" height="16" rx="1" fill="white" />
                                </svg>
                            ) : (
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M6 4L18 12L6 20V4Z" fill="white" />
                                </svg>
                            )}
                        </button>

                        {/* Volume controls */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleMuteToggle}
                                className="text-white focus:outline-none"
                                aria-label={isMuted ? 'Unmute' : 'Mute'}
                            >
                                {isMuted || volume === 0 ? (
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M11 5L6 9H2V15H6L11 19V5Z" fill="white" />
                                        <path d="M23 9L17 15" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M17 9L23 15" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                ) : (
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M11 5L6 9H2V15H6L11 19V5Z" fill="white" />
                                        <path
                                            d="M15.54 8.46C16.4774 9.39764 17.0039 10.6692 17.0039 11.995C17.0039 13.3208 16.4774 14.5924 15.54 15.53"
                                            stroke="white"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M18.07 5.93C19.9447 7.80528 20.9979 10.3447 20.9979 13C20.9979 15.6553 19.9447 18.1947 18.07 20.07"
                                            stroke="white"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                )}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="h-1 w-16 cursor-pointer appearance-none rounded-full bg-white/30 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-lime-400"
                            />
                        </div>
                    </div>

                    {/* Time display */}
                    <div className="text-xs text-white">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                </div>
            </div>
            {/* Play button overlay (shown when video is paused) */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <button
                        onClick={handlePlayPause}
                        className="rounded-full bg-lime-400/80 p-4 text-black transition-all hover:bg-lime-400"
                        aria-label="Play"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 4L18 12L6 20V4Z" fill="currentColor" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
};
