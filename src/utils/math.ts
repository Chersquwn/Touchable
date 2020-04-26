export interface Point {
  x: number
  y: number
}

export interface Vector {
  x: number
  y: number
}

export function getDistance(p1: Point, p2: Point) {
  const dx = p1.x - p2.x
  const dy = p1.y - p2.y

  return Math.sqrt(dx ** 2 + dy ** 2)
}

export function getCenter(p1: Point, p2: Point) {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  }
}

export function isEqualCoordinates(p1: Point, p2: Point) {
  return p1.x === p2.x && p1.y === p2.y
}

export function dot(p1: Point, p2: Point) {
  return p1.x * p2.x + p1.y * p2.y
}

export function cross(p1: Point, p2: Point) {
  return p1.x * p2.y - p2.x * p1.y
}

export function isInRange(p1: Point, p2: Point, range: number = 30) {
  return Math.abs(p1.x - p2.x) < range && Math.abs(p1.y - p2.y) < range
}

export function getVectorMod(v: Vector) {
  return Math.sqrt(v.x ** 2 + v.y ** 2)
}

export function getAngle(v1: Vector, v2: Vector) {
  let angle = Math.acos(dot(v1, v2) / (getVectorMod(v1) * getVectorMod(v2)))

  if (cross(v1, v2) > 0) {
    angle *= -1
  }

  return (angle * 180) / Math.PI
}
