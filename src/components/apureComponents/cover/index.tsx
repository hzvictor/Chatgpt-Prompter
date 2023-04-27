import React, { useRef, useEffect } from 'react';
import p5 from 'p5';

function Sketch({ seedText }: any) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = new p5(sketch, canvasRef.current);
    return () => {
      canvas.remove();
    };
  }, []);

  const sketch = (p) => {
    let seed = seedText;
    let size = 300;
    let xoff = 0;
    let yoff = 0;

    p.setup = () => {
      p.createCanvas(size, 200);
      p.randomSeed(hashCode(seed));
      p.background(p.random(255), p.random(255), p.random(255));
      p.noStroke();
      for (let i = 0; i < 500; i++) {
        p.fill(p.random(255), p.random(255), p.random(255), p.random(100, 200));
        let x = p.map(p.noise(xoff), 0, 1, 0, size);
        let y = p.map(p.noise(yoff), 0, 1, 0, 200);
        let w = p.random(20, 70);
        let h = p.random(20, 70);
        p.ellipse(x, y, w, h);
        xoff += p.random(0.05, 0.08);
        yoff += p.random(0.01, 0.05);
      }
    };

    function hashCode(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        let chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;
      }
      return hash;
    }
  };

  return <div ref={canvasRef} />;
}

export default Sketch;
