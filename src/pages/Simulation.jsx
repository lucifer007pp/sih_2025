import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Simulation.css";

const API_URL = "https://my-q4b1.onrender.com";

export default function Simulation() {
    const [steps, setSteps] = useState([]);
    const [running, setRunning] = useState(false);
    const [file, setFile] = useState(null);
    const [modelStatus, setModelStatus] = useState("checking...");
    const [systemProgress, setSystemProgress] = useState({
        ECG: 0,
        EOG: 0,
        EEG: 0,
        BP: 0,
    });

    const [showBP, setShowBP] = useState(false);
    const [systolic, setSystolic] = useState(120);
    const [diastolic, setDiastolic] = useState(80);

    const wsRef = useRef(null);
    const logContainerRef = useRef(null);
    const navigate = useNavigate();

    // Check model status
    useEffect(() => {
        checkModelStatus();
    }, []);

    const checkModelStatus = async () => {
        try {
            const response = await fetch(`${API_URL}/model-status`);
            const data = await response.json();
            setModelStatus(
                data.model_loaded
                    ? "✅ CNNBiLSTM Model Loaded"
                    : "🔶 Using Simulated Detection"
            );
        } catch {
            setModelStatus("❌ Cannot connect to backend because of free public hosting , Please try again");
        }
    };

    // Auto-scroll logs
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [steps]);

    useEffect(() => {
        return () => {
            if (wsRef.current) wsRef.current.close();
        };
    }, []);

    // BP fluctuation effect
    useEffect(() => {
        if (!showBP) return;
        const interval = setInterval(() => {
            setSystolic(prev => {
                let newVal = prev + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5));
                if (newVal < 110) newVal = 110;
                if (newVal > 150) newVal = 150;
                return newVal;
            });
            setDiastolic(prev => {
                let newVal = prev + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3));
                if (newVal < 70) newVal = 70;
                if (newVal > 100) newVal = 100;
                return newVal;
            });
        }, 2000);

        return () => clearInterval(interval);
    }, [showBP]);

    // Delay BP after ECG/EOG/EEG hit 100
    useEffect(() => {
        if (
            systemProgress.ECG === 100 &&
            systemProgress.EOG === 100 &&
            systemProgress.EEG === 100 &&
            !showBP
        ) {
            const timestamp = new Date().toLocaleTimeString();
            setSteps(prev => [...prev, `🩺 BP measurement started at ${timestamp}`]);

            setTimeout(() => {
                setShowBP(true);
            }, 3000);
        }
    }, [systemProgress, showBP]);

    // ====== Simulation start logic ======
    const startSimulation = async () => {
        if (!file) {
            setSteps(prev => [...prev, "❌ Please select a CSV file first"]);
            return;
        }

        setRunning(true);
        setSteps([]);
        setShowBP(false);

        // Instantly fill ECG/EOG/EEG to 100
        setSystemProgress({ ECG: 100, EOG: 100, EEG: 100, BP: 0 });

        try {
            setSteps(prev => [...prev, "📁 Processing uploaded file..."]);

            const reader = new FileReader();
            reader.onload = async e => {
                try {
                    const csvContent = e.target.result;
                    const base64Content = btoa(unescape(encodeURIComponent(csvContent)));

                    const resp = await fetch(`${API_URL}/upload-csv`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            filename: file.name,
                            content_base64: base64Content,
                        }),
                    });

                    if (!resp.ok) {
                        const errorData = await resp.json();
                        throw new Error(errorData.detail || `Upload failed: ${resp.statusText}`);
                    }

                    const data = await resp.json();
                    const jobId = data.job_id;

                    setSteps(prev => [
                        ...prev,
                        `📁 File uploaded: ${file.name}`
                    ]);

                    connectWebSocket(jobId);
                } catch (error) {
                    setSteps(prev => [...prev, `❌ Upload error: ${error.message}`]);
                    setRunning(false);
                }
            };

            reader.onerror = () => {
                setSteps(prev => [...prev, "❌ Failed to read file"]);
                setRunning(false);
            };

            reader.readAsText(file);
        } catch (error) {
            setSteps(prev => [...prev, `❌ Failed to start simulation: ${error.message}`]);
            setRunning(false);
        }
    };

    const connectWebSocket = jobId => {
        const wsUrl = `${API_URL.replace(/^http/, "ws")}/ws/${jobId}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => setSteps(prev => [...prev, "⚡ Connected to sleep analysis system"]);

        ws.onmessage = event => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === "result") {
                    const confidencePercent = Math.round(data.result.confidence * 100);
                    const modelUsed = data.result.model_used || "unknown";
                    const prediction = data.result.prediction;

                    setSteps(prev => [
                        ...prev,
                        `🎯 ANALYSIS COMPLETE`,
                        `🌙 Sleep Stage: ${prediction}`,
                        `📊 Confidence: ${confidencePercent}%`,
                        `🔧 Method: ${modelUsed}`,
                        `🕒 Completed: ${new Date().toLocaleTimeString()}`,
                    ]);

                    // 🚀 Auto-redirect to learning page if REM detected
                    if (prediction && prediction.toUpperCase() === "REM") {
                        setSteps(prev => [...prev, "📚 REM detected - Redirecting to learning page..."]);
                        setTimeout(() => navigate("/learning"), 1500); // slight delay for logs
                    }

                    ws.close();
                    setRunning(false);
                } else if (data.type === "error") {
                    setSteps(prev => [...prev, `❌ Error: ${data.message}`]);
                    ws.close();
                    setRunning(false);
                }
            } catch {
                setSteps(prev => [...prev, `❌ Failed to parse message: ${event.data}`]);
            }
        };

        ws.onerror = () => {
            setSteps(prev => [...prev, "❌ WebSocket connection error"]);
            setRunning(false);
        };

        ws.onclose = () => {
            if (running) {
                setSteps(prev => [...prev, "🔌 Analysis complete - connection closed"]);
                setRunning(false);
            }
        };
    };

    const handleFileChange = e => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
                setSteps(prev => [...prev, "❌ Please select a CSV file"]);
                return;
            }
            setFile(selectedFile);
            setSteps(prev => [...prev, `📄 File selected: ${selectedFile.name}`]);
        }
    };

    const clearLogs = () => {
        setSteps([]);
        setFile(null);
        setSystemProgress({ ECG: 0, EOG: 0, EEG: 0, BP: 0 });
        setShowBP(false);
    };

    const getStatusClass = () => {
        if (modelStatus.includes("✅")) return "status-badge loaded";
        if (modelStatus.includes("🔶")) return "status-badge simulated";
        return "status-badge error";
    };

    const renderCircle = (progress, label, icon, color) => {
        const radius = 70;
        const circumference = 2 * Math.PI * radius;
        return (
            <div className="dashboard-card">
                <svg className="progress-ring" width="160" height="160">
                    <circle
                        stroke={color}
                        strokeWidth="10"
                        fill="transparent"
                        r={radius}
                        cx="80"
                        cy="80"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - (progress / 100) * circumference}
                        style={{
                            transform: "rotate(-90deg)",
                            transformOrigin: "50% 50%",
                            transition: "stroke-dashoffset 0.5s ease",
                        }}
                    />
                </svg>
                <div className="dashboard-label">
                    <div className="dashboard-icon">{icon}</div>
                    <div>{label}</div>
                    <div>{progress}%</div>
                </div>
            </div>
        );
    };

    // ===================== JSX =====================
    return (
        <div className="simulation-container">
            <div className="simulation-content">
                {/* Header */}
                <div className="simulation-header">
                    <h1 className="simulation-title">🌙 Sleep Training Simulation</h1>
                    <p className="simulation-subtitle">Astronaut Sleep-Integrated Training System</p>
                    <div className={getStatusClass()}>{modelStatus}</div>
                </div>

                {/* Circular Dashboard */}
                <div className="dashboard-circulars">
                    {renderCircle(systemProgress.ECG, "ECG", "💓", "#22c55e")}
                    {renderCircle(systemProgress.EOG, "EOG", "👁️", "#22c55e")}
                    {renderCircle(systemProgress.EEG, "EEG", "🧠", "#22c55e")}

                    {/* BP Circle */}
                    {showBP && (
                        <div className="dashboard-card bp-gauge">
                            <svg className="progress-ring" width="160" height="160">
                                <circle
                                    stroke={
                                        systolic >= 140 || diastolic >= 100
                                            ? "#ef4444"
                                            : systolic >= 130 || diastolic >= 90
                                                ? "#facc15"
                                                : "#22c55e"
                                    }
                                    strokeWidth="10"
                                    fill="transparent"
                                    r="70"
                                    cx="80"
                                    cy="80"
                                    strokeDasharray={2 * Math.PI * 70}
                                    strokeDashoffset={0}
                                    style={{
                                        transform: "rotate(-90deg)",
                                        transformOrigin: "50% 50%",
                                        transition: "stroke 0.5s ease",
                                    }}
                                />
                            </svg>
                            <div className="dashboard-label">
                                <div className="dashboard-icon">🩺</div>
                                <div>BP</div>
                                <div>{systolic}/{diastolic} mmHg</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="control-panel">
                    <div className="control-grid">
                        <div className="upload-section">
                            <label className="upload-label">Upload EEG Data CSV</label>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                disabled={running}
                                className="file-input"
                            />
                            {file && (
                                <div className="file-info">
                                    <p className="file-name">✅ Ready: {file.name}</p>
                                    <p className="file-size">Size: {(file.size / 1024).toFixed(2)} KB</p>
                                </div>
                            )}
                        </div>
                        <div className="action-section">
                            <button
                                onClick={startSimulation}
                                disabled={running || !file}
                                className="analyze-btn"
                            >
                                {running ? (
                                    <>
                                        <div className="loading-spinner"></div>
                                        Analyzing...
                                    </>
                                ) : (
                                    "🚀 Start Sleep Analysis"
                                )}
                            </button>
                            <div className="secondary-buttons">
                                <button onClick={clearLogs} className="secondary-btn clear-btn">
                                    🗑️ Clear
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="navigation-section">
                        <button onClick={() => navigate("/how")} className="back-btn">
                            ⬅ Back to Overview
                        </button>
                    </div>
                </div>

                {/* Logs */}
                <div className="progress-log">
                    <div className="log-header">
                        <h2 className="log-title">Analysis Progress</h2>
                        <span className="log-count">{steps.length} events</span>
                    </div>
                    <div className="log-entries" ref={logContainerRef}>
                        {steps.length === 0 ? (
                            <div className="empty-state">
                                <p>No activity yet</p>
                                <p className="text-sm mt-2">
                                    Upload a CSV file and start analysis to see progress
                                </p>
                            </div>
                        ) : (
                            steps.map((step, index) => (
                                <div key={index} className="log-entry">
                                    {step}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="simulation-footer">
                    <p>©2025 Astro Nudge | All rights reserved</p>
                </div>
            </div>
        </div>
    );
}
