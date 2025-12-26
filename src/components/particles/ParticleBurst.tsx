import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { ParticleEmitter } from './ParticleEmitter';
import type { ParticleBurstProps, ParticleEmitterRef } from './types';

/**
 * One-Shot Particle Burst.
 *
 * Triggers an instantaneous emission of particles. Ideal for explosions,
 * impacts, or one-time magic effects. Extends all ParticleEmitter properties.
 *
 * @category Effects & Atmosphere
 * @example
 * ```tsx
 * const [hit, setHit] = useState(false);
 *
 * <ParticleBurst
 *   trigger={hit}
 *   count={50}
 *   position={impactPos}
 *   onComplete={() => setHit(false)}
 * />
 * ```
 */
export const ParticleBurst = forwardRef<ParticleEmitterRef, ParticleBurstProps>(
    ({ count = 100, trigger = false, onComplete, ...props }, ref) => {
        const emitterRef = useRef<ParticleEmitterRef>(null);
        const lastTrigger = useRef<boolean | number>(false);

        useImperativeHandle(ref, () => {
            if (!emitterRef.current) {
                throw new Error('ParticleBurst: emitter not initialized');
            }
            return emitterRef.current;
        });

        useEffect(() => {
            if (trigger !== lastTrigger.current && trigger) {
                emitterRef.current?.burst(count);
                lastTrigger.current = trigger;
            }
        }, [trigger, count]);

        return <ParticleEmitter ref={emitterRef} {...props} emissionRate={0} autoStart={false} />;
    }
);

ParticleBurst.displayName = 'ParticleBurst';
