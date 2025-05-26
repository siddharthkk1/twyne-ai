
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Mesh } from 'three';

const AvatarModel = () => {
  const headRef = useRef<Mesh>(null);
  const bodyRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (headRef.current && bodyRef.current) {
      // Gentle floating animation
      headRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
      bodyRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.05;
    }
  });

  return (
    <group>
      {/* Head */}
      <mesh ref={headRef} position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color="#fdbcb4" />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[-0.25, 1.6, 0.6]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.25, 1.6, 0.6]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      
      {/* Body */}
      <mesh ref={bodyRef} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.6, 0.8, 1.5, 32]} />
        <meshStandardMaterial color="#4f46e5" />
      </mesh>
      
      {/* Arms */}
      <mesh position={[-1, 0.2, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.15, 0.15, 1, 16]} />
        <meshStandardMaterial color="#fdbcb4" />
      </mesh>
      <mesh position={[1, 0.2, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <cylinderGeometry args={[0.15, 0.15, 1, 16]} />
        <meshStandardMaterial color="#fdbcb4" />
      </mesh>
      
      {/* Legs */}
      <mesh position={[-0.3, -1.3, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 1.2, 16]} />
        <meshStandardMaterial color="#2563eb" />
      </mesh>
      <mesh position={[0.3, -1.3, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 1.2, 16]} />
        <meshStandardMaterial color="#2563eb" />
      </mesh>
    </group>
  );
};

interface Avatar3DProps {
  className?: string;
}

const Avatar3D: React.FC<Avatar3DProps> = ({ className = "" }) => {
  return (
    <div className={`w-full h-64 rounded-lg overflow-hidden border ${className}`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />
        <AvatarModel />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate
          autoRotateSpeed={1}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  );
};

export default Avatar3D;
