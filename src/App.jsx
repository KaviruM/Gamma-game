import { useState, useEffect } from 'react'
import './App.css'

const CONTAINER_WIDTH = 300
const CONTAINER_HEIGHT = 300
const BOX_SIZE = 50
const BALL_SIZE = 20

function App() {
  const [gamma, setGamma] = useState(0)
  const [balls, setBalls] = useState([])
  const [score, setScore] = useState(0)


  // Device orientation
  useEffect(() => {
    const handleOrientation = (event) => {
      if (event.gamma !== null) {
        setGamma(event.gamma)
      }
    }

    window.addEventListener('deviceorientation', handleOrientation)
    return () => window.removeEventListener('deviceorientation', handleOrientation)
  }, [])
  

  // Create balls at the top
  useEffect(() => {
    const interval = setInterval(() => {
      setBalls((prev) => [
        ...prev,
        {
          id: Date.now(),
          x: Math.random() * (CONTAINER_WIDTH - BALL_SIZE),
          y: 0,
        },
      ])
    }, 1000)

    return () => clearInterval(interval)
  }, [])


  // Move balls down
  useEffect(() => {
    const interval = setInterval(() => {
      setBalls((prev) =>
        prev
          .map((ball) => ({
            ...ball,
            y: ball.y + 5,
          }))
          .filter((ball) => ball.y < CONTAINER_HEIGHT)
      )
    }, 50)

    return () => clearInterval(interval)
  }, [])

  const clampedGamma = Math.max(-45, Math.min(45, gamma))
  const leftPosition = ((clampedGamma + 45) / 90) * (CONTAINER_WIDTH - BOX_SIZE)


  // Ball collision detection and scoreing
  useEffect(() => {
    setBalls((prevBalls) => {
      let newScore = score
      const updatedBalls = prevBalls.filter((ball) => {
        const boxTop = CONTAINER_HEIGHT - BOX_SIZE
        const boxBottom = CONTAINER_HEIGHT
        const boxLeft = leftPosition
        const boxRight = leftPosition + BOX_SIZE

        const ballBottom = ball.y + BALL_SIZE
        const ballTop = ball.y
        const ballLeft = ball.x
        const ballRight = ball.x + BALL_SIZE

        const isColliding =
          ballBottom >= boxTop &&
          ballTop <= boxBottom &&
          ballRight >= boxLeft &&
          ballLeft <= boxRight

        if (isColliding) {
          newScore += 1
          return false
        }
        return true 
      })
      setScore(newScore)
      return updatedBalls
    })
  }, [balls, leftPosition, score])


  return (
    <div className="game-container">
      <h2>Orientation Game</h2>
      <div className="box">
        <div className="gamma-box" style={{ left: `${leftPosition}px` }} />
      <div className="score-board"> Score: {score} </div>

        {balls.map((ball) => (
          <div
            key={ball.id}
            className="ball"
            style={{
              left: `${ball.x}px`,
              top: `${ball.y}px`,
            }}
          />
        ))}

      </div>
    </div>
  )
}

export default App