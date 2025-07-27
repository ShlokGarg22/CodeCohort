import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const GLOBE_RADIUS = 2.5;

const GlobeGeometry = () => {
  const meshRef = useRef();
  const atmosphereRef = useRef();
  const innerRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (meshRef.current) {
      // Continuous slow revolution independent of user interaction
      meshRef.current.rotation.y = time * 0.1; // Slow continuous rotation
    }
    
    if (atmosphereRef.current) {
      // Slower atmosphere rotation for depth effect
      atmosphereRef.current.rotation.y = time * 0.05;
      // Gentle breathing effect for atmosphere
      const breathe = 1 + Math.sin(time * 0.5) * 0.02;
      atmosphereRef.current.scale.setScalar(breathe);
    }

    if (innerRef.current) {
      // Very subtle counter-rotation for the inner globe
      innerRef.current.rotation.y = -time * 0.02;
    }
  });

  return (
    <group>
      {/* Main Globe with wireframe */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[GLOBE_RADIUS, 128, 64]} />
        <meshBasicMaterial 
          color="#0a0a1a" 
          wireframe 
          transparent 
          opacity={0.4}
        />
      </mesh>

      {/* Inner globe with subtle texture */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[GLOBE_RADIUS * 0.98, 64, 32]} />
        <meshBasicMaterial 
          color="#1a1a2e" 
          transparent 
          opacity={0.1}
        />
      </mesh>

      {/* Atmospheric Glow - Performance optimized */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[GLOBE_RADIUS * 1.15, 32, 32]} />
        <meshBasicMaterial 
          color="#4ecdc4" 
          transparent 
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outer atmospheric layer */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 1.25, 24, 24]} />
        <meshBasicMaterial 
          color="#6c5ce7" 
          transparent 
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Additional subtle glow rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[GLOBE_RADIUS * 1.3, GLOBE_RADIUS * 1.35, 32]} />
        <meshBasicMaterial 
          color="#4ecdc4" 
          transparent 
          opacity={0.03}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Enhanced glow ring for arc visualization */}
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <ringGeometry args={[GLOBE_RADIUS * 1.4, GLOBE_RADIUS * 1.45, 32]} />
        <meshBasicMaterial 
          color="#ff6b6b" 
          transparent 
          opacity={0.02}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

// Generate random global coordinates for dynamic arcs
const generateRandomCoordinates = () => {
  return {
    lat: (Math.random() - 0.5) * 180, // -90 to 90
    lng: (Math.random() - 0.5) * 360, // -180 to 180
  };
};

// Generate fewer random arc pairs with shorter distances
const generateRandomArcs = (count = 6) => { // Reduced default from 15 to 6
  const arcs = [];
  for (let i = 0; i < count; i++) {
    // Generate two random points
    const start = generateRandomCoordinates();
    let end = generateRandomCoordinates();
    
    // Ensure arcs aren't too long for better visual appeal
    const maxDistance = 90; // Reduced from 120 to 90 degrees
    let attempts = 0;
    while (attempts < 10) {
      const latDiff = Math.abs(start.lat - end.lat);
      const lngDiff = Math.abs(start.lng - end.lng);
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
      
      if (distance < maxDistance) break;
      end = generateRandomCoordinates();
      attempts++;
    }
    
    arcs.push({
      id: i,
      startLat: start.lat,
      startLng: start.lng,
      endLat: end.lat,
      endLng: end.lng,
      delay: Math.random() * 15, // Longer delays for less crowding
      speed: 0.4 + Math.random() * 0.4, // Slower speeds
      color: [
        "#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", 
        "#feca57", "#ff9ff3", "#a8e6cf", "#ff8a80"
      ][Math.floor(Math.random() * 8)] // Reduced color palette
    });
  }
  return arcs;
};

