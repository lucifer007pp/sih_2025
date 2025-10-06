import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import How from "./pages/How";
import Simulation from "./pages/Simulation";
import Learning from "./pages/Learning.jsx";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/how" element={<How />} />
            <Route path="/simulation" element={<Simulation />} />
            <Route path="/learning" element={<Learning />} />
        </Routes>
    );
}

export default App;