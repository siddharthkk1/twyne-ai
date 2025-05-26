
import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import { Suspense } from 'react';

interface AvatarModelProps {
  url?: string;
}

const AvatarModel: React.FC<AvatarModelProps> = ({ url = "https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb" }) => {
  const { scene } = useGLTF(url);
  
  useEffect(() => {
    // Scale and position the model for full body view
    scene.scale.setScalar(1.5);
    scene.position.y = -2;
  }, [scene]);

  return <primitive object={scene} />;
};

interface HumanAvatar3DProps {
  className?: string;
  avatarUrl?: string;
}

const HumanAvatar3D: React.FC<HumanAvatar3DProps> = ({ 
  className = "", 
  avatarUrl 
}) => {
  return (
    <div className={`w-full h-96 ${className}`}>
      <Canvas 
        camera={{ position: [0, 0, 4], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Environment preset="studio" />
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <AvatarModel url={avatarUrl} />
          <OrbitControls 
            enablePan={false} 
            enableZoom={false} 
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 6}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default HumanAvatar3D;
