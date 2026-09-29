import type { GestureFrame } from './types';

export class ChoirVisual {
  private ctx: CanvasRenderingContext2D;
  private id = 0;
  private width = 0;
  private height = 0;
  private level = 0;
  private observer: ResizeObserver;
  voices = [true, true, true, false];
  running = false;
  brightness = 0.55;
  pointer = { x: 0.5, y: 0.5 };
  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(canvas);
    this.resize();
    this.id = requestAnimationFrame(this.draw);
  }
  private resize() {
    const rect = this.canvas.getBoundingClientRect();
    const ratio = Math.min(devicePixelRatio || 1, 2);
    this.width = rect.width; this.height = rect.height;
    this.canvas.width = Math.round(rect.width * ratio);
    this.canvas.height = Math.round(rect.height * ratio);
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  setLevel(level: number) { this.level += (level - this.level) * 0.16; }
  private draw = (time: number) => {
    const ctx = this.ctx, w = this.width, h = this.height;
    ctx.clearRect(0, 0, w, h);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = reduced ? 0 : time / 1000;
    const cx = w * 0.5 + (this.pointer.x - .5) * (this.running ? 22 : 0);
    const cy = h * 0.48 + (this.pointer.y - .5) * (this.running ? 16 : 0);
    const size = Math.min(w * .33, h * .35, 205);
    const breath = 1 + Math.sin(t * .55) * .025 + this.level * .08;
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 1.55);
    glow.addColorStop(0, 'rgba(154,177,109,0.08)'); glow.addColorStop(.55, 'rgba(140,172,96,0.045)'); glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);
    // Four families of orbital strands; each corresponds to one audible voice.
    const colors = [[214,231,169], [175,205,164], [214,198,141], [163,190,207]];
    const points: {x:number;y:number;z:number;a:number;color:number[]}[] = [];
    for (let voice = 0; voice < 4; voice++) {
      const audible = this.voices[voice];
      for (let strand = 0; strand < 9; strand++) {
        const tilt = voice * Math.PI / 4 + strand * .023 + t * .045;
        for (let step = 0; step < 155; step++) {
          const a = step / 155 * Math.PI * 2;
          const ripple = Math.sin(a * 3 + t * .3 + strand * .2) * 6;
          const radius = (size - strand * 3.1 + ripple) * breath;
          const ax = Math.cos(a) * radius;
          const ay = Math.sin(a) * radius * (.30 + voice * .012);
          const x = ax * Math.cos(tilt) - ay * Math.sin(tilt);
          const y = ax * Math.sin(tilt) + ay * Math.cos(tilt);
          const z = Math.sin(a + t * .11 + voice) * .5 + .5;
          points.push({x:cx+x, y:cy+y, z, a:(.13 + z * .66) * (audible ? 1 : .20), color: colors[voice]});
        }
      }
    }
    points.sort((a,b)=>a.z-b.z);
    for (const p of points) {
      ctx.fillStyle = `rgba(${p.color.join(',')},${p.a})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, .42 + p.z * .72, 0, Math.PI * 2); ctx.fill();
    }
    for (let i = 0; i < 45; i++) {
      const a = i * 2.39996 + t * .012;
      const r = size * (1.16 + (i % 8) * .075);
      ctx.fillStyle = `rgba(219,231,192,${.08 + (i % 4) * .04})`;
      ctx.fillRect(cx + Math.cos(a) * r, cy + Math.sin(a) * r * .83, 1.2, 1.2);
    }
    this.id = requestAnimationFrame(this.draw);
  };
  destroy() { cancelAnimationFrame(this.id); this.observer.disconnect(); }
}

export function drawHand(canvas: HTMLCanvasElement, frame: GestureFrame) {
  const ctx=canvas.getContext('2d')!;
  const {width:w,height:h}=canvas;
  ctx.clearRect(0,0,w,h);
  if(!frame.present)return;
  const hands=[{hand:frame.leftHand,color:'#d8e9a4',name:'CHORD'},{hand:frame.rightHand,color:'#a6d9dd',name:'EXPRESSION'}];
  for(const {hand,color,name} of hands) {
    if(!hand)continue;
    const points=hand.landmarks;
    const paths=[[0,1,2,3,4],[0,5,6,7,8],[5,9,10,11,12],[9,13,14,15,16],[13,17,18,19,20],[0,17],[5,9,13,17]];
    ctx.strokeStyle=color;ctx.lineWidth=2;ctx.shadowColor=color;ctx.shadowBlur=3;
    for(const path of paths){ctx.beginPath();path.forEach((i,j)=>{if(points[i]){const p=points[i];j?ctx.lineTo((1-p.x)*w,p.y*h):ctx.moveTo((1-p.x)*w,p.y*h);}});ctx.stroke();}
    points.forEach((p,i)=>{ctx.fillStyle=color;ctx.beginPath();ctx.arc((1-p.x)*w,p.y*h,[4,8,12,16,20].includes(i)?4:2,0,Math.PI*2);ctx.fill();});
    ctx.shadowBlur=0;
    const wrist=points[0];if(wrist){ctx.font='12px sans-serif';ctx.fillStyle=color;ctx.fillText(name,(1-wrist.x)*w-30,Math.min(h-8,wrist.y*h+24));}
  }
}
