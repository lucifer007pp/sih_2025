import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import "./How.css";

export default function How() {
    const [showVideo, setShowVideo] = useState(false);
    const [showFeatureBox, setShowFeatureBox] = useState(false);
    const navigate = useNavigate();
    const confettiRef = useRef(null);

    // Create a single confetti shot
    const makeShot = useCallback((particleRatio, opts) => {
        if (confettiRef.current) {
            confettiRef.current({
                ...opts,
                origin: { y: 0.7 },
                particleCount: Math.floor(200 * particleRatio),
                spread: 80,
                startVelocity: 45,
                scalar: 1.4, // make confetti larger (paper-like)
                ticks: 200, // last longer
                gravity: 1.1, // more realistic fall
                colors: [
                    "#FF4081",
                    "#FFD740",
                    "#00E676",
                    "#40C4FF",
                    "#FF6B9A",
                    "#FFFFFF",
                ],
            });
        }
    }, []);

    // Continuous raining confetti (color paper effect)
    const startConfettiLoop = () => {
        const duration = 3000;
        const end = Date.now() + duration;

        (function frame() {
            if (confettiRef.current) {
                confettiRef.current({
                    particleCount: 4,
                    startVelocity: 20,
                    spread: 360,
                    ticks: 180,
                    gravity: 1.1,
                    origin: {
                        x: Math.random(),
                        y: Math.random() - 0.2,
                    },
                    scalar: 1.4,
                    colors: [
                        "#FF4081",
                        "#FFD740",
                        "#00E676",
                        "#40C4FF",
                        "#FF6B9A",
                        "#FFFFFF",
                    ],
                });
            }
            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        })();
    };

    const handleUnlockClick = () => {
        setShowFeatureBox(true);
        startConfettiLoop();
        confetti({
            particleCount: 150,
            spread: 80
        })
    };

    return (
        <div className="how-container">
            {/* Background Layer */}
            <div className="background"></div>

            {/* Main Content */}
            <div className="how-content">
                <h1 className="how-title">Astronaut Sleep-Integrated Training System</h1>

                {/* Buttons */}
                <div className="how-buttons">
                    <button className="btn pink" onClick={() => setShowVideo(true)}>
                        🎥 Watch Demo
                    </button>
                    <button className="btn green" onClick={() => navigate('/simulation')}>
                        🚀 Try Simulation
                    </button>
                    <button className="btn yellow" onClick={handleUnlockClick}>
                        🔓 Unlock New Features
                    </button>
                </div>

                {/* System Capabilities */}
                <section className="section-container">
                    <h2 className="section-title">System Capabilities</h2>
                    <div className="steps-grid">
                        <div className="step-card">
                            <span className="step-card-icon">🤖</span>
                            <h3>Quantum Machine Learning (QML)</h3>
                            <p>Performs ultra-fast, real-time REM detection from EEG/EOG signals efficiently.</p>
                        </div>
                        <div className="step-card">
                            <span className="step-card-icon">🧠</span>
                            <h3>CNN + LSTM Model</h3>
                            <p>Refines QML outputs for accuracy and temporal consistency; integrates with wearables.</p>
                        </div>
                        <div className="step-card">
                            <span className="step-card-icon">🔥</span>
                            <h3>Cue Delivery System</h3>
                            <p>Triggers gentle audio or vibration cues to induce lucid dreaming without disruption.</p>
                        </div>
                        <div className="step-card">
                            <span className="step-card-icon">💪</span>
                            <h3>Live REM Monitoring</h3>
                            <p>Tracks REM vs. NON-REM states in real time, showing confidence metrics dynamically.</p>
                        </div>
                        <div className="step-card">
                            <span className="step-card-icon">📚</span>
                            <h3>Memory Boost</h3>
                            <p>Optimized sleep architecture enhances memory consolidation during REM cycles.</p>
                        </div>
                        <div className="step-card">
                            <span className="step-card-icon">🎮</span>
                            <h3>Simulation Replay</h3>
                            <p>Replay dream-based training simulations for continuous mastery improvement.</p>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="section-container">
                    <h2 className="section-title">How It Works</h2>
                    <div className="steps-grid">
                        <div className="step-card"><span className="step-card-icon">🌙</span><h3>Before Sleep</h3><p>Selects scenario with neural interface and real-time brainwave monitoring.</p></div>
                        <div className="step-card"><span className="step-card-icon">📊</span><h3>Sleep Monitoring</h3><p>AI system detects REM patterns from EEG signals using advanced ML algorithms.</p></div>
                        <div className="step-card"><span className="step-card-icon">🎯</span><h3>Dream Nudging</h3><p>Light, audio, and haptic cues direct dreams toward mission training goals.</p></div>
                        <div className="step-card"><span className="step-card-icon">🚀</span><h3>Dream Training</h3><p>Lucid-trained astronauts refine complex skills during REM-based sessions.</p></div>
                        <div className="step-card"><span className="step-card-icon">📝</span><h3>Wake-Up Analysis</h3><p>EEG and feedback data analyzed for optimizing training outcomes.</p></div>
                    </div>
                </section>

                {/* Video Modal */}
                {showVideo && (
                    <div className="video-modal fade-in">
                        <div className="video-content">
                            <button onClick={() => setShowVideo(false)} className="close-btn">✖</button>
                            <iframe
                                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                                title="Demo Video"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                )}

                {/* Feature Unlock Modal */}
                {showFeatureBox && (
                    <div className="video-modal fade-in">
                        <div className="video-content feature-box">
                            <button onClick={() => setShowFeatureBox(false)} className="close-btn">✖</button>
                            <h2>🚀 Up Coming Features!</h2>
                            <ul className="feature-list">
                                <li>📊 Dynamic Dashboard </li>
                                <li>👁️ Live Monitoring </li>
                                <li>💬 Training Feedback </li>
                                <li>📝 Training Assessment </li>
                                <li>💾 Live Data Extractor </li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Section */}
            <section>
                <h2 className="section-title">Contact Us</h2>
                <div className="contact_info">
                    Drop an email : <p>sayanatn@astronudge.tech</p>
                </div>
            </section>
            <footer>©2025 Astro Nudge | All rights reserved</footer>
        </div>
    );
}
