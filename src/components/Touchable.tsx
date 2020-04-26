/* eslint-disable camelcase */
import {
  Children,
  FC,
  PropsWithChildren,
  ReactElement,
  TouchEvent,
  TouchEventHandler,
  cloneElement,
  memo,
  useRef,
} from 'react'
import {
  Point,
  getAngle,
  getCenter,
  getDistance,
  isInRange,
} from 'src/utils/math'

export type TouchableSwipeDirection = 'left' | 'right' | 'up' | 'down'

export interface TouchableEvent extends TouchEvent {
  dx: number
  dy: number
  center: Point
  scale: number
  angle: number
  direction: TouchableSwipeDirection
}

export type TouchableEventHanler = (e: TouchableEvent) => void

export interface TouchableProps extends PropsWithChildren<{}> {
  onTap?: TouchableEventHanler
  onDoubleTap?: TouchableEventHanler
  onLongTap?: TouchableEventHanler
  onMove?: TouchableEventHanler
  onPinch?: TouchableEventHanler
  onRotate?: TouchableEventHanler
  onSwipe?: TouchableEventHanler
  onTouchStart?: TouchableEventHanler
  onTouchEnd?: TouchableEventHanler
  onMultiTouchStart?: TouchableEventHanler
}

function emitEvent(
  handler: TouchableEventHanler | undefined,
  e: TouchableEvent
) {
  if (typeof handler === 'function') {
    handler(e)
  }
}

const TAP_RESPONSE_TIME = 250
const DOUBLE_RESPONSE_TIME = TAP_RESPONSE_TIME
const LONG_RESPONSE_TIME = 800

const Touchable: FC<TouchableProps> = (props) => {
  const {
    children,
    onTap,
    onDoubleTap,
    onLongTap,
    onMove,
    onPinch,
    onRotate,
    onSwipe,
    onTouchStart,
    onTouchEnd,
    onMultiTouchStart,
  } = props
  let x1 = useRef<number | undefined>(undefined)
  let y1 = useRef<number | undefined>(undefined)
  let x2 = useRef<number | undefined>(undefined)
  let y2 = useRef<number | undefined>(undefined)
  let preX: number | undefined
  let preY: number | undefined
  let startTouchTime = 0
  let lastTouchTime = 0
  let isDoubleTap = false
  let isSingleTap = false
  let singleTapTimeout: NodeJS.Timeout
  let longTapTimeout: NodeJS.Timeout
  let pinchStartDistance = useRef<number>(0)
  let preV = useRef({
    x: 0,
    y: 0,
  })

  const handleTouchStart: TouchEventHandler = (event) => {
    const e = event as TouchableEvent

    emitEvent(onTouchStart, e)

    const touches = e.touches

    startTouchTime = Date.now()
    x1.current = touches[0].pageX
    y1.current = touches[0].pageY

    clearTimeout(longTapTimeout)

    if (touches.length > 1) {
      clearTimeout(singleTapTimeout)

      emitEvent(onMultiTouchStart, e)

      const p = {
        x: touches[1].pageX,
        y: touches[1].pageY,
      }

      pinchStartDistance.current = getDistance(
        { x: x1.current, y: y1.current },
        p
      )

      preV.current = {
        x: p.x - x1.current,
        y: p.y - y1.current,
      }
    } else {
      if (preX !== undefined && preY !== undefined) {
        const timeDiff = startTouchTime - (lastTouchTime || startTouchTime)

        isDoubleTap =
          timeDiff < DOUBLE_RESPONSE_TIME &&
          isInRange({ x: x1.current, y: y1.current }, { x: preX, y: preY })
      }

      lastTouchTime = startTouchTime
      preX = x1.current
      preY = y1.current
      isSingleTap = true

      longTapTimeout = setTimeout(() => {
        emitEvent(onLongTap, e)
      }, LONG_RESPONSE_TIME)
    }
  }

  const handleTouchMove: TouchEventHandler = (event) => {
    const e = event as TouchableEvent

    const touches = e.touches
    const p = {
      x: touches[0].pageX,
      y: touches[0].pageY,
    }

    if (touches.length > 1) {
      const p2 = {
        x: touches[1].pageX,
        y: touches[1].pageY,
      }

      if (pinchStartDistance.current > 0) {
        e.center = getCenter(p, p2)
        e.scale = getDistance(p, p2) / pinchStartDistance.current

        emitEvent(onPinch, e)
      }

      if (preV.current.x !== undefined && preV.current.y !== undefined) {
        const v = {
          x: p2.x - p.x,
          y: p2.y - p.y,
        }

        e.angle = getAngle(v, preV.current)

        emitEvent(onRotate, e)

        preV.current = v
      }
    } else {
      clearTimeout(longTapTimeout)

      const dx = p.x - (x2.current as number) || 0
      const dy = p.y - (y2.current as number) || 0

      e.dx = dx
      e.dy = dy
      e.direction = getSwipeDirection(
        { x: x1.current as number, y: y1.current as number },
        { x: x2.current as number, y: y2.current as number }
      )

      emitEvent(onMove, e)
    }

    x2.current = p.x
    y2.current = p.y
  }

  const handleTouchEnd: TouchEventHandler = (event) => {
    const e = event as TouchableEvent

    emitEvent(onTouchEnd, e)

    clearTimeout(longTapTimeout)

    if (
      x1.current === undefined ||
      y1.current === undefined ||
      x2.current === undefined ||
      y2.current === undefined ||
      isInRange(
        { x: x1.current, y: y1.current },
        { x: x2.current, y: y2.current }
      )
    ) {
      if (isDoubleTap) {
        clearTimeout(singleTapTimeout)
        emitEvent(onDoubleTap, e)
        isDoubleTap = false
        preX = undefined
        preY = undefined
      } else if (isSingleTap) {
        singleTapTimeout = setTimeout(() => {
          emitEvent(onTap, e)
        }, TAP_RESPONSE_TIME)
        isSingleTap = false
      }
    } else {
      const dx = x1.current - x2.current
      const dy = x1.current - y2.current

      e.dx = dx
      e.dy = dy
      e.direction = getSwipeDirection(
        { x: x1.current, y: y1.current },
        { x: x2.current, y: y2.current }
      )

      emitEvent(onSwipe, e)
    }

    x1.current = x2.current = y1.current = y2.current = undefined
    pinchStartDistance.current = 0
    preV.current = {
      x: 0,
      y: 0,
    }
  }

  return cloneElement(Children.only(children) as ReactElement, {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  })
}

export default memo(Touchable)

function getSwipeDirection(p1: Point, p2: Point) {
  if (Math.abs(p1.x - p2.x) >= Math.abs(p1.y - p2.y)) {
    if (p1.x - p2.x > 0) return 'left'

    return 'right'
  }
  if (p1.y - p2.y > 0) return 'up'

  return 'down'
}
