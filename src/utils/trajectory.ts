export interface TrajectoryVector {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  rotationSpeed: number;
  initialRotation: number;
}

/**
 * Generates high-variance omni-directional linear trajectories across the rugby pitch.
 * Supports edge-to-edge, corner-to-corner, diagonal slicing, and varying speeds.
 */
export function generateRandomLinearTrajectory(options?: {
  minSpan?: number;
  maxSpan?: number;
}): TrajectoryVector {
  const minSpan = options?.minSpan ?? 50;
  const maxSpan = options?.maxSpan ?? 82;

  // 6 different spawn origins for maximum trajectory variance
  const pattern = Math.floor(Math.random() * 6);

  let startX = 0;
  let startY = 0;
  let endX = 0;
  let endY = 0;

  switch (pattern) {
    case 0: {
      // Left border to somewhere on the right half
      startX = 6 + Math.random() * 8;
      startY = 15 + Math.random() * 70;
      const angle = (Math.random() - 0.5) * 1.2; // -35 to +35 degrees
      const dist = minSpan + Math.random() * (maxSpan - minSpan);
      endX = Math.min(92, startX + dist);
      endY = Math.min(88, Math.max(12, startY + Math.tan(angle) * dist));
      break;
    }
    case 1: {
      // Right border to somewhere on the left half
      startX = 94 - Math.random() * 8;
      startY = 15 + Math.random() * 70;
      const angle = (Math.random() - 0.5) * 1.2;
      const dist = minSpan + Math.random() * (maxSpan - minSpan);
      endX = Math.max(8, startX - dist);
      endY = Math.min(88, Math.max(12, startY + Math.tan(angle) * dist));
      break;
    }
    case 2: {
      // Top border downwards (steep or angled)
      startX = 12 + Math.random() * 76;
      startY = 10 + Math.random() * 6;
      const angle = (Math.random() - 0.5) * 1.4;
      const dist = minSpan + Math.random() * (maxSpan - minSpan);
      endX = Math.min(90, Math.max(10, startX + Math.sin(angle) * dist));
      endY = Math.min(88, startY + Math.cos(angle) * dist);
      break;
    }
    case 3: {
      // Bottom border upwards (kickoff or up-and-under)
      startX = 12 + Math.random() * 76;
      startY = 90 - Math.random() * 6;
      const angle = (Math.random() - 0.5) * 1.4;
      const dist = minSpan + Math.random() * (maxSpan - minSpan);
      endX = Math.min(90, Math.max(10, startX + Math.sin(angle) * dist));
      endY = Math.max(12, startY - Math.cos(angle) * dist);
      break;
    }
    case 4: {
      // Corner to opposing corner diagonal slice
      const fromTop = Math.random() > 0.5;
      const fromLeft = Math.random() > 0.5;
      startX = fromLeft ? 8 + Math.random() * 8 : 92 - Math.random() * 8;
      startY = fromTop ? 14 + Math.random() * 8 : 86 - Math.random() * 8;
      endX = fromLeft ? 88 - Math.random() * 10 : 12 + Math.random() * 10;
      endY = fromTop ? 84 - Math.random() * 10 : 16 + Math.random() * 10;
      break;
    }
    case 5:
    default: {
      // Center-crossing vector from random angle
      const theta = Math.random() * Math.PI * 2;
      const centerOffsetX = (Math.random() - 0.5) * 20;
      const centerOffsetY = (Math.random() - 0.5) * 20;
      const radius = 42 + Math.random() * 8;

      startX = Math.min(92, Math.max(8, 50 + centerOffsetX - Math.cos(theta) * radius));
      startY = Math.min(88, Math.max(12, 50 + centerOffsetY - Math.sin(theta) * radius));
      endX = Math.min(92, Math.max(8, 50 + centerOffsetX + Math.cos(theta) * radius));
      endY = Math.min(88, Math.max(12, 50 + centerOffsetY + Math.sin(theta) * radius));
      break;
    }
  }

  // Ensure minimum distance so trajectory is always energetic and visible
  const dx = endX - startX;
  const dy = endY - startY;
  const distance = Math.hypot(dx, dy);
  if (distance < minSpan) {
    const scale = minSpan / (distance || 1);
    endX = Math.min(92, Math.max(8, startX + dx * scale));
    endY = Math.min(88, Math.max(12, startY + dy * scale));
  }

  // High-variance rotation speed (-260 deg/s to +260 deg/s)
  const rotationSpeed = (Math.random() > 0.5 ? 1 : -1) * (120 + Math.random() * 180);
  const initialRotation = Math.random() * 360;

  return {
    startX,
    startY,
    endX,
    endY,
    rotationSpeed,
    initialRotation,
  };
}
