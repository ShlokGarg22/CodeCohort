import React, { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame, extend } from '@react-three/fiber'
import { OrbitControls, Sphere, Line } from '@react-three/drei'
import * as THREE from 'three'

// Extend THREE to use Line2 for better line rendering
extend({ Line_: THREE.Line })

// Individual Point Component with Ocean Deep theme
const GlobePoint = ({ position, problem, index, isHovered, onHover, onClick }) => {
  const pointRef = useRef()
  const ringRef = useRef()
  
  useFrame((state) => {
    if (pointRef.current) {
      // Gentle pulsing animation with rings
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3 + index) * 0.15
      pointRef.current.scale.setScalar(pulse)
    }
    
    if (ringRef.current && isHovered) {
      ringRef.current.rotation.z += 0.03
      const scale = 1.2 + Math.sin(state.clock.elapsedTime * 5) * 0.3
      ringRef.current.scale.setScalar(scale)
    }
  })

  return (
    <group position={position}>
      {/* Main Point with Ocean Deep accent */}
      <mesh
        ref={pointRef}
        onPointerEnter={() => onHover(index)}
        onPointerLeave={() => onHover(null)}
        onClick={() => onClick(problem)}
      >
        <sphereGeometry args={[0.08, 20, 20]} />
        <meshStandardMaterial 
          color={isHovered ? "#64ffda" : "#64ffda"}
          emissive={isHovered ? "#64ffda" : "#64ffda"}
          emissiveIntensity={isHovered ? 0.8 : 0.4}
        />
      </mesh>
      
      {/* Pulsing rings effect with cyan */}
      <mesh>
        <ringGeometry args={[0.10, 0.14, 32]} />
        <meshBasicMaterial color="#64ffda" transparent opacity={0.3} />
      </mesh>
      
      {/* Hover Ring Effect */}
      {isHovered && (
        <mesh ref={ringRef}>
          <ringGeometry args={[0.12, 0.18, 32]} />
          <meshBasicMaterial color="#64ffda" transparent opacity={0.8} />
        </mesh>
      )}
      
      {/* Enhanced glow for hovered point */}
      {isHovered && (
        <mesh>
          <sphereGeometry args={[0.12, 20, 20]} />
          <meshBasicMaterial color="#64ffda" transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  )
}

// Animated Connection Arc with Ocean Deep colors
const ConnectionArc = ({ start, end, delay = 0, lineIndex = 0, arcAlt = 0.3 }) => {
  const [progress, setProgress] = useState(0)
  
  useFrame((state) => {
    const time = (state.clock.elapsedTime + delay) * 0.8
    setProgress(Math.abs(Math.sin(time)))
  })
  
  const points = useMemo(() => {
    const startVec = new THREE.Vector3(start.x, start.y, start.z)
    const endVec = new THREE.Vector3(end.x, end.y, end.z)
    
    // Create realistic arc with variable altitude
    const midPoint = startVec.clone().lerp(endVec, 0.5)
    const distance = startVec.distanceTo(endVec)
    const altitude = 1 + (arcAlt * distance * 0.4)
    midPoint.multiplyScalar(altitude)
    
    const curve = new THREE.QuadraticBezierCurve3(startVec, midPoint, endVec)
    return curve.getPoints(80)
  }, [start, end, arcAlt])
  
  const visiblePoints = useMemo(() => {
    const numPoints = Math.floor(points.length * progress)
    return points.slice(0, Math.max(numPoints, 2))
  }, [points, progress])
  
  // Ocean Deep color variations
  const colors = ["#64ffda", "#8892b0", "#ccd6f6"]
  const color = colors[lineIndex % colors.length]
  
  return (
    <Line
      points={visiblePoints}
      color={color}
      lineWidth={4}
      transparent
      opacity={0.8}
    />
  )
}

// Main Globe Component with Ocean Deep styling
const EarthGlobe = ({ globePoints, onPointHover, onPointClick, hoveredPoint }) => {
  const globeRef = useRef()
  const pointsGroupRef = useRef()
  const dotsRef = useRef()
  
  // Auto rotation
  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.002
    }
    if (pointsGroupRef.current) {
      pointsGroupRef.current.rotation.y += 0.002
    }
    if (dotsRef.current) {
      dotsRef.current.rotation.y += 0.002
    }
  })
  
  // Create continent pattern using cyan dots
  const continentDots = useMemo(() => {
    const dots = []
    const radius = 3.02
    
    // Deterministic continent coordinates
    const continentCoords = [
      // North America
      [40.7128, -74.0060], [34.0522, -118.2437], [41.8781, -87.6298], [49.2827, -123.1207],
      [45.5017, -73.5673], [43.6532, -79.3832], [39.7392, -104.9903], [25.7617, -80.1918],
      // Europe
      [51.5074, -0.1278], [48.8566, 2.3522], [52.5200, 13.4050], [55.7558, 37.6176],
      [59.9311, 10.7500], [52.3676, 4.9041], [47.4979, 19.0402], [46.9480, 7.4474],
      // Asia
      [39.9042, 116.4074], [35.6762, 139.6503], [28.6139, 77.2090], [1.3521, 103.8198],
      [37.5665, 126.9780], [55.7558, 37.6176], [41.2044, 69.2401], [24.7136, 46.6753],
      // Africa
      [30.0444, 31.2357], [-26.2041, 28.0473], [-1.2921, 36.8219], [6.5244, 3.3792],
      [33.9391, -6.8329], [9.0579, 8.6753], [-22.9576, 18.4904], [-8.8383, 13.2344],
      // South America
      [-23.5558, -46.6396], [-22.9068, -43.1729], [-12.0464, -77.0428], [-34.6118, -58.3960],
      [-33.4489, -70.6693], [-0.1807, -78.4678], [10.3910, -66.9811], [-14.2350, -51.9253],
      // Australia/Oceania
      [-33.8688, 151.2093], [-37.8136, 144.9631], [-31.9505, 115.8605], [-41.2865, 174.7762]
    ]
    
    continentCoords.forEach(([lat, lng], index) => {
      // Add multiple dots around each coordinate for density
      for (let i = 0; i < 3; i++) {
        const offsetLat = lat + (Math.sin(index + i) * 2)
        const offsetLng = lng + (Math.cos(index + i) * 3)
        const phi = (90 - offsetLat) * (Math.PI / 180)
        const theta = (offsetLng + 180) * (Math.PI / 180)
        
        const x = radius * Math.sin(phi) * Math.cos(theta)
        const y = radius * Math.cos(phi)
        const z = radius * Math.sin(phi) * Math.sin(theta)
        
        dots.push([x, y, z])
      }
    })
    
    return dots
  }, [])

  return (
    <group>
      {/* Main Globe with Ocean Deep colors */}
      <Sphere ref={globeRef} args={[3, 64, 64]}>
        <meshPhongMaterial 
          color="#0a192f"
          emissive="#172a45"
          emissiveIntensity={0.3}
          shininess={100}
          transparent
          opacity={0.9}
        />
      </Sphere>
      
      {/* Cyan glow effect */}
      <Sphere args={[3.05, 64, 64]}>
        <meshBasicMaterial 
          color="#64ffda"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>
      
      {/* Outer glow */}
      <Sphere args={[3.1, 64, 64]}>
        <meshBasicMaterial 
          color="#64ffda"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </Sphere>
      
      {/* Cyan Continent Dots */}
      <group ref={dotsRef}>
        {continentDots.map((position, index) => (
          <mesh key={index} position={position}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshBasicMaterial 
              color="#64ffda" 
              transparent
              opacity={0.8}
            />
          </mesh>
        ))}
      </group>
      
      {/* Globe Points */}
      <group ref={pointsGroupRef}>
        {globePoints.map((point, index) => (
          <GlobePoint
            key={point.id}
            position={point.position}
            problem={point.problem}
            index={index}
            isHovered={hoveredPoint === index}
            onHover={onPointHover}
            onClick={onPointClick}
          />
        ))}
      </group>
    </group>
  )
}

