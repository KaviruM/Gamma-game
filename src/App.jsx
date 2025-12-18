import { useState, useEffect, useRef } from 'react'
import './App.css'

const CONTAINER_WIDTH = 300
const CONTAINER_HEIGHT = 450
const BOX_SIZE = 60
const BALL_SIZE = 20

function App() {
  const [gamma, setGamma] = useState(0)
  const [balls, setBalls] = useState([])
  const [score, setScore] = useState(0)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const boxPositionRef = useRef(0)


  // Request permission for device orientation ios
  const requestPermission = async () => {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission()
        if (permission === 'granted') {
          setPermissionGranted(true)
        }
      } catch (error) {
        alert('Permission denied')
      }
    } else {
      setPermissionGranted(true)
    }
  }


  // Handle device orientation
  useEffect(() => {
    if (!permissionGranted) return

    const handleOrientation = (event) => {
      if (event.gamma !== null) {
        setGamma(event.gamma)
        const clampedGamma = Math.max(-45, Math.min(45, event.gamma))
        boxPositionRef.current = ((clampedGamma + 45) / 90) * (CONTAINER_WIDTH - BOX_SIZE)
      }
    }

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true)
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation)
    }
  }, [permissionGranted])


  // Generate balls at intervals
  useEffect(() => {
    if (!permissionGranted) return

    const interval = setInterval(() => {
      const newBall = {
        id: Date.now() + Math.random(),
        x: Math.random() * (CONTAINER_WIDTH - BALL_SIZE),
        y: 0,
      }
      setBalls((prevBalls) => [...prevBalls, newBall])
    }, 1000)

    return () => clearInterval(interval)
  }, [permissionGranted])


  // Move balls and check for collisions and scoreing
  useEffect(() => {
    if (!permissionGranted) return

    const interval = setInterval(() => {
      setBalls((prevBalls) => {
        const updatedBalls = prevBalls.map((ball) => ({ ...ball, y: ball.y + 5 }))

        const remainingBalls = []
        
        for (const ball of updatedBalls) {
          const ballLeft = ball.x
          const ballRight = ball.x + BALL_SIZE
          const ballTop = ball.y
          const ballBottom = ball.y + BALL_SIZE

          const boxLeft = boxPositionRef.current
          const boxRight = boxPositionRef.current + BOX_SIZE
          const boxTop = CONTAINER_HEIGHT / 2 - BOX_SIZE / 2
          const boxBottom = CONTAINER_HEIGHT / 2 + BOX_SIZE / 2

          const isColliding = 
            ballRight > boxLeft &&
            ballLeft < boxRight &&
            ballBottom > boxTop &&
            ballTop < boxBottom

          if (isColliding) {
            setScore((prevScore) => prevScore + 1)
          } else if (ball.y < CONTAINER_HEIGHT) {
            remainingBalls.push(ball)
          }
        }

        return remainingBalls
      })
    }, 50)

    return () => clearInterval(interval)
  }, [permissionGranted])

  const clampedGamma = Math.max(-45, Math.min(45, gamma))
  const leftPosition = ((clampedGamma + 45) / 90) * (CONTAINER_WIDTH - BOX_SIZE)


  // resey game
  const resetGame = () => {
    setScore(0)
    setBalls([])
  }


  if (!permissionGranted) {
    return (
      <div className='permission-screen'>
        <div className='permission-content'>
          <h2 className='permission-title'>Motion Permission Required</h2>
          <p className='permission-text'>This game needs access to your device motion sensors.</p>
          <button onClick={requestPermission} className='permission-button'>
            Enable Motion Sensors
          </button>
        </div>
      </div>
    )
  }

  
  return (
    <div className='game-container'>
      <div className='game-header'>
        <h1 className='game-title'>Orientation Game</h1>
        <div className='score-display'>Score: {score}</div>
      </div>

      <div className='game-area'>
        <div
          className='red-box'
          style={{ 
            left: `${leftPosition}px`,
            top: `${CONTAINER_HEIGHT / 2 - BOX_SIZE / 2}px`
          }}
        />

        {balls.map((ball) => (
          <div
            key={ball.id}
            className='ball'
            style={{
              left: `${ball.x}px`,
              top: `${ball.y}px`,
            }}
          />
        ))}
      </div>

      <button onClick={resetGame} className='reset-button'>
        Reset Game
      </button>

      <p className='game-instructions'>
        Tilt your device left and right to move the red box and catch the balls!
      </p>
    </div>
  )
}

export default App