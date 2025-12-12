/**
 * WeatherAudio Component
 *
 * Weather audio system for rain, wind, and thunder effects.
 * @module components/audio
 */

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Howl } from 'howler';
import { AmbientAudio } from './AmbientAudio';
import type { WeatherAudioProps, AmbientAudioRef } from './types';

/**
 * Weather audio system for rain, wind, and thunder effects.
 *
 * @example
 * ```tsx
 * const [stormIntensity, setStormIntensity] = useState(0);
 *
 * <WeatherAudio
 *   rainUrl="/sounds/rain-loop.mp3"
 *   windUrl="/sounds/wind-loop.mp3"
 *   thunderUrl="/sounds/thunder.mp3"
 *   rainIntensity={stormIntensity * 0.8}
 *   windIntensity={stormIntensity * 0.5}
 *   thunderActive={stormIntensity > 0.7}
 *   fadeTime={2}
 * />
 * ```
 */
export function WeatherAudio({
    rainUrl,
    thunderUrl,
    windUrl,
    rainIntensity = 0,
    windIntensity = 0,
    thunderActive = false,
    fadeTime = 1,
}: WeatherAudioProps) {
    const rainRef = useRef<AmbientAudioRef>(null);
    const windRef = useRef<AmbientAudioRef>(null);
    const thunderHowlRef = useRef<Howl | null>(null);
    const lastThunderTime = useRef(0);

    useEffect(() => {
        if (!thunderUrl) return;

        thunderHowlRef.current = new Howl({
            src: [thunderUrl],
            volume: 1,
            pool: 3,
            preload: true,
        });

        return () => {
            thunderHowlRef.current?.unload();
            thunderHowlRef.current = null;
        };
    }, [thunderUrl]);

    useEffect(() => {
        if (!rainRef.current) return;

        if (rainIntensity > 0) {
            rainRef.current.setVolume(rainIntensity, fadeTime);
            if (!rainRef.current.isPlaying()) {
                rainRef.current.fadeIn(fadeTime);
            }
        } else {
            rainRef.current.fadeOut(fadeTime);
        }
    }, [rainIntensity, fadeTime]);

    useEffect(() => {
        if (!windRef.current) return;

        if (windIntensity > 0) {
            windRef.current.setVolume(windIntensity, fadeTime);
            if (!windRef.current.isPlaying()) {
                windRef.current.fadeIn(fadeTime);
            }
        } else {
            windRef.current.fadeOut(fadeTime);
        }
    }, [windIntensity, fadeTime]);

    useFrame((state) => {
        if (!thunderActive || !thunderHowlRef.current) return;

        const timeSinceLast = state.clock.elapsedTime - lastThunderTime.current;
        if (timeSinceLast > 5 && Math.random() < 0.01) {
            thunderHowlRef.current.play();
            lastThunderTime.current = state.clock.elapsedTime;
        }
    });

    return (
        <>
            {rainUrl && <AmbientAudio ref={rainRef} url={rainUrl} volume={0} loop />}
            {windUrl && <AmbientAudio ref={windRef} url={windUrl} volume={0} loop />}
        </>
    );
}
