// App.jsx
import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  useTexture,
  Stars,
  Environment,
} from "@react-three/drei";
import * as THREE from "three";

function PlanetarySystem() {
  // Load all textures
  const [
    sunTexture,
    mercuryTexture,
    venusTexture,
    earthTexture,
    marsTexture,
    moonTexture,
  ] = useTexture([
    "../src/textures/2k_sun.jpg",
    "../src/textures/2k_mercury.jpg",
    "../src/textures/2k_venus_surface.jpg",
    "../src/textures/2k_earth_daymap.jpg",
    "../src/textures/2k_mars.jpg",
    "../src/textures/2k_moon.jpg",
  ]);

  // Configure color space for accurate color rendering
  [
    sunTexture,
    mercuryTexture,
    venusTexture,
    earthTexture,
    marsTexture,
    moonTexture,
  ].forEach((t) => (t.colorSpace = THREE.SRGBColorSpace));

  // Define planet data (like your JS version)
  const planets = useMemo(
    () => [
      {
        name: "Mercury",
        radius: 0.5,
        distance: 10,
        speed: 0.01,
        map: mercuryTexture,
        moons: [],
      },
      {
        name: "Venus",
        radius: 0.8,
        distance: 15,
        speed: 0.007,
        map: venusTexture,
        moons: [],
      },
      {
        name: "Earth",
        radius: 1,
        distance: 20,
        speed: 0.005,
        map: earthTexture,
        moons: [
          { name: "Moon", radius: 0.3, distance: 3, speed: 0.015, map: moonTexture },
        ],
      },
      {
        name: "Mars",
        radius: 0.7,
        distance: 25,
        speed: 0.003,
        map: marsTexture,
        moons: [
          { name: "Phobos", radius: 0.1, distance: 2, speed: 0.02, map: moonTexture },
          { name: "Deimos", radius: 0.2, distance: 3, speed: 0.015, map: moonTexture },
        ],
      },
    ],
    [
      mercuryTexture,
      venusTexture,
      earthTexture,
      marsTexture,
      moonTexture,
    ]
  );

  const planetRefs = useRef([]);

  // Animate orbits
useFrame(() => {
  for (let i = 0; i < planets.length; i++) {
    const planet = planetRefs.current[i];
    const data = planets[i];
    if (!planet || !data) continue; // ✅ skip until mounted

    // Rotate planet around the sun
    planet.rotation.y += data.speed;
    planet.position.x = Math.sin(planet.rotation.y) * data.distance;
    planet.position.z = Math.cos(planet.rotation.y) * data.distance;

    // Rotate moons
    if (planet.children.length && data.moons?.length) {
      for (let mi = 0; mi < data.moons.length; mi++) {
        const moon = planet.children[mi];
        const mdata = data.moons[mi];
        if (!moon || !mdata) continue;
        moon.rotation.y += mdata.speed;
        moon.position.x = Math.sin(moon.rotation.y) * mdata.distance;
        moon.position.z = Math.cos(moon.rotation.y) * mdata.distance;
      }
    }
  }
});



  return (
    <>
      {/* Sun */}
      <mesh scale={[5, 5, 5]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial map={sunTexture} />
      </mesh>

      {/* Planets and Moons */}
      {planets.map((planet, i) => (
        <group key={planet.name} ref={(el) => (planetRefs.current[i] = el)}>
          <mesh>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial map={planet.map} />
          </mesh>

          {/* Moons */}
          {planet.moons.map((moon) => (
            <mesh key={moon.name} position={[moon.distance, 0, 0]}>
              <sphereGeometry args={[moon.radius, 32, 32]} />
              <meshStandardMaterial map={moon.map} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 0]} intensity={1000} />

      {/* Background stars or cubemap */}
      {/* <Stars radius={300} depth={60} count={20000} factor={7} fade /> */}
      <Environment
  files={[
    "../src/textures/cubeMap/px.png",
    "../src/textures/cubeMap/nx.png",
    "../src/textures/cubeMap/py.png",
    "../src/textures/cubeMap/ny.png",
    "../src/textures/cubeMap/pz.png",
    "../src/textures/cubeMap/nz.png",
  ]}
  background
/>

    </>
  );
}

function CameraSetup() {
  const { camera } = useThree();
  camera.position.set(0, 5, 100);
  return null;
}

export default function App() {
  return (
    <Canvas
      camera={{ fov: 35, near: 0.1, far: 400 }}
      style={{ width: "100vw", height: "100vh", background: "black" }}
    >
      <color attach="background" args={["#000000"]} />
      <CameraSetup />
      <PlanetarySystem />
      <OrbitControls
        enableDamping
        maxDistance={200}
        minDistance={20}
      />
    </Canvas>
  );
}