// Problem locations around the globe (latitude, longitude) with colors
const problemLocations = [
  { id: 1, lat: 40.7128, lng: -74.0060, name: "New York", color: "#ff6b6b" }, // Red
  { id: 2, lat: 51.5074, lng: -0.1278, name: "London", color: "#4ecdc4" }, // Cyan
  { id: 3, lat: 35.6762, lng: 139.6503, name: "Tokyo", color: "#45b7d1" }, // Blue
  { id: 4, lat: -33.8688, lng: 151.2093, name: "Sydney", color: "#96ceb4" }, // Green
  { id: 5, lat: 19.0760, lng: 72.8777, name: "Mumbai", color: "#feca57" }, // Yellow
  { id: 6, lat: -23.5505, lng: -46.6333, name: "São Paulo", color: "#ff9ff3" }, // Pink
];

// Convert lat/lng to 3D coordinates
const latLngToVector3 = (lat, lng, radius = GLOBE_RADIUS) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  
  return new THREE.Vector3(x, y, z);
};

const ProblemPoint = ({ position, problem, onHover, onLeave, isHovered, pointColor = "#4ecdc4" }) => {
  const meshRef = useRef();
  const glowRef = useRef();
  const pulseRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (meshRef.current) {
      // Scale animation
      const scale = isHovered ? 1.8 : 1.2;
      meshRef.current.scale.setScalar(scale + Math.sin(time * 3) * 0.1);
    }

    if (glowRef.current) {
      // Pulsing glow effect
      const glowIntensity = 0.4 + Math.sin(time * 2) * 0.2;
      glowRef.current.material.opacity = glowIntensity;
    }

    if (pulseRef.current) {
      // Expanding pulse rings
      const pulseScale = 1 + (time * 2) % 1;
      pulseRef.current.scale.setScalar(pulseScale);
      pulseRef.current.material.opacity = Math.max(0, 0.6 - pulseScale * 0.6);
    }
  });

  return (
    <group position={position}>
      {/* Main point with custom color */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(problem);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onLeave();
        }}
      >
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial 
          color={isHovered ? "#ffffff" : pointColor} 
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Glowing outer sphere with custom color */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial 
          color={isHovered ? "#ffffff" : pointColor} 
          transparent 
          opacity={0.3}
        />
      </mesh>
      
      {/* Pulsing rings with custom color */}
      <mesh ref={pulseRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.08, 0.14, 32]} />
        <meshBasicMaterial 
          color={isHovered ? "#ffffff" : pointColor} 
          transparent 
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Secondary pulse ring with custom color */}
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <ringGeometry args={[0.06, 0.1, 32]} />
        <meshBasicMaterial 
          color={isHovered ? "#ffffff" : pointColor} 
          transparent 
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

