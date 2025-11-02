import { useCallback, useEffect, useRef, useState } from 'react';

export interface ZoomPanState {
  x: number;
  y: number;
  scale: number;
}

export function useZoomPan(initialScale = 1) {
  const [state, setState] = useState<ZoomPanState>({
    x: 0,
    y: 0,
    scale: initialScale,
  });

  const svgRef = useRef<SVGSVGElement>(null);
  const isPanning = useRef(false);
  const startPoint = useRef({ x: 0, y: 0 });

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setState((prev) => ({
      ...prev,
      scale: Math.max(0.1, Math.min(10, prev.scale * delta)),
    }));
  }, []);

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      isPanning.current = true;
      startPoint.current = { x: e.clientX - state.x, y: e.clientY - state.y };
    },
    [state.x, state.y]
  );

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanning.current) return;
    setState((prev) => ({
      ...prev,
      x: e.clientX - startPoint.current.x,
      y: e.clientY - startPoint.current.y,
    }));
  }, []);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    svg.addEventListener('wheel', handleWheel);
    svg.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      svg.removeEventListener('wheel', handleWheel);
      svg.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleWheel, handleMouseDown, handleMouseMove, handleMouseUp]);

  return { state, svgRef };
}
