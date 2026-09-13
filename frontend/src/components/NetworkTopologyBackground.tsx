import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function NetworkTopologyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0a0a, 300, 950);

    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 2000);
    camera.position.z = 650;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const group = new THREE.Group();
    scene.add(group);

    const numNodes = 120;
    const nodes: THREE.Mesh[] = [];
    const nodeGeo = new THREE.SphereGeometry(1, 16, 16);
    
    for(let i = 0; i < numNodes; i++) {
        let phi = Math.acos(-1 + (2 * i) / numNodes);
        let theta = Math.sqrt(numNodes * Math.PI) * phi;
        let x = Math.cos(theta) * Math.sin(phi);
        let y = Math.sin(theta) * Math.sin(phi);
        let z = Math.cos(phi);

        let mesh = new THREE.Mesh(
            nodeGeo,
            new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
        );
        mesh.position.set(x, y, z);
        mesh.userData = {
            baseSize: Math.random() * 1.5 + 1.0,
            pulseSpeed: Math.random() * 0.02 + 0.015,
            pulseOffset: Math.random() * Math.PI * 2
        };
        group.add(mesh);
        nodes.push(mesh);
    }

    const linePos = [];
    const lineColors = [];
    for(let i = 0; i < numNodes; i++) {
        for(let j = i + 1; j < numNodes; j++) {
            let dist = nodes[i].position.distanceTo(nodes[j].position);
            const threshold = 0.45;
            if(dist < threshold) {
                linePos.push(nodes[i].position.x, nodes[i].position.y, nodes[i].position.z);
                linePos.push(nodes[j].position.x, nodes[j].position.y, nodes[j].position.z);
                
                let alpha = (1 - dist / threshold) * 0.8;
                lineColors.push(alpha, alpha, alpha);
                lineColors.push(alpha, alpha, alpha);
            }
        }
    }
    
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
    lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));
    const lineMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.65
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    group.add(lines);

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        
        const R = width > 768 ? 380 : 200;
        group.scale.set(R, R, R);
        
        const centerX = width > 768 ? width * 0.2 : 0; 
        const centerY = width > 768 ? -height * 0.05 : -height * 0.2;
        group.position.set(centerX, centerY, 0);

        const glow = document.getElementById('canvasGlow');
        if (glow) {
            glow.style.left = `${(width / 2) + centerX}px`;
            glow.style.top = `${(height / 2) - centerY}px`;
            glow.style.width = `${R * 2.8}px`;
            glow.style.height = `${R * 2.8}px`;
        }
    }

    window.addEventListener('resize', resize);
    resize();

    let time = 0;
    let animationFrameId: number;

    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        time += 1;
        
        group.rotation.y = time * 0.0018;
        group.rotation.x = 0.2;
        group.rotation.z = time * 0.0006;

        nodes.forEach(mesh => {
            let p = mesh.userData;
            let pulse = (Math.sin((time * p.pulseSpeed) + p.pulseOffset) + 1) / 2;
            
            let targetRadius = p.baseSize + pulse * 1.8;
            let scale = targetRadius / group.scale.x;
            
            mesh.scale.set(scale, scale, scale);
            (mesh.material as THREE.MeshBasicMaterial).opacity = 0.4 + (pulse * 0.6);
        });

        renderer.render(scene, camera);
    }
    
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      nodeGeo.dispose();
    };
  }, []);

  return (
    <>
      <div id="canvasGlow" className="absolute pointer-events-none rounded-full blur-[120px] opacity-[0.15] bg-white transition-all duration-1000" style={{ zIndex: 0, transform: 'translate(-50%, -50%)' }}></div>
      <canvas ref={canvasRef} id="animationCanvas" className="absolute inset-0 w-full h-full z-0 pointer-events-none"></canvas>
    </>
  );
}
