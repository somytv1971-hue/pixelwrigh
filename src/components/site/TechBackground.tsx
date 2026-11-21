import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  originX: number;
  originY: number;
  radius: number;
  color: string;
  pulsePhase: number;
}

export function TechBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = { x: -1000, y: -1000, radius: 150 };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initNodes();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const colors = [
      "rgba(139, 92, 246, 0.8)", // Violet
      "rgba(217, 70, 239, 0.8)", // Fuchsia
      "rgba(34, 211, 238, 0.8)",  // Cyan
      "rgba(168, 85, 247, 0.8)", // Purple
    ];

    let nodes: Node[] = [];

    const initNodes = () => {
      nodes = [];
      const density = Math.floor((width * height) / 14000);
      const count = Math.min(Math.max(density, 45), 110);

      for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        nodes.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          originX: x,
          originY: y,
          radius: Math.random() * 2 + 1.2,
          color: colors[Math.floor(Math.random() * colors.length)] ?? "rgba(139, 92, 246, 0.8)",
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
    };

    initNodes();

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Connect nodes
      const maxDist = 140;
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        if (!n1) continue;

        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          if (!n2) continue;

          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.28;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
            ctx.lineWidth = 0.85;
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }
      }


      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (!n) continue;


        n.x += n.vx + Math.sin(time + n.pulsePhase) * 0.3;
        n.y += n.vy + Math.cos(time + n.pulsePhase) * 0.3;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        // Mouse avoidance/interactive push
        const mdx = n.x - mouse.x;
        const mdy = n.y - mouse.y;
        const mdist = Math.hypot(mdx, mdy);
        if (mdist < mouse.radius && mdist > 0) {
          const force = (mouse.radius - mdist) / mouse.radius;
          n.x += (mdx / mdist) * force * 3.5;
          n.y += (mdy / mdist) * force * 3.5;
        }

        // Draw node with glow
        ctx.save();
        ctx.beginPath();
        const pulse = Math.sin(time * 2 + n.pulsePhase) * 0.5 + 1;
        ctx.arc(n.x, n.y, n.radius * pulse, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.shadowColor = n.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-[oklch(0.06_0.015_290)]">
      {/* 3D Morphing Gradient Blobs */}
      <div
        className="absolute -left-[15%] -top-[10%] h-[75vh] w-[75vh] rounded-full opacity-65 blur-[120px]"
        style={{
          background: "radial-gradient(circle, oklch(0.48 0.26 288) 0%, transparent 70%)",
          animation: "mesh-drift-1 20s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -right-[10%] top-[10%] h-[65vh] w-[65vh] rounded-full opacity-55 blur-[130px]"
        style={{
          background: "radial-gradient(circle, oklch(0.62 0.27 330) 0%, transparent 70%)",
          animation: "mesh-drift-2 25s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-[5%] left-[20%] h-[60vh] w-[60vh] rounded-full opacity-50 blur-[110px]"
        style={{
          background: "radial-gradient(circle, oklch(0.83 0.12 200) 0%, transparent 70%)",
          animation: "mesh-drift-3 22s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -bottom-[15%] right-[15%] h-[55vh] w-[55vh] rounded-full opacity-45 blur-[100px]"
        style={{
          background: "radial-gradient(circle, oklch(0.68 0.22 300) 0%, transparent 70%)",
          animation: "mesh-drift-4 18s ease-in-out infinite",
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-[45vh] w-[85vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[150px]"
        style={{
          background: "radial-gradient(ellipse, oklch(0.52 0.25 296 / 0.35) 0%, transparent 70%)",
          animation: "mesh-pulse 8s ease-in-out infinite",
        }}
      />

      {/* Cyberpunk/Tech Grid Overlay */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="tech-canvas-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.6" />
            <circle cx="60" cy="0" r="1.2" fill="rgba(255,255,255,0.4)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#tech-canvas-grid)" />
      </svg>

      {/* Interactive 3D Connected Node Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-85" />
    </div>
  );
}
