import { useEffect, useState } from 'react';

export interface KillStreakNotificationProps {
    /** Current kill streak count. */
    streak?: number;
    /** Duration to show the notification in milliseconds. Default: 1500. */
    duration?: number;
    /** Map of streak counts to display names. */
    streakNames?: Record<number, string>;
    /** CSS class for the container. */
    className?: string;
}

const DEFAULT_STREAK_NAMES: Record<number, string> = {
    2: 'DOUBLE KILL',
    3: 'TRIPLE KILL',
    4: 'MULTI KILL',
    5: 'MEGA KILL',
    6: 'ULTRA KILL',
    7: 'MONSTER KILL',
};

/**
 * A generalized Kill Streak notification component.
 *
 * @category UI
 */
export function KillStreakNotification({
    streak = 0,
    duration = 1500,
    streakNames = DEFAULT_STREAK_NAMES,
    className,
}: KillStreakNotificationProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [currentStreak, setCurrentStreak] = useState(0);

    useEffect(() => {
        if (streak >= 2) {
            setCurrentStreak(streak);
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [streak, duration]);

    if (!isVisible || currentStreak < 2) return null;

    // Find the highest-numbered streak name that is <= currentStreak
    const getStreakText = () => {
        // Direct match
        if (streakNames[currentStreak]) {
            return streakNames[currentStreak];
        }
        // Find highest key <= currentStreak
        const keys = Object.keys(streakNames)
            .map(Number)
            .sort((a, b) => b - a);
        for (const key of keys) {
            if (currentStreak >= key) {
                return streakNames[key];
            }
        }
        return 'STREAK!';
    };

    const streakName = getStreakText();

    return (
        <div
            className={className}
            style={{
                position: 'fixed',
                top: '20%',
                left: '50%',
                transform: 'translateX(-50%)',
                textAlign: 'center',
                pointerEvents: 'none',
                zIndex: 9998,
            }}
        >
            <div
                style={{
                    fontSize: '3rem',
                    fontWeight: 'bold',
                    color: '#ff0044',
                    textShadow: '0 0 10px rgba(255, 0, 68, 0.8)',
                    fontFamily: 'sans-serif',
                }}
            >
                {streakName}
            </div>
            <div
                style={{
                    fontSize: '1.5rem',
                    color: '#ffffff',
                    marginTop: '0.5rem',
                }}
            >
                {currentStreak} KILLS
            </div>
        </div>
    );
}
