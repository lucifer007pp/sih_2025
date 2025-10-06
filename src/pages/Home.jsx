import { useNavigate } from "react-router-dom";
import ThreeScene from "../components/ThreeScene";

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            <ThreeScene />
            <div className="overlay">
                <h1>Astronaut Sleep-Integrated Training System</h1>
                <p>
                    Training astronauts through lucid dreaming and subconscious
                    conditioning.
                </p>
                <button onClick={() => navigate("/how")}>Explore the System</button>
            </div>
        </div>
    );
}
