import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

export default function BackgroundStorm({ colorTheme = 'orange' }: { colorTheme?: 'blue' | 'orange' | 'purple' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    const RES = 0.5;
    let renderer: THREE.WebGLRenderer;
    try {
        renderer = new THREE.WebGLRenderer({canvas, antialias:false, alpha:true, powerPreference:'high-performance'});
    } catch(e) { return; }
    
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1,1,1,-1,0,1);

    const COUNT = 12000;
    const seeds = new Float32Array(COUNT);
    const angs  = new Float32Array(COUNT);
    const rads  = new Float32Array(COUNT);
    for(let i=0;i<COUNT;i++){
        seeds[i] = Math.random();
        angs[i]  = Math.random()*Math.PI*2.0;
        rads[i]  = Math.sqrt(Math.random());
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(COUNT*3), 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    geo.setAttribute('aAng',  new THREE.BufferAttribute(angs, 1));
    geo.setAttribute('aRad',  new THREE.BufferAttribute(rads, 1));

    let crimson = 'vec3(0.72,0.10,0.03)';
    let amber = 'vec3(1.0,0.55,0.12)';
    
    if (colorTheme === 'blue') {
      crimson = 'vec3(0.1,0.2,0.8)';
      amber = 'vec3(0.12,0.6,1.0)';
    } else if (colorTheme === 'purple') {
      crimson = 'vec3(0.5,0.0,0.8)';
      amber = 'vec3(0.8,0.2,1.0)';
    }

    const uniforms = {
        uTime:   { value: 0 },
        uScale:  { value: 1 },
        uAspect: { value: 1.6 },
    };

    const mat = new THREE.ShaderMaterial({
        uniforms,
        transparent:true,
        depthTest:false,
        depthWrite:false,
        blending:THREE.AdditiveBlending,
        vertexShader:`
            attribute float aSeed;
            attribute float aAng;
            attribute float aRad;
            uniform float uTime;
            uniform float uScale;
            uniform float uAspect;
            varying float vHeat;
            varying float vFlick;
            varying float vCore;
            float hash(float n){ return fract(sin(n*12.9898)*43758.5453); }
            void main(){
                float life = hash(aSeed*7.31);
                float u = fract(uTime*(0.045 + life*0.06) + aSeed);
                float rmax = 0.58 + aRad*0.48;
                float r = max(rmax*(1.0 - u*0.82), 0.018);
                float omega = (0.55 + life*0.55) / (r*0.9 + 0.12);
                float spiral = (rmax - r)*5.2;
                float theta = aAng + uTime*omega*0.34 + spiral;
                float t1 = sin(theta*3.0 + aSeed*10.0 + uTime*0.8);
                float t2 = sin(r*9.0 - uTime*1.1 + aSeed*4.0);
                r += t1*0.022 + t2*0.016;
                float cx = 0.20, cy = 0.06;
                float x = cx + (cos(theta)*r)/uAspect;
                float y = cy + sin(theta)*r;
                y += u*0.11 + sin(uTime*5.0 + aSeed*30.0)*0.006;
                x += sin(uTime*3.3 + aSeed*22.0)*0.004/uAspect;

                vCore  = 1.0 - smoothstep(0.0, 0.17, r);
                vHeat  = clamp(pow(1.0-u, 1.3) * (0.5 + 0.5*(1.0-r)), 0.0, 1.0);
                vFlick = 0.55 + 0.45*sin(uTime*9.0 + aSeed*40.0);
                float sz = (0.7 + hash(aSeed*12.3)*2.7) * (0.45 + vHeat*1.55 + vCore*1.4);
                gl_Position = vec4(x, y, 0.0, 1.0);
                gl_PointSize = sz * uScale;
            }
        `,
        fragmentShader:`
            precision mediump float;
            varying float vHeat;
            varying float vFlick;
            varying float vCore;
            void main(){
                vec2 p = gl_PointCoord*2.0 - 1.0;
                float d = dot(p,p);
                if(d>1.0) discard;
                float core = (1.0-d); core *= core;
                vec3 crimson = ${crimson};
                vec3 amber   = ${amber};
                vec3 white   = vec3(1.0,0.93,0.78);
                vec3 c = mix(crimson, amber, vHeat);
                c = mix(c, white, vCore*0.85);
                float a = core*(0.28 + 0.85*vHeat)*vFlick + core*vCore*0.55;
                gl_FragColor = vec4(c*(1.0 + vHeat*0.5 + vCore*0.7), a);
            }
        `
    });

    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    scene.add(points);

    function resize(){
        if (!canvasRef.current) return;
        const w = window.innerWidth, h = window.innerHeight;
        renderer.setSize(Math.round(w*RES), Math.round(h*RES), false);
        canvasRef.current.style.width = w+'px';
        canvasRef.current.style.height = h+'px';
        uniforms.uAspect.value = Math.max(0.6, w/h);
        uniforms.uScale.value = Math.max(0.6, (h*RES)/900);
    }
    resize();
    window.addEventListener('resize', resize);

    let raf=0, running=true, last=performance.now();
    function frame(now: number){
        if(!running) return;
        const dt = Math.min(0.05,(now-last)/1000); last=now;
        uniforms.uTime.value += dt;
        renderer.render(scene,camera);
        raf=requestAnimationFrame(frame);
    }
    
    raf=requestAnimationFrame(frame);
    
    const handleVis = () => {
        if(document.hidden){ running=false; cancelAnimationFrame(raf); }
        else { running=true; last=performance.now(); raf=requestAnimationFrame(frame); }
    };
    document.addEventListener('visibilitychange', handleVis);

    // Ambient breathing animations
    gsap.to('.storm-core',{filter:'brightness(1.35)',duration:2.4,repeat:-1,yoyo:true,ease:'sine.inOut'});
    gsap.to('.storm-ring',{rotation:360,duration:46,repeat:-1,ease:'none',transformOrigin:'50% 50%'});

    return () => {
        window.removeEventListener('resize', resize);
        document.removeEventListener('visibilitychange', handleVis);
        cancelAnimationFrame(raf);
        renderer.dispose();
    };
  }, [colorTheme]); // Re-run effect when theme changes to recreate material

  // Dynamic gradients for HTML elements
  let bgGradient = 'radial-gradient(60% 60% at 60% 47%, rgba(255,80,24,0.30) 0%, rgba(200,40,12,0.10) 30%, rgba(8,5,3,0) 58%), radial-gradient(120% 90% at 14% 116%, rgba(255,90,26,0.22) 0%, rgba(8,5,3,0) 52%)';
  let coreGradient = 'radial-gradient(circle,rgba(255,150,70,0.42) 0%,rgba(255,70,20,0.16) 28%,rgba(190,30,10,0.05) 48%,rgba(8,5,3,0) 66%)';
  let ringGradient = 'conic-gradient(from 0deg,rgba(255,120,40,0) 0deg,rgba(255,140,55,0.18) 60deg,rgba(255,90,30,0) 130deg,rgba(255,150,70,0.12) 220deg,rgba(255,90,30,0) 300deg,rgba(255,120,40,0) 360deg)';

  if (colorTheme === 'blue') {
      bgGradient = 'radial-gradient(60% 60% at 60% 47%, rgba(24,120,255,0.30) 0%, rgba(12,80,200,0.10) 30%, rgba(8,5,3,0) 58%), radial-gradient(120% 90% at 14% 116%, rgba(26,140,255,0.22) 0%, rgba(8,5,3,0) 52%)';
      coreGradient = 'radial-gradient(circle,rgba(70,180,255,0.42) 0%,rgba(20,100,255,0.16) 28%,rgba(10,50,190,0.05) 48%,rgba(8,5,3,0) 66%)';
      ringGradient = 'conic-gradient(from 0deg,rgba(40,160,255,0) 0deg,rgba(55,180,255,0.18) 60deg,rgba(30,120,255,0) 130deg,rgba(70,200,255,0.12) 220deg,rgba(30,120,255,0) 300deg,rgba(40,160,255,0) 360deg)';
  } else if (colorTheme === 'purple') {
      bgGradient = 'radial-gradient(60% 60% at 60% 47%, rgba(180,24,255,0.30) 0%, rgba(120,12,200,0.10) 30%, rgba(8,5,3,0) 58%), radial-gradient(120% 90% at 14% 116%, rgba(200,26,255,0.22) 0%, rgba(8,5,3,0) 52%)';
      coreGradient = 'radial-gradient(circle,rgba(220,70,255,0.42) 0%,rgba(160,20,255,0.16) 28%,rgba(100,10,190,0.05) 48%,rgba(8,5,3,0) 66%)';
      ringGradient = 'conic-gradient(from 0deg,rgba(180,40,255,0) 0deg,rgba(200,55,255,0.18) 60deg,rgba(150,30,255,0) 130deg,rgba(230,70,255,0.12) 220deg,rgba(150,30,255,0) 300deg,rgba(180,40,255,0) 360deg)';
  }

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#080503]">
        {/* Deep Forge Ground Layer */}
        <div className="absolute inset-0 z-0 opacity-80" 
             style={{background: `${bgGradient}, radial-gradient(140% 130% at 50% 50%, rgba(20,10,6,0) 38%, rgba(4,2,1,0.74) 100%), linear-gradient(180deg,#0b0604 0%,#080403 100%)`}}>
        </div>

        {/* Breathing Core Overlay */}
        <div className="storm-core absolute z-[1] left-[50%] lg:left-[25%] top-[50%] w-[50vmax] lg:w-[34vmax] h-[50vmax] lg:h-[34vmax] -translate-x-1/2 -translate-y-1/2 mix-blend-screen will-change-transform"
             style={{background: coreGradient}}>
        </div>

        {/* Rotating Ember Ring */}
        <div className="storm-ring absolute z-[1] left-[50%] lg:left-[25%] top-[50%] w-[45vmax] lg:w-[30vmax] h-[45vmax] lg:h-[30vmax] -translate-x-1/2 -translate-y-1/2 mix-blend-screen rounded-full will-change-transform opacity-70"
             style={{
                background: ringGradient,
                WebkitMask: 'radial-gradient(circle,transparent 60%,#000 61%,#000 70%,transparent 72%)',
                mask: 'radial-gradient(circle,transparent 60%,#000 61%,#000 70%,transparent 72%)'
             }}>
        </div>

        {/* WebGL Canvas for Particle Storm */}
        <canvas ref={canvasRef} className="absolute inset-0 z-[2] w-full h-full block mix-blend-screen transition-opacity duration-1000"></canvas>

        {/* Readability Scrim (to darken right side for form) */}
        <div className="absolute inset-0 z-[3] pointer-events-none bg-gradient-to-r from-transparent via-[#080503]/50 to-[#080503]/90">
        </div>
    </div>
  );
}