// Enhanced Flying Arc Component with moving particles and dynamic segments
const GlowingArc = ({ startPos, endPos, delay = 0, speed = 1, color = "#00ffff", glowIntensity = 1 }) => {
  const meshRef = useRef();
  const glowRef = useRef();
  const particleRef = useRef();
  const particleGlowRef = useRef();
  const trailParticlesRef = useRef([]);
  const segmentRefs = useRef([]);
  
  const points = useMemo(() => {
    const start = new THREE.Vector3(...startPos);
    const end = new THREE.Vector3(...endPos);
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    
    // Dynamic arc height based on distance
    const distance = start.distanceTo(end);
    const arcHeight = GLOBE_RADIUS * (1.2 + distance * 0.1);
    mid.normalize().multiplyScalar(arcHeight);
    
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    return curve.getPoints(60); // More points for smoother animation
  }, [startPos, endPos]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [points]);

  // Create fewer segments for cleaner appearance
  const segments = useMemo(() => {
    const segmentCount = 4; // Reduced from 8 to 4
    const segmentSize = Math.floor(points.length / segmentCount);
    const segs = [];
    
    for (let i = 0; i < segmentCount; i++) {
      const start = i * segmentSize;
      const end = Math.min(start + segmentSize, points.length);
      const segmentPoints = points.slice(start, end);
      if (segmentPoints.length > 1) {
        segs.push({
          geometry: new THREE.BufferGeometry().setFromPoints(segmentPoints),
          delay: i * 0.5, // Slower segment progression
          id: i
        });
      }
    }
    return segs;
  }, [points]);

  useFrame((state) => {
    const time = (state.clock.getElapsedTime() + delay) * speed;
    
    // Animate individual segments with wave-like motion
    segments.forEach((segment, index) => {
      if (segmentRefs.current[index]) {
        const segmentTime = time + segment.delay;
        const pulse = Math.sin(segmentTime * 3) * 0.3 + 0.7;
        
        // Create subtle moving wave effect
        const visibility = Math.sin(segmentTime * 0.6 + index * 0.8) * 0.3 + 0.4; // More subtle
        segmentRefs.current[index].material.opacity = visibility * pulse * glowIntensity * 0.5; // Reduced opacity
        
        // Less frequent random flicker effect
        if (Math.random() < 0.02) { // Reduced from 0.05 to 0.02
          segmentRefs.current[index].material.opacity *= 0.5;
        }
      }
    });

    // Enhanced moving particle effect along the arc
    if (particleRef.current) {
      const particleProgress = (time * 0.7) % 1; // Slightly faster movement
      const pointIndex = Math.floor(particleProgress * (points.length - 1));
      const currentPoint = points[pointIndex];
      
      if (currentPoint) {
        particleRef.current.position.copy(currentPoint);
        
        // Enhanced particle intensity and visibility
        const intensity = Math.sin(particleProgress * Math.PI) * glowIntensity * 1.2; // Increased intensity
        particleRef.current.material.opacity = Math.max(0.3, intensity); // Minimum opacity for visibility
        
        // More prominent scale animation
        const scale = 1.5 + Math.sin(time * 6) * 0.5; // Larger base scale with more animation
        particleRef.current.scale.setScalar(scale);
      }
    }

    // Sync particle glow with main particle
    if (particleGlowRef.current && particleRef.current) {
      particleGlowRef.current.position.copy(particleRef.current.position);
      particleGlowRef.current.scale.copy(particleRef.current.scale);
      particleGlowRef.current.material.opacity = particleRef.current.material.opacity * 0.4;
    }

    // Animate trail particles for enhanced visibility
    const particleProgress = (time * 0.7) % 1;
    trailParticlesRef.current.forEach((trailParticle, index) => {
      if (trailParticle) {
        const trailProgress = (particleProgress - (index + 1) * 0.15) % 1;
        if (trailProgress > 0) {
          const trailIndex = Math.floor(trailProgress * (points.length - 1));
          const trailPoint = points[trailIndex];
          if (trailPoint) {
            trailParticle.position.copy(trailPoint);
            const trailOpacity = (1 - index * 0.3) * Math.sin(trailProgress * Math.PI) * glowIntensity;
            trailParticle.material.opacity = Math.max(0, trailOpacity);
            const trailScale = (1 - index * 0.2) * (1 + Math.sin(time * 4) * 0.2);
            trailParticle.scale.setScalar(trailScale);
          }
        } else {
          trailParticle.material.opacity = 0;
        }
      }
    });

    // Main arc pulsing - more subtle
    if (meshRef.current) {
      const mainPulse = 0.1 + Math.sin(time * 0.4) * 0.05; // Reduced intensity
      meshRef.current.material.opacity = mainPulse * glowIntensity;
    }

    // Glow effect with breathing - more subtle
    if (glowRef.current) {
      const glowPulse = 0.05 + Math.sin(time * 0.8) * 0.03; // Reduced intensity
      glowRef.current.material.opacity = glowPulse * glowIntensity;
    }
  });

  return (
    <group>
      {/* Main arc line (very subtle) */}
      <line ref={meshRef} geometry={geometry}>
        <lineBasicMaterial 
          color={color} 
          transparent 
          opacity={0.2} 
          linewidth={1}
        />
      </line>
      
      {/* Segmented arcs for dynamic effect */}
      {segments.map((segment, index) => (
        <line 
          key={segment.id} 
          ref={(el) => { segmentRefs.current[index] = el; }}
          geometry={segment.geometry}
        >
          <lineBasicMaterial 
            color={color} 
            transparent 
            opacity={0.6} 
            linewidth={2}
          />
        </line>
      ))}
      
      {/* Enhanced moving particle with glow */}
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.9}
        />
      </mesh>
      
      {/* Particle glow effect */}
      <mesh ref={particleGlowRef}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.3}
        />
      </mesh>

      {/* Trail particles for enhanced visibility */}
      {[...Array(3)].map((_, index) => (
        <mesh 
          key={`trail-${index}`}
          ref={(el) => { trailParticlesRef.current[index] = el; }}
        >
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={0.6}
          />
        </mesh>
      ))}
      
      {/* Outer glow */}
      <line ref={glowRef} geometry={geometry}>
        <lineBasicMaterial 
          color={color} 
          transparent 
          opacity={0.1} 
          linewidth={6}
        />
      </line>
    </group>
  );
};

