---
name: ux-ui-design-expert
description: Advanced integration of smooth scrolling (Lenis), animations (GSAP), 3D rendering (React Three Fiber & Drei), and modern UI components (Aceternity UI) to create premium, highly interactive interfaces.
---

# UX/UI Design Expert Skill

Esta habilidad (skill) amplía mi conocimiento como agente para diseñar y desarrollar interfaces modernas, con animaciones fluidas, scroll suave y experiencias 3D en la web.

## 1. GSAP (GreenSock Animation Platform)
GSAP es el estándar asombroso para animaciones de alto rendimiento.
- **Uso en React**: Siempre usar el hook `useGSAP()` desde `@gsap/react` para un manejo seguro del ciclo de vida (limpieza automática dentro de los componentes React).
- **Animaciones comunes**: `gsap.to()`, `gsap.from()`, `gsap.fromTo()`, y `timeline` para secuencias.
- **ScrollTrigger**: Permite sincronizar animaciones complejas basadas en el progreso de desplazamiento de la página.

## 2. Lenis (Darkroom Engineering)
Librería para smooth scrolling ultraliviano y fluido ("smooth scroll as it should be").
- Funciona perfectamente sincronizándose con GSAP integrando el ticker de GSAP con el raf (requestAnimationFrame) de Lenis.
- Evita el scroll tosco estandar, dándole a la aplicación web un feel premium.
- En React, se utiliza el paquete especializado `lenis/react` con el componente `<ReactLenis root>`.

### Sincronización Lenis + GSAP (ScrollTrigger)
```javascript
const lenis = new Lenis()
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})
gsap.ticker.lagSmoothing(0)
```

## 3. React Three Fiber (R3F) y Drei
- **R3F**: El ecosistema para integrar la librería 3D `three.js` usando un paradigma declarativo en React. Todo lo que es un componente en Three.js se convierte en una etiqueta JSX (ej. `<mesh>`, `<ambientLight>`).
- **Drei**: Proporciona abstractions y utilidades ultra útiles (cámaras como `<PerspectiveCamera>`, controles como `<OrbitControls>`, `<ScrollControls>`, geometría avanzada, y materiales complejos como `<MeshDistortMaterial>`).
- Se debe encapsular el contenido 3D dentro del componente de `<Canvas>` expuesto por `@react-three/fiber`.

## 4. Aceternity UI
Librería de componentes altamente innovadores, modernos, y orientados a "sorprender" (WOW factor).
- Basada en Tailwind CSS (que si bien por defecto evitamos a menos que lo pidan, las animaciones y lógicas usan `framer-motion` o CSS avanzado).
- Especiales para secciones tipo Hero, tarjetas 3D animadas, grillas dinámicas (bento grids), y utilidades "Glassmorphism".
- Al construir algo premium usando Aceternity, los colores, el espacio y las microinteracciones deben estar súper pulidos, aprovechando las transiciones del mouse o el hover effects.

---

### Directrices Generales (Mantra de Diseño Premium)
1. NO a diseños aburridos o "básicos": Utiliza gradientes sutiles (mesh gradients), brillos dinámicos en los bordes, y un esquema de colores sofisticado (usualmente adaptado a glassmorphism o dark modes profundos).
2. Interacciones constantes: Cada hover, cada aparición debe ser un deleite visual sin abrumar.
3. El performance web sigue importando, usa Lenis para el scroll y deleita al usuario en cada "fold" de la pantalla integrando GSAP adecuadamente.
