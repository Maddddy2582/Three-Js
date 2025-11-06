import { Canvas, useThree } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

function DraggableScene() {
  const planeSize = 6;
  const { camera , gl } = useThree();

  const cubeRef = useRef();
  const cylinderRef = useRef();
  const planeRef = useRef();

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const offset = new THREE.Vector3();
  const planeHitPoint = new THREE.Vector3();

  const [selected, setSelected] = useState(null);

  const updateMouse = (event) => {
    const rect = gl.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  };

  const onMouseDown = (event) => {
    updateMouse(event);

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects([cubeRef.current, cylinderRef.current]);

    if (hits.length) {
      const target = hits[0].object;
      setSelected(target);

      // compute offset from mouse click point
      const planeHit = raycaster.intersectObject(planeRef.current);
      if (planeHit.length) {
        offset.copy(planeHit[0].point).sub(target.position);
      }
    }
  };

  const onMouseMove = (event) => {
    if (!selected) return;

    updateMouse(event);
    raycaster.setFromCamera(mouse, camera);

    const planeHit = raycaster.intersectObject(planeRef.current);
    if (planeHit.length) {
      planeHitPoint.copy(planeHit[0].point).sub(offset);

      // clamp movement
      const half = planeSize / 2 - 0.5;
      planeHitPoint.x = THREE.MathUtils.clamp(planeHitPoint.x, -half, half);
      planeHitPoint.z = THREE.MathUtils.clamp(planeHitPoint.z, -half, half);

      selected.position.set(planeHitPoint.x, 0.5, planeHitPoint.z);
    }
  };

  const onMouseUp = () => setSelected(null);

  return (
    <group
      onPointerDown={onMouseDown}
      onPointerMove={onMouseMove}
      onPointerUp={onMouseUp}
    >
      {/* Plane */}
      <mesh
        ref={planeRef}
        rotation-x={-Math.PI / 2}
        receiveShadow
      >
        <planeGeometry args={[planeSize, planeSize]} />
        <meshStandardMaterial color={0x888888} side={THREE.DoubleSide} />
      </mesh>

      {/* Cube */}
      <mesh ref={cubeRef} position={[-1.5, 0.5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={0xff4444} />
      </mesh>

      {/* Cylinder */}
      <mesh ref={cylinderRef} position={[1.5, 0.5, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 1, 32]} />
        <meshStandardMaterial color={0x44aaff} />
      </mesh>

      {/* Lights */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
    </group>
  );
}

export default function App() {
  return (
    <Canvas
  camera={{ position: [8, 8, 8], fov: 50 }}
  style={{ width: "100%", height: "100vh", background: "#222" }}
>
      <DraggableScene />
    </Canvas>
  );
}
