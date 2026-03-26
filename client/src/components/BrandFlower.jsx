import React, { useRef } from 'react';

export default function BrandFlower() {
  const ref = useRef(null);

  const handleClick = () => {
    const el = ref.current;
    if (!el || el.classList.contains('spinning')) return;
    el.classList.add('spinning');
    el.addEventListener('animationend', () => {
      el.classList.remove('spinning');
    }, { once: true });
  };

  return (
    <div className="brand-flower" ref={ref} onClick={handleClick}>
      <div className="petal petal-1" />
      <div className="petal petal-2" />
      <div className="petal petal-3" />
      <div className="petal petal-4" />
      <div className="petal petal-5" />
      <div className="petal-center" />
    </div>
  );
}
