"use client";
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Environment, Float, Sparkles, TorusKnot, Octahedron } from '@react-three/drei';

function AvatarCore() {
  const outerRef = useRef<any>(null);
  const innerRef = useRef<any>(null);
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (outerRef.current) {
      outerRef.current.rotation.x = t * 0.15;
      outerRef.current.rotation.y = t * 0.2;
      outerRef.current.rotation.z = t * 0.1;
    }
    if (innerRef.current) {
      innerRef.current.rotation.x = t * -0.3;
      innerRef.current.rotation.y = t * -0.4;
      innerRef.current.rotation.z = t * -0.2;
      
      // Pulsating effect representing "thinking" or processing
      const scale = 1 + Math.sin(t * 3) * 0.15;
      innerRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group>
      <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
        {/* Outer 4D-like Shell */}
        <TorusKnot ref={outerRef} args={[1.2, 0.3, 128, 32]} position={[0, 0, 0]}>
          <MeshDistortMaterial 
            color="#00f0ff" 
            attach="material" 
            distort={0.4} 
            speed={1.5} 
            roughness={0.1} 
            metalness={0.9}
            emissive="#0044ff"
            emissiveIntensity={0.3}
            wireframe={true}
          />
        </TorusKnot>

        {/* Inner Core */}
        <Octahedron ref={innerRef} args={[0.7]} position={[0, 0, 0]}>
          <MeshDistortMaterial 
            color="#ff00f0" 
            attach="material" 
            distort={0.6} 
            speed={3} 
            roughness={0.2} 
            metalness={1}
            emissive="#ff0080"
            emissiveIntensity={1}
          />
        </Octahedron>

        {/* Magical Particle Field */}
        <Sparkles count={250} scale={6} size={3} speed={0.5} opacity={0.8} color="#00ffff" />
        <Sparkles count={150} scale={4} size={4} speed={0.8} opacity={0.6} color="#ff00ff" />
      </Float>
    </group>
  );
}

export default function ThreeAvatar() {
  return (
    <div className="absolute inset-0 z-0 opacity-90 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 10]} intensity={2.5} color="#00f0ff" />
        <directionalLight position={[-10, -10, -10]} intensity={2} color="#ff00f0" />
        <pointLight position={[0, 0, 0]} intensity={3} color="#ffffff" />
        <AvatarCore />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
