import {
  height,
  MAX_SPEED,
  PADDLE_HEIGHT,
  PADDLE_WIDTH,
  RADIUS,
  width,
} from "./constants";
import {
  CircleInterface,
  Collision,
  PaddleInterface,
  ShapeInterface,
} from "./types";

export const resolveWallCollisions = (object: ShapeInterface) => {
  "worklet";
  const circleObject = object as CircleInterface;
  // Right wall
  if (circleObject.x.value + circleObject.r > width) {
    circleObject.x.value = width - circleObject.r * 2;
    circleObject.vx = -circleObject.vx;
    circleObject.ax = -circleObject.ax;
    // bottom wall
  } else if (circleObject.y.value - circleObject.r > height) {
    circleObject.y.value = height - circleObject.r * 2;
    circleObject.vy = -circleObject.vy;
    circleObject.ay = -circleObject.ay;
    // left wall
  } else if (circleObject.x.value - circleObject.r < 0) {
    circleObject.x.value = circleObject.r * 2;
    circleObject.vx = -circleObject.vx;
    circleObject.ax = -circleObject.ax;
    // top wall
  } else if (circleObject.y.value + circleObject.r < 0) {
    circleObject.y.value = circleObject.r;
    circleObject.vy = -circleObject.vy;
    circleObject.ay = -circleObject.ay;
  }
};

export const createBouncingSample = (circleObject: CircleInterface) => {
  "worklet";

  circleObject.x.value = 100;
  circleObject.y.value = 550;
  circleObject.r = RADIUS;
  circleObject.ax = 5;
  circleObject.ay = 1;
  circleObject.vx = 0;
  circleObject.vy = 0;
};

const move = (object: ShapeInterface, dt: number) => {
  "worklet";

  object.vx += object.ax * dt;
  object.vy += object.ay * dt;

  if (object.vx > MAX_SPEED) {
    object.vx = MAX_SPEED;
  }
  if (object.vx < -MAX_SPEED) {
    object.vx = -MAX_SPEED;
  }
  if (object.vy > MAX_SPEED) {
    object.vy = MAX_SPEED;
  }
  if (object.vy < -MAX_SPEED) {
    object.vy = -MAX_SPEED;
  }

  object.x.value += object.vx * dt;
  object.y.value += object.vy * dt;
};

export const animate = (
  objects: ShapeInterface[],
  timeSincePreviousFrame: number,
  brickCount: number
) => {
  "worklet";
  for (const o of objects) {
    if (o.type === "Circle") {
      move(o, (0.15 / 16) * timeSincePreviousFrame);
    }
  }

  for (const o of objects) {
    if (o.type === "Circle") {
      resolveWallCollisions(o);
    }
  }

  const collisions: Collision[] = [];

  for (const [i, o1] of objects.entries()) {
    for (const [j, o2] of objects.entries()) {
        debugger(o2);
      if (i < j) {
        // const { collided, collisionInfo } = checkCollision(o1, o2);
        if (false) {
          //   collisions.push(collisionInfo);
        }
      }
    }
  }

  //   for (const collision of collisions) {
  //     resolveCollisionWithBounce(collision);
  //   }
};

function circleRect(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
) {
  "worklet";
  let textX = cx;
  let textY = cy;

  if (cx < rx) textX = rx;
  else if (cx > rx + rw) textX = rx + rw;
  if (cy < ry) textY = ry;
  else if (cy > ry + rh) textY = ry + rh;

  let distX = cx - textX;
  let distY = cy - textY;

  const distance = Math.sqrt(distX * distX + distY * distY);

  if (distance <= RADIUS) {
    return true;
  }

  return false;
}

const checkCollision = (o1: ShapeInterface, o2: ShapeInterface) => {
  "worklet";

  if (o1.type === "Circle" && o2.type === "Paddle") {
    const dx = o2.x.value - o1.x.value;
    const dy = o2.y.value - o1.y.value;

    const d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

    const circleObject = o1 as CircleInterface;
    const rectangleObject = o2 as PaddleInterface;

    const isCollision = circleRect(
      circleObject.x.value,
      circleObject.y.value,
      rectangleObject.x.value,
      rectangleObject.y.value,
      PADDLE_WIDTH,
      PADDLE_HEIGHT
    );

    if (isCollision) {
      return {
        collisionInfo: { o1, o2, dx, dy, d },
        collided: true,
      };
    }

    return {
      collisionInfo: null,
      collided: false,
    };
  }
};

export const resolveCollisionWithBounce = (info: Collision) => {
  "worklet";
  const circleInfo = info.o1 as CircleInterface;
  circleInfo.y.value = circleInfo.y.value - circleInfo.r;

  circleInfo.vy = -circleInfo.vy;
  circleInfo.ay = -circleInfo.ay;
};
