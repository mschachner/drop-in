import { useState, useLayoutEffect } from 'react';

const useChildrenWidth = (ref) => {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const current = ref.current;
    if (!current) return;

    const measure = () => {
      const node = ref.current;
      if (!node) return;
      const children = Array.from(node.children);
      const styles = window.getComputedStyle(node);
      const gap = parseFloat(styles.columnGap || styles.gap || 0);
      const childrenWidth = children.reduce(
        (acc, child) => acc + child.offsetWidth,
        0
      );
      const total = childrenWidth + gap * Math.max(children.length - 1, 0);
      setWidth(total);
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(current);
    Array.from(current.children).forEach(child => resizeObserver.observe(child));
    window.addEventListener('resize', measure);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [ref]);

  return width;
};

export default useChildrenWidth;