// Main Interactive Globe Component
const InteractiveGlobe = ({ problemsData, onJoinTeam }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [selectedProblem, setSelectedProblem] = useState(null)
  
  // Real-world coordinates for problems
  const realWorldCoordinates = useMemo(() => [
    { lat: 40.7128, lng: -74.0060, city: "New York" },
    { lat: 51.5072, lng: -0.1276, city: "London" },
    { lat: 35.6762, lng: 139.6503, city: "Tokyo" },
    { lat: -33.8688, lng: 151.2093, city: "Sydney" },
    { lat: 28.6139, lng: 77.2090, city: "Delhi" },
    { lat: -23.5505, lng: -46.6333, city: "São Paulo" },
  ], [])
  
  // Convert coordinates to 3D positions
  const globePoints = useMemo(() => {
    return problemsData.map((problem, index) => {
      const coords = realWorldCoordinates[index]
      const phi = (90 - coords.lat) * (Math.PI / 180)
      const theta = (coords.lng + 180) * (Math.PI / 180)
      
      const position = [
        3 * Math.sin(phi) * Math.cos(theta),
        3 * Math.cos(phi),
        3 * Math.sin(phi) * Math.sin(theta)
      ]
      
      return {
        id: problem.id,
        problem,
        position,
        city: coords.city
      }
    })
  }, [problemsData, realWorldCoordinates])
  
  // Create connection arcs
  const connectionArcs = useMemo(() => {
    const arcs = []
    const connections = [
      { from: 0, to: 1, arcAlt: 0.3 }, { from: 1, to: 2, arcAlt: 0.5 },
      { from: 2, to: 3, arcAlt: 0.2 }, { from: 3, to: 4, arcAlt: 0.4 },
      { from: 4, to: 5, arcAlt: 0.7 }, { from: 0, to: 5, arcAlt: 0.3 }
    ]
    
    connections.forEach((conn) => {
      if (globePoints[conn.from] && globePoints[conn.to]) {
        arcs.push({
          start: {
            x: globePoints[conn.from].position[0],
            y: globePoints[conn.from].position[1],
            z: globePoints[conn.from].position[2]
          },
          end: {
            x: globePoints[conn.to].position[0],
            y: globePoints[conn.to].position[1],
            z: globePoints[conn.to].position[2]
          },
          arcAlt: conn.arcAlt
        })
      }
    })
    
    return arcs
  }, [globePoints])
  
  const handlePointClick = (problem) => {
    setSelectedProblem(problem)
  }
  
  const handleJoinTeam = () => {
    if (selectedProblem) {
      onJoinTeam(selectedProblem.id)
      setSelectedProblem(null)
    }
  }
  
  return (
    <div className="relative w-full h-[600px] overflow-hidden">
      {/* 3D Globe Canvas with Ocean Deep lighting */}
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
        <ambientLight intensity={0.3} color="#64ffda" />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#ccd6f6" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#64ffda" />
        <directionalLight position={[5, 5, 5]} intensity={0.2} color="#8892b0" />
        
        <EarthGlobe
          globePoints={globePoints}
          onPointHover={setHoveredPoint}
          onPointClick={handlePointClick}
          hoveredPoint={hoveredPoint}
        />
        
        {/* Connection Arcs */}
        {connectionArcs.map((arc, index) => (
          <ConnectionArc
            key={`arc-${index}`}
            start={arc.start}
            end={arc.end}
            delay={index * 0.3}
            lineIndex={index}
            arcAlt={arc.arcAlt}
          />
        ))}
        
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          autoRotate={true}
          autoRotateSpeed={0.5}
          minDistance={6}
          maxDistance={6}
          enableDamping={true}
          dampingFactor={0.05}
        />
      </Canvas>
      
      {/* Ocean Deep themed hover card */}
      {hoveredPoint !== null && (
        <div className="absolute top-4 left-4 bg-slate-900/95 backdrop-blur-sm rounded-lg p-4 max-w-sm border border-cyan-400/30 z-10 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-200 font-semibold text-sm">
              {globePoints[hoveredPoint].problem.title}
            </h3>
            <span className="text-cyan-400 text-xs bg-cyan-400/20 px-2 py-1 rounded">
              {globePoints[hoveredPoint].city}
            </span>
          </div>
          <p className="text-slate-400 text-xs mb-3 leading-relaxed">
            {globePoints[hoveredPoint].problem.description.slice(0, 100)}...
          </p>
          <div className="flex flex-wrap gap-1 mb-3">
            {globePoints[hoveredPoint].problem.techStack.slice(0, 3).map((tech, i) => (
              <span 
                key={i}
                className="px-2 py-1 bg-slate-700 text-cyan-400 text-xs rounded-full border border-cyan-400/30"
              >
                {tech}
              </span>
            ))}
            {globePoints[hoveredPoint].problem.techStack.length > 3 && (
              <span className="px-2 py-1 bg-slate-800 text-slate-400 text-xs rounded-full">
                +{globePoints[hoveredPoint].problem.techStack.length - 3} more
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs">
              {globePoints[hoveredPoint].problem.currentMembers}/{globePoints[hoveredPoint].problem.totalMembers} members
            </span>
            <button
              onClick={() => handlePointClick(globePoints[hoveredPoint].problem)}
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center gap-1 transition-colors"
            >
              View Details
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Ocean Deep themed instructions */}
      <div className="absolute top-4 right-4 text-slate-400 text-sm bg-slate-900/30 backdrop-blur-sm rounded-lg p-3 border border-cyan-400/20">
        <p className="flex items-center gap-2">
          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
          Hover points for details
        </p>
        <p className="flex items-center gap-2 mt-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Auto-rotating globe
        </p>
      </div>
      
      {/* Ocean Deep themed modal */}
      {selectedProblem && (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md mx-4 border border-cyan-400/30 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-200 mb-3">
              {selectedProblem.title}
            </h2>
            <p className="text-slate-400 text-sm mb-4 leading-relaxed">
              {selectedProblem.description}
            </p>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-slate-300 mb-2">Tech Stack:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedProblem.techStack.map((tech, i) => (
                  <span 
                    key={i}
                    className="px-3 py-1 bg-slate-700 text-cyan-400 text-xs rounded-full border border-cyan-400/30"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center text-sm text-slate-400">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.196-2.121M9 6a3 3 0 11-6 0 3 3 0 016 0zM8 20h8a4 4 0 000-8H8a4 4 0 000 8z"></path>
                </svg>
                {selectedProblem.currentMembers}/{selectedProblem.totalMembers} members
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleJoinTeam}
                className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-4 py-2 rounded-md font-medium transition-all transform hover:scale-105 shadow-lg"
              >
                Join Team
              </button>
              <button
                onClick={() => setSelectedProblem(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md font-medium transition-colors border border-slate-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InteractiveGlobe
