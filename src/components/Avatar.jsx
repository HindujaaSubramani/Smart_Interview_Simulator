import * as THREE from 'three';
import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

function CarlaModel({ onBoxComputed }) {
  const groupRef = useRef();
  const { scene } = useGLTF('/models/carla.glb');

  useEffect(() => {
    if (!groupRef.current) return;

    const box = new THREE.Box3().setFromObject(groupRef.current);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Align feet to y = 0, so model is grounded
    scene.position.y -= box.min.y;

    onBoxComputed({ center, size });
  }, [scene, onBoxComputed]);

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

function CameraSetup({ center, size }) {
  const { camera } = useThree();

  React.useLayoutEffect(() => {
    if (!center || !size) return;

    // Zoom in and raise camera to hide the hands
    camera.position.set(
      center.x,
      center.y + size.y * 0.7,   // raise to approximately head/top of shoulders
      center.z + size.z * 0.5     // zoom in to exclude hands
    );

    // Look slightly below top of head so upper chest + head are centered
    camera.lookAt(center.x, center.y + size.y * 0.4, center.z);
    camera.updateProjectionMatrix();
  }, [camera, center, size]);

  return null;
}

function Controls({ center, size }) {
  const { camera, gl } = useThree();

  useEffect(() => {
    if (!center || !size) return;

    // Ensure orbit pivot remains at head/upper‐chest region
    camera.lookAt(center.x, center.y + size.y * 0.4, center.z);
  }, [camera, center, size]);

  return (
    <OrbitControls
      args={[camera, gl.domElement]}
      enableZoom={true}
      maxPolarAngle={Math.PI / 2}
      minPolarAngle={Math.PI / 3}
      target={new THREE.Vector3(
        center.x,
        center.y + size.y * 0.4,
        center.z
      )}
    />
  );
}

export default function Avatar() {
  const [boxData, setBoxData] = useState({ center: null, size: null });

  return (
    <div style={{ width: '500px', height: '500px', margin: 'auto' }}>
      <Canvas>
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 2, 2]} intensity={1} />

        <Suspense fallback={null}>
          <CarlaModel onBoxComputed={setBoxData} />
        </Suspense>

        {boxData.center && boxData.size && (
          <>
            <CameraSetup center={boxData.center} size={boxData.size} />
            <Controls center={boxData.center} size={boxData.size} />
          </>
        )}
      </Canvas>
    </div>
  );
}
