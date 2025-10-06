import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useRef, useEffect } from "react";
import gsap from "gsap";

function Astronaut() {
    const { scene } = useGLTF("/models/astronaut.glb");
    const ref = useRef();

    // Float + rotate
    useEffect(() => {
        if (ref.current) {
            gsap.to(ref.current.rotation, {
                y: Math.PI * 2,
                duration: 40,
                repeat: -1,
                ease: "linear",
            });
            gsap.to(ref.current.position, {
                y: "+=0.5",
                duration: 3,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut",
            });
        }
    }, []);

    // Mouse drift
    let mouseX = 0, mouseY = 0;
    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    useFrame(() => {
        if (ref.current) {
            ref.current.position.x += (mouseX * 0.5 - ref.current.position.x) * 0.02;
            ref.current.position.z += (mouseY * 0.5 - ref.current.position.z) * 0.02;
        }
    });

    return <primitive ref={ref} object={scene} scale={1.5} position={[0, -1, 0]} />;
}

export default function ThreeScene() {
    return (
        <Canvas
            camera={{ position: [0, 0, 5], fov: 60 }}
            style={{ background: "#000" }}
        >
            <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <Suspense fallback={null}>
                <Astronaut />
            </Suspense>
            <OrbitControls enableZoom={false} />
        </Canvas>
    );
}
