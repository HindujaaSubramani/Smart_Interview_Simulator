import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import AvatarController from './AvatarController';

export default function AvatarScene() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas camera={{ position: [0, 1.6, 2.5] }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[1, 2, 3]} intensity={1.5} />
        <Suspense fallback={null}>
          <AvatarController />
          <Environment preset="studio" />
        </Suspense>
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}
