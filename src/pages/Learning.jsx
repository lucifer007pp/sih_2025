import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Learning.css";

export default function Learning() {
    const navigate = useNavigate();
    const [cards, setCards] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const animationRef = useRef(null);
    const audioRefs = useRef({});
    const timers = useRef([]);

    // Load cards
    useEffect(() => {
        fetch("/learning.json")
            .then((res) => res.json())
            .then((data) => setCards(data.cards))
            .catch((err) => console.error("Error loading learning cards:", err));
    }, []);

    // Clear all timers on unmount
    useEffect(() => {
        return () => timers.current.forEach(clearTimeout);
    }, []);

    const handleStart = (card, index) => {
        // Stop previous timers and audios
        timers.current.forEach(clearTimeout);
        timers.current = [];
        Object.values(audioRefs.current).forEach((audio) => {
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
                audio.loop = false;
            }
        });

        // Play main sound
        const mainAudio = audioRefs.current[`main_${index}`];
        if (mainAudio) {
            mainAudio.loop = true;
            mainAudio.currentTime = 0;
            mainAudio.play().catch((e) => console.warn("Autoplay blocked:", e));
        }

        // Play alarm sound continuously
        const beepAudio = audioRefs.current[`beep_${index}`];
        if (beepAudio) {
            beepAudio.loop = true;
            beepAudio.currentTime = 0;
            beepAudio.play().catch((e) => console.warn("Autoplay blocked:", e));
        }

        // Play extra sound
        const extraAudio = audioRefs.current[`extra_${index}`];
        if (extraAudio) {
            extraAudio.loop = true; // change to false if you want it once
            extraAudio.currentTime = 0;
            extraAudio.play().catch((e) => console.warn("Autoplay blocked:", e));
        }

        // Trigger vibration
        if ("vibrate" in navigator) {
            switch (card.vibration) {
                case "Short pulse":
                    navigator.vibrate(200);
                    break;
                case "Double buzz":
                    navigator.vibrate([200, 100, 200]);
                    break;
                case "Long vibration":
                    navigator.vibrate(600);
                    break;
                default:
                    break;
            }
        }

        // Start fullscreen animation
        setIsPlaying(true);
        if (animationRef.current) {
            animationRef.current.currentTime = 0;
            animationRef.current.play();
        }

        // Random stop time between 3:00 and 3:59
        const randomExtra = Math.floor(Math.random() * 60000); // 0–59s
        const stopTime = 180000 + randomExtra;

        // Schedule toast alerts 15s before end
        const alertBase = stopTime - 15000;
        const toastIntervals = [0, 5000, 10000];
        toastIntervals.forEach((delay, i) => {
            const t = setTimeout(() => {
                toast.error(` Non-REM detected (${i + 1})`, {
                    position: "top-center",
                    autoClose: 2000,
                    theme: "dark",
                });
            }, alertBase + delay);
            timers.current.push(t);
        });

        // Stop everything after stopTime
        const stopTimer = setTimeout(() => {
            setIsPlaying(false);
            Object.values(audioRefs.current).forEach((audio) => {
                if (audio) {
                    audio.pause();
                    audio.currentTime = 0;
                    audio.loop = false;
                }
            });
            navigator.vibrate(0);
        }, stopTime);
        timers.current.push(stopTimer);
    };

    return (
        <div className="learning-container">
            <div className="learning-content">
                <h1 className="learning-title">📚 Learning Session</h1>
                <p className="learning-subtitle">Let's Start the Course.</p>

                {cards.map((card, index) => (
                    <div key={index} className="learning-card">
                        <h2 className="card-title">{card.heading}</h2>

                        {/* Main sound */}
                        <audio
                            ref={(el) => (audioRefs.current[`main_${index}`] = el)}
                            src={card.voice_command}
                            preload="auto"
                        />

                        {/* Alarm sound */}
                        <audio
                            ref={(el) => (audioRefs.current[`beep_${index}`] = el)}
                            src={card.vibration}
                            preload="auto"
                        />

                        {/* Extra sound */}
                        <audio
                            ref={(el) => (audioRefs.current[`extra_${index}`] = el)}
                            src={card.soundCue}
                            preload="auto"
                        />

                        <button
                            className="start-btn"
                            onClick={() => handleStart(card, index)}
                        >
                            ▶ Start Learning
                        </button>
                    </div>
                ))}

                <div className="learning-actions">
                    <button className="back-btn" onClick={() => navigate("/simulation")}>
                        ⬅ Back to Simulation
                    </button>
                </div>
            </div>

            {/* Fullscreen Animation */}
            {isPlaying && (
                <div className="animation-overlay fullscreen">
                    <video
                        ref={animationRef}
                        src="/animation.mp4"
                        className="animation-player fullscreen-video"
                        autoPlay
                        muted
                        loop
                    />
                </div>
            )}

            <div className="learning-footer">
                <p>©2025 Astro Nudge | Cognitive Training in REM</p>
            </div>

            <ToastContainer />
        </div>
    );
}
