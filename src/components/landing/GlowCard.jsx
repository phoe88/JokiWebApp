/** A glass card whose border lights up around the pointer. */
export default function GlowCard({ as: Tag = 'article', className = '', children, ...rest }) {
  const trackPointer = (event) => {
    const { left, top } = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--px', `${event.clientX - left}px`);
    event.currentTarget.style.setProperty('--py', `${event.clientY - top}px`);
  };

  return (
    <Tag onPointerMove={trackPointer} className={`glass glow-card glitch-host ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
