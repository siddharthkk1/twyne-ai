
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Mesh } from 'three';

const HumanAvatarModel = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.05;
      // Slight rotation for dynamic feel
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Head */}
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshStandardMaterial color="#fdbcb4" />
      </mesh>
      
      {/* Hair */}
      <mesh position={[0, 1.7, -0.05]}>
        <sphereGeometry args={[0.13, 32, 32]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[-0.04, 1.63, 0.1]}>
        <sphereGeometry args={[0.015, 16, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.04, 1.63, 0.1]}>
        <sphereGeometry args={[0.015, 16, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      
      {/* Nose */}
      <mesh position={[0, 1.58, 0.11]}>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshStandardMaterial color="#fdbcb4" />
      </mesh>
      
      {/* Mouth */}
      <mesh position={[0, 1.54, 0.1]}>
        <sphereGeometry args={[0.02, 16, 8]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>
      
      {/* Neck */}
      <mesh position={[0, 1.45, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.1, 16]} />
        <meshStandardMaterial color="#fdbcb4" />
      </mesh>
      
      {/* Torso */}
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[0.25, 0.4, 0.15]} />
        <meshStandardMaterial color="#4f46e5" />
      </mesh>
      
      {/* Arms */}
      {/* Left Upper Arm */}
      <mesh position={[-0.18, 1.3, 0]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.03, 0.04, 0.2, 16]} />
        <meshStandardMaterial color="#fdbcb4" />
      </mesh>
      
      {/* Left Lower Arm */}
      <mesh position={[-0.28, 1.1, 0]} rotation={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.025, 0.03, 0.18, 16]} />
        <meshStandardMaterial color="#fdbcb4" />
      </mesh>
      
      {/* Right Upper Arm */}
      <mesh position={[0.18, 1.3, 0]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.03, 0.04, 0.2, 16]} />
        <meshStandardMaterial color="#fdbcb4" />
      </mesh>
      
      {/* Right Lower Arm */}
      <mesh position={[0.28, 1.1, 0]} rotation={[0, 0, -0.5]}>
        <cylinderGeometry args={[0.025, 0.03, 0.18, 16]} />
        <meshStandardMaterial color="#fdbcb4" />
      </mesh>
      
      {/* Hands */}
      <mesh position={[-0.35, 1.0, 0]}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial color="#fdbcb4" />
      </mesh>
      <mesh position={[0.35, 1.0, 0]}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial color="#fdbcb4" />
      </mesh>
      
      {/* Hips/Pelvis */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.2, 0.15, 0.12]} />
        <meshStandardMaterial color="#2563eb" />
      </mesh>
      
      {/* Left Leg */}
      {/* Left Upper Leg */}
      <mesh position={[-0.08, 0.65, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.35, 16]} />
        <meshStandardMaterial color="#2563eb" />
      </mesh>
      
      {/* Left Lower Leg */}
      <mesh position={[-0.08, 0.3, 0]}>
        <cylinderGeometry args={[0.035, 0.04, 0.3, 16]} />
        <meshStandardMaterial color="#fdbcb4" />
      </mesh>
      
      {/* Right Leg */}
      {/* Right Upper Leg */}
      <mesh position={[0.08, 0.65, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.35, 16]} />
        <meshStandardMaterial color="#2563eb" />
      </mesh>
      
      {/* Right Lower Leg */}
      <mesh position={[0.08, 0.3, 0]}>
        <cylinderGeometry args={[0.035, 0.04, 0.3, 16]} />
        <meshStandardMaterial color="#fdbcb4" />
      </mesh>
      
      {/* Feet */}
      <mesh position={[-0.08, 0.1, 0.03]}>
        <boxGeometry args={[0.06, 0.04, 0.12]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.08, 0.1, 0.03]}>
        <boxGeometry args={[0.06, 0.04, 0.12]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
};

interface HumanAvatar3DProps {
  className?: string;
}

const HumanAvatar3D: React.FC<HumanAvatar3DProps> = ({ className = "" }) => {
  return (
    <div className={`w-full h-64 rounded-lg overflow-hidden border ${className}`}>
      <Canvas camera={{ position: [0, 1, 2], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[2, 3, 2]} intensity={1} />
        <pointLight position={[-2, 1, -1]} intensity={0.4} />
        <directionalLight position={[0, 5, 5]} intensity={0.8} castShadow />
        <HumanAvatarModel />
        <OrbitControls 
          enableZoom={true} 
          enablePan={false}
          autoRotate
          autoRotateSpeed={2}
          maxDistance={4}
          minDistance={1}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 6}
        />
      </Canvas>
    </div>
  );
};

export default HumanAvatar3D;
