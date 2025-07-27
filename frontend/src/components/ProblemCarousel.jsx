import { useEffect, useRef, useState } from 'react'
import ProblemCard from './ProblemCard'

const ProblemCarousel = ({ problemsData, onJoinTeam }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [rotation, setRotation] = useState(0)
  const containerRef = useRef(null)
  const draggableAreaRef = useRef(null)

  const totalCards = problemsData.length
  const angleStep = 360 / totalCards
  const radius = 280 // Slightly reduced distance from center for smaller cards

  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault()
      
      // Make scrolling slower and more controlled
      const scrollThreshold = 100 // Minimum scroll distance to trigger change
      const scrollSensitivity = 0.3 // Reduce sensitivity
      
      const scrollAmount = Math.abs(e.deltaY) * scrollSensitivity
      
      if (scrollAmount > scrollThreshold) {
        const direction = e.deltaY > 0 ? 1 : -1
        setCurrentIndex((prev) => (prev + direction + totalCards) % totalCards)
      }
    }

    // Only add wheel listener to the draggable area, not the entire container
    const draggableArea = draggableAreaRef.current
    if (draggableArea) {
      draggableArea.addEventListener('wheel', handleWheel, { passive: false })
      return () => draggableArea.removeEventListener('wheel', handleWheel)
    }
  }, [totalCards])

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setStartX(e.clientX)
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    
    const deltaX = e.clientX - startX
    const rotationDelta = deltaX * 0.5
    setRotation(rotationDelta)
  }

  const handleMouseUp = () => {
    if (!isDragging) return
    
    setIsDragging(false)
    
    // Determine direction and snap to nearest card
    if (Math.abs(rotation) > 30) {
      const direction = rotation > 0 ? -1 : 1
      setCurrentIndex((prev) => (prev + direction + totalCards) % totalCards)
    }
    
    setRotation(0)
    setStartX(0)
  }

  const getCardTransform = (index) => {
    const angle = (index - currentIndex) * angleStep + rotation * 0.3
    const x = Math.sin((angle * Math.PI) / 180) * radius
    const z = Math.cos((angle * Math.PI) / 180) * radius
    const rotateY = -angle
    
    return {
      transform: `translate3d(${x}px, 0, ${z}px) rotateY(${rotateY}deg)`,
    }
  }

  const getCardOpacity = (index) => {
    const distance = Math.abs(index - currentIndex)
    const normalizedDistance = Math.min(distance, totalCards - distance)
    
    if (normalizedDistance === 0) return 1 // Center card
    if (normalizedDistance === 1) return 0.7 // Adjacent cards
    if (normalizedDistance === 2) return 0.4 // Second adjacent
    return 0.2 // Far cards
  }

  const getCardScale = (index) => {
    const distance = Math.abs(index - currentIndex)
    const normalizedDistance = Math.min(distance, totalCards - distance)
    
    if (normalizedDistance === 0) return 1.1 // Center card slightly larger
    if (normalizedDistance === 1) return 0.9
    return 0.7
  }

  const shouldShowGlow = (index) => {
    return index === currentIndex
  }

  return (
    <div className="relative">
      {/* 3D Ring Container */}
      <div className="relative h-[500px] overflow-visible">
        <div 
          ref={containerRef}
          className="relative w-full h-full"
          style={{ perspective: '1200px', perspectiveOrigin: 'center 50%' }}
        >
          {/* Smaller draggable area in the center */}
          <div 
            ref={draggableAreaRef}
            className="absolute top-1/2 left-1/2 w-80 h-80 cursor-grab active:cursor-grabbing transform -translate-x-1/2 -translate-y-1/2 z-20"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          
          <div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
            {problemsData.map((problem, index) => (
              <div
                key={problem.id}
                className={`absolute top-1/2 left-1/2 w-72 transition-all duration-1000 ease-out ${
                  shouldShowGlow(index) ? 'glow-effect' : ''
                }`}
                style={{
                  ...getCardTransform(index),
                  opacity: getCardOpacity(index),
                  transform: `${getCardTransform(index).transform} scale(${getCardScale(index)})`,
                  transformOrigin: 'center center',
                  marginLeft: '-144px', // Half of new card width (288px / 2)
                  marginTop: '-150px', // Moved cards higher to prevent overlap with navigation
                  zIndex: index === currentIndex ? 10 : 1,
                }}
              >
                <ProblemCard
                  problem={problem}
                  onJoinTeam={() => onJoinTeam(problem.id)}
                />
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="absolute top-4 right-4 text-slate-400 text-sm bg-slate-900/30 backdrop-blur-sm rounded-lg p-3 border border-cyan-400/20">
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
              Drag or scroll to rotate
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Controls - Now completely outside and below the carousel */}
      <div className="flex justify-center items-center space-x-4 mt-20 relative z-30">
        <button
          onClick={() => setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards)}
          className="bg-slate-700/80 hover:bg-slate-600 text-slate-200 p-3 rounded-full hover-scale shadow-lg border border-cyan-400/30 hover:border-cyan-400/50 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex items-center space-x-3 px-2">
          {problemsData.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-4 h-4 rounded-full transition-all duration-300 hover-scale ${
                index === currentIndex 
                  ? 'bg-cyan-400 scale-125 shadow-lg shadow-cyan-400/50 ring-2 ring-cyan-400/30' 
                  : 'bg-slate-600 hover:bg-slate-500 border border-slate-500'
              }`}
            />
          ))}
        </div>
        
        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % totalCards)}
          className="bg-slate-700/80 hover:bg-slate-600 text-slate-200 p-3 rounded-full hover-scale shadow-lg border border-cyan-400/30 hover:border-cyan-400/50 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default ProblemCarousel
