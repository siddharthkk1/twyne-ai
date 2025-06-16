
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Cylinder } from '@react-three/drei';
import { Mesh, Color } from 'three';

interface AvatarProps {
  name: string;
}

const ModernAvatarModel: React.FC<AvatarProps> = ({ name }) => {
  const headRef = useRef<Mesh>(null);
  const bodyRef = useRef<Mesh>(null);
  const leftArmRef = useRef<Mesh>(null);
  const rightArmRef = useRef<Mesh>(null);

  // Generate colors based on name for consistency
  const colors = useMemo(() => {
    const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const skinTones = ['#fdbcb4', '#f1c27d', '#e0ac69', '#c68642', '#8d5524'];
    const clothingColors = ['#4f46e5', '#dc2626', '#059669', '#7c3aed', '#ea580c'];
    
    return {
      skin: skinTones[hash % skinTones.length],
      clothing: clothingColors[(hash * 2) % clothingColors.length],
    };
  }, [name]);

  useFrame((state) => {
    // Gentle floating animation
    const time = state.clock.elapsedTime;
    if (headRef.current) {
      headRef.current.position.y = 1.5 + Math.sin(time * 1.5) * 0.05;
      headRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
    }
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.sin(time * 1.5) * 0.03;
    }
    if (leftArmRef.current && rightArmRef.current) {
      leftArmRef.current.rotation.z = Math.PI / 6 + Math.sin(time * 2) * 0.1;
      rightArmRef.current.rotation.z = -Math.PI / 6 + Math.sin(time * 2 + Math.PI) * 0.1;
    }
  });

  return (
    <group>
      {/* Head */}
      <Sphere ref={headRef} args={[0.6, 32, 32]} position={[0, 1.5, 0]}>
        <meshStandardMaterial color={colors.skin} />
      </Sphere>
      
      {/* Eyes */}
      <Sphere args={[0.08, 16, 16]} position={[-0.2, 1.6, 0.5]}>
        <meshStandardMaterial color="#333" />
      </Sphere>
      <Sphere args={[0.08, 16, 16]} position={[0.2, 1.6, 0.5]}>
        <meshStandardMaterial color="#333" />
      </Sphere>
      
      {/* Nose */}
      <Box args={[0.08, 0.1, 0.08]} position={[0, 1.45, 0.55]}>
        <meshStandardMaterial color={colors.skin} />
      </Box>
      
      {/* Body */}
      <Cylinder ref={bodyRef} args={[0.5, 0.7, 1.2, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color={colors.clothing} />
      </Cylinder>
      
      {/* Arms */}
      <Cylinder 
        ref={leftArmRef} 
        args={[0.12, 0.12, 0.8, 16]} 
        position={[-0.8, 0.3, 0]} 
        rotation={[0, 0, Math.PI / 6]}
      >
        <meshStandardMaterial color={colors.skin} />
      </Cylinder>
      <Cylinder 
        ref={rightArmRef} 
        args={[0.12, 0.12, 0.8, 16]} 
        position={[0.8, 0.3, 0]} 
        rotation={[0, 0, -Math.PI / 6]}
      >
        <meshStandardMaterial color={colors.skin} />
      </Cylinder>
      
      {/* Legs */}
      <Cylinder args={[0.15, 0.15, 1, 16]} position={[-0.25, -1.1, 0]}>
        <meshStandardMaterial color="#2563eb" />
      </Cylinder>
      <Cylinder args={[0.15, 0.15, 1, 16]} position={[0.25, -1.1, 0]}>
        <meshStandardMaterial color="#2563eb" />
      </Cylinder>
    </group>
  );
};

interface ModernAvatar3DProps {
  className?: string;
  name?: string;
}

const ModernAvatar3D: React.FC<ModernAvatar3DProps> = ({ 
  className = "", 
  name = "User" 
}) => {
  return (
    <div className={`w-16 h-16 rounded-lg overflow-hidden ${className}`}>
      <Canvas 
        camera={{ position: [0, 0, 4], fov: 50 }}
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, -5, -5]} intensity={0.3} color="#ff6b6b" />
        <ModernAvatarModel name={name} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate
          autoRotateSpeed={2}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  );
};

export default ModernAvatar3D;
