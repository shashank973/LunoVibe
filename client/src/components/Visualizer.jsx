import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePlayer } from '../context/PlayerContext';

export default function Visualizer() {
  const canvasRef = useRef(null);
  const { activeMood, themeData } = useTheme();
  const { isPlaying, currentTrack, progress } = usePlayer();
  
  // Track visual states in refs to preserve across renders
  const particlesRef = useRef([]);
  const pulseRef = useRef(1.0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationId;
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initialize particles
    const initParticles = () => {
      const config = themeData.particles || { color: '#00ffcc', count: 30, speed: 1.0, size: 2.0 };
      const count = config.count;
      const array = [];
      
      for (let i = 0; i < count; i++) {
        array.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * config.speed,
          vy: (Math.random() - 0.5) * config.speed,
          size: Math.random() * config.size + 1,
          alpha: Math.random() * 0.6 + 0.2,
          glow: Math.random() > 0.5,
          angle: Math.random() * Math.PI * 2,
          spinSpeed: (Math.random() - 0.5) * 0.02
        });
      }
      particlesRef.current = array;
    };

    initParticles();

    // The animation loop
    const render = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, width, height);

      const color = themeData.particles.color;
      const moodLower = activeMood.toLowerCase();
      const speedMultiplier = isPlaying ? 1.8 : 0.4;
      
      // Update central orb pulse based on playing state
      if (isPlaying) {
        pulseRef.current = 1.0 + Math.sin(Date.now() * 0.015) * 0.08 + Math.cos(Date.now() * 0.007) * 0.04;
      } else {
        pulseRef.current = 1.0 + Math.sin(Date.now() * 0.002) * 0.02; // slow breathing
      }

      // Draw central cinematic glowing orb
      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = Math.min(width, height) * 0.2;
      const radius = baseRadius * pulseRef.current;

      // Parse active color (hex or HSL)
      let rgbaColorInner = "rgba(0, 255, 200, 0.15)";
      let rgbaColorOuter = "rgba(0, 255, 200, 0.02)";
      if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        rgbaColorInner = `rgba(${r}, ${g}, ${b}, 0.25)`;
        rgbaColorOuter = `rgba(${r}, ${g}, ${b}, 0.02)`;
      } else if (color.includes('hsl')) {
        rgbaColorInner = color.replace('hsl', 'hsla').replace(')', ', 0.25)');
        rgbaColorOuter = color.replace('hsl', 'hsla').replace(')', ', 0.02)');
      }

      // Draw central cinematic glowing orb
      const radGrad = ctx.createRadialGradient(centerX, centerY, radius * 0.1, centerX, centerY, radius);
      radGrad.addColorStop(0, rgbaColorInner);
      radGrad.addColorStop(0.5, rgbaColorOuter);
      radGrad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw floating particles with mood-based physics
      particlesRef.current.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = color;
        
        if (p.glow) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = color;
        }

        // 1. Rainy Mood -> Falling streaks
        if (moodLower.includes('rain')) {
          p.vy = Math.abs(p.vy) + 0.1; // ensure falling
          p.y += p.vy * speedMultiplier * 3;
          p.x += p.vx * 0.3; // minor sway
          
          if (p.y > height) {
            p.y = 0;
            p.x = Math.random() * width;
          }
          
          ctx.strokeStyle = color;
          ctx.lineWidth = p.size * 0.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 2, p.y + p.size * 6);
          ctx.stroke();
        } 
        // 2. Banaras Ghat Vibes -> Floating diya sparks rising slowly
        else if (moodLower.includes('banaras') || moodLower.includes('ghat')) {
          p.vy = -Math.abs(p.vy) - 0.02; // rise upwards
          p.y += p.vy * speedMultiplier * 1.5;
          p.x += Math.sin(p.y * 0.01 + p.angle) * 0.3; // floating wiggle
          
          if (p.y < 0) {
            p.y = height;
            p.x = Math.random() * width;
          }

          // Draw little flame-drop shapes (diya sparks)
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 + Math.sin(Date.now() * 0.01 + p.x) * 0.2), 0, Math.PI * 2);
          ctx.fill();
        } 
        // 3. Late Night Coding -> Horizontal digital matrix ticks
        else if (moodLower.includes('coding')) {
          p.vx = Math.abs(p.vx) + 0.05; // scroll right
          p.x += p.vx * speedMultiplier * 2.0;
          
          if (p.x > width) {
            p.x = 0;
            p.y = Math.random() * height;
          }
          
          ctx.font = `${p.size * 4}px monospace`;
          const binaryChar = Math.random() > 0.5 ? "1" : "0";
          ctx.fillText(binaryChar, p.x, p.y);
        }
        // 4. Default Ambient Floating Orbs
        else {
          p.x += p.vx * speedMultiplier;
          p.y += p.vy * speedMultiplier;
          
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * pulseRef.current, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      // Draw reactive waveforms around the center orb if playing
      if (isPlaying) {
        ctx.strokeStyle = rgbaColorInner.replace('0.25', '0.4');
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        const segments = 120;
        
        for (let i = 0; i <= segments; i++) {
          const angle = (i / segments) * Math.PI * 2;
          // Trigger audio frequency spikes procedurally using math waves
          const waveAmp = 10 + Math.sin(i * 0.2 + Date.now() * 0.015) * 15 + Math.cos(i * 0.4 - Date.now() * 0.008) * 8;
          const r = radius * 0.9 + waveAmp;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;
          
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [themeData, activeMood, isPlaying]);

  return (
    <canvas 
      ref={canvasRef} 
      className="particle-canvas" 
      style={{
        width: '100%',
        height: '100%',
        display: 'block'
      }}
    />
  );
}