const ProblemCard = ({ problem, position, onJoinTeam }) => {
  if (!problem || !position) return null;

  return (
    <Html position={position} center occlude={false}>
      <div 
        className="bg-slate-800/95 backdrop-blur-sm border border-slate-600 rounded-xl p-3 w-72 shadow-2xl transform transition-all duration-300"
        style={{
          maxWidth: '280px',
          fontSize: '14px',
          pointerEvents: 'auto'
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-white leading-tight">{problem.title}</h3>
          <div className="flex items-center space-x-1 ml-3">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-xs text-slate-300">{problem.currentMembers}/{problem.totalMembers}</span>
          </div>
        </div>
        
        <p className="text-slate-300 text-sm mb-3 line-clamp-3">{problem.description}</p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {problem.techStack.slice(0, 3).map((tech, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-md"
            >
              {tech}
            </span>
          ))}
          {problem.techStack.length > 3 && (
            <span className="px-2 py-1 bg-slate-600/50 text-slate-400 text-xs rounded-md">
              +{problem.techStack.length - 3} more
            </span>
          )}
        </div>
        
        <button 
          onClick={() => onJoinTeam && onJoinTeam(problem.id)}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg font-medium text-sm hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
        >
          Join Team
        </button>
      </div>
    </Html>
  );
};

const GlobeScene = ({ problemsData, onJoinTeam }) => {
  const [hoveredProblem, setHoveredProblem] = useState(null);
  const [hoveredPosition, setHoveredPosition] = useState(null);

  const handlePointHover = (problem) => {
    const location = problemLocations.find(loc => loc.id === problem.id);
    if (location) {
      const position = latLngToVector3(location.lat, location.lng);
      
      // Simple but effective positioning
      let offsetX = 1.5; // Default to right
      let offsetY = 0.3; // Slightly up
      
      // Adjust based on point position
      if (position.x > 0) {
        offsetX = -1.5; // Move left for right-side points
      }
      
      if (position.y > 1.5) {
        offsetY = -0.8; // Move down for high points
      } else if (position.y < -1.5) {
        offsetY = 0.8; // Move up for low points
      }
      
      const cardPosition = new THREE.Vector3(
        position.x + offsetX,
        position.y + offsetY,
        position.z + 1.5 // Always in front
      );
      
      setHoveredPosition(cardPosition);
      setHoveredProblem(problem);
    }
  };

  const handlePointLeave = () => {
    setHoveredProblem(null);
    setHoveredPosition(null);
  };

  // Optimized flying arcs - fewer, more elegant connections
  const dynamicArcs = useMemo(() => {
    const arcs = [];
    
    // Only a few key static arcs between problem locations
    const staticConnections = [
      [0, 2], // New York to Tokyo
      [1, 4], // London to Mumbai  
    ];
    
    staticConnections.forEach(([i, j], index) => {
      if (i < problemLocations.length && j < problemLocations.length) {
        const startPos = latLngToVector3(problemLocations[i].lat, problemLocations[i].lng);
        const endPos = latLngToVector3(problemLocations[j].lat, problemLocations[j].lng);
        arcs.push({
          key: `static-arc-${i}-${j}`,
          startPos: [startPos.x, startPos.y, startPos.z],
          endPos: [endPos.x, endPos.y, endPos.z],
          delay: index * 3,
          speed: 0.5,
          color: "#00ffff",
          glowIntensity: 0.8
        });
      }
    });

    // Reduced random arcs - only 6 for cleaner look
    const randomArcs = generateRandomArcs(6);
    randomArcs.forEach((arc) => {
      const startPos = latLngToVector3(arc.startLat, arc.startLng);
      const endPos = latLngToVector3(arc.endLat, arc.endLng);
      arcs.push({
        key: `random-arc-${arc.id}`,
        startPos: [startPos.x, startPos.y, startPos.z],
        endPos: [endPos.x, endPos.y, endPos.z],
        delay: arc.delay,
        speed: arc.speed,
        color: arc.color,
        glowIntensity: 0.4 + Math.random() * 0.3 // More subtle intensity
      });
    });
    
    return arcs;
  }, []);

  return (
    <group>
      {/* Globe */}
      <GlobeGeometry />
      
      {/* Enhanced Glowing Arcs */}
      {dynamicArcs.map(arc => (
        <GlowingArc
          key={arc.key}
          startPos={arc.startPos}
          endPos={arc.endPos}
          delay={arc.delay}
          speed={arc.speed}
          color={arc.color}
          glowIntensity={arc.glowIntensity}
        />
      ))}
      
      {/* Problem points with different colors */}
      {problemsData.map((problem, index) => {
        const location = problemLocations[index % problemLocations.length];
        const position = latLngToVector3(location.lat, location.lng);
        
        return (
          <ProblemPoint
            key={problem.id}
            position={position}
            problem={problem}
            onHover={handlePointHover}
            onLeave={handlePointLeave}
            isHovered={hoveredProblem?.id === problem.id}
            pointColor={location.color}
          />
        );
      })}
      
      {/* Problem card */}
      {hoveredProblem && hoveredPosition && (
        <ProblemCard 
          problem={hoveredProblem} 
          position={[hoveredPosition.x, hoveredPosition.y, hoveredPosition.z]} 
          onJoinTeam={onJoinTeam}
        />
      )}
    </group>
  );
};

const Globe = ({ problemsData, onJoinTeam }) => {
  return (
    <div className="w-full h-[700px] relative overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Enhanced lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={0.5} />
        <pointLight position={[-10, -10, -5]} intensity={0.3} color="#4ecdc4" />
        <pointLight position={[10, -10, 5]} intensity={0.3} color="#6c5ce7" />
        
        {/* OrbitControls for pointer interaction with auto-rotation */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          zoomSpeed={0.6}
          rotateSpeed={0.5}
          minDistance={4}
          maxDistance={12}
          autoRotate={true} // Enable auto-rotation for dynamic viewing
          autoRotateSpeed={1.5} // Slightly faster for better arc visibility
        />
        
        <GlobeScene problemsData={problemsData} onJoinTeam={onJoinTeam} />
      </Canvas>
      
      {/* Enhanced Instructions */}
      <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm border border-slate-600 rounded-xl p-4 shadow-2xl">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
          <p className="text-slate-300 text-sm font-medium">Interactive Global Problems</p>
        </div>
        <p className="text-slate-400 text-xs mb-1">
          <span className="text-purple-400">●</span> Drag to rotate • Scroll to zoom
        </p>
        <p className="text-slate-400 text-xs mb-1">
          <span className="text-cyan-400">●</span> Hover over glowing points for details
        </p>
        <p className="text-slate-400 text-xs">
          <span className="text-green-400">●</span> Globe auto-revolves continuously
        </p>
      </div>

      {/* Stats overlay */}
      <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-sm border border-slate-600 rounded-xl p-4 shadow-2xl">
        <div className="text-center">
          <div className="text-2xl font-bold text-cyan-400">{problemsData.length}</div>
          <div className="text-xs text-slate-400">Active Problems</div>
        </div>
        <div className="text-center mt-2 pt-2 border-t border-slate-700">
          <div className="text-sm font-semibold text-green-400">Live</div>
          <div className="text-xs text-slate-500">Data Streams</div>
        </div>
      </div>

      {/* Reduced floating particles for better performance */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Globe;
