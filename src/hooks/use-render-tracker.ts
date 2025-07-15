import React, { useEffect, useRef } from 'react';

export function useRenderTracker(componentName: string, props?: any) {
  const renderCount = useRef(0);
  const lastProps = useRef(props);
  
  useEffect(() => {
    renderCount.current += 1;
    
    if (process.env.NODE_ENV === 'development') {
    //   console.log(`🔄 ${componentName} rendered #${renderCount.current}`);
      
      if (props && lastProps.current) {
        const changedProps = Object.keys(props).filter(
          key => props[key] !== lastProps.current[key]
        );
        
        if (changedProps.length > 0) {
        //   console.log(`📝 ${componentName} props changed:`, changedProps);
        }
      }
      
      lastProps.current = props;
    }
  });
  
  return renderCount.current;
}

// Visual re-render indicator component
export function RenderCounter({ name }: { name: string }): React.ReactElement | null {
  const count = useRenderTracker(name);
  
  if (process.env.NODE_ENV !== 'development') return null;
  
  return React.createElement(
    'div',
    { 
      className: "fixed top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded z-50",
      style: { zIndex: 9999 }
    },
    `${name}: ${count}`
  );
} 