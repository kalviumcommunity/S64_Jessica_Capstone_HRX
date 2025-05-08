import { cubicBezier } from "framer-motion";

// Advanced animation variants
export const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: cubicBezier(0.4, 0, 0.2, 1)
    }
  }
};

export const fadeInDown = {
  initial: { opacity: 0, y: -60 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: cubicBezier(0.4, 0, 0.2, 1)
    }
  }
};

export const fadeInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.8,
      ease: cubicBezier(0.4, 0, 0.2, 1)
    }
  }
};

export const fadeInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.8,
      ease: cubicBezier(0.4, 0, 0.2, 1)
    }
  }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.8,
      ease: cubicBezier(0.4, 0, 0.2, 1)
    }
  }
};

export const rotateIn = {
  initial: { opacity: 0, rotate: -180 },
  animate: { 
    opacity: 1, 
    rotate: 0,
    transition: {
      duration: 1,
      ease: cubicBezier(0.4, 0, 0.2, 1)
    }
  }
};

// Stagger container variants
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

// Hover animations
export const hoverScale = {
  scale: 1.05,
  transition: {
    duration: 0.3,
    ease: cubicBezier(0.4, 0, 0.2, 1)
  }
};

export const hoverRotate = {
  rotate: 360,
  transition: {
    duration: 0.5,
    ease: cubicBezier(0.4, 0, 0.2, 1)
  }
};

export const hoverBounce = {
  y: -5,
  transition: {
    duration: 0.3,
    ease: cubicBezier(0.4, 0, 0.2, 1)
  }
};

// Page transition variants
export const pageTransition = {
  initial: { 
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  animate: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: cubicBezier(0.4, 0, 0.2, 1)
    }
  },
  exit: { 
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: cubicBezier(0.4, 0, 0.2, 1)
    }
  }
};

// Scroll animations
export const scrollReveal = {
  initial: { 
    opacity: 0,
    y: 60
  },
  whileInView: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: cubicBezier(0.4, 0, 0.2, 1)
    }
  },
  viewport: { once: true }
};

// Text reveal animation
export const textReveal = {
  initial: { 
    opacity: 0,
    y: 20
  },
  animate: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: cubicBezier(0.4, 0, 0.2, 1)
    }
  }
};

// Card hover animations
export const cardHover = {
  initial: { scale: 1 },
  hover: {
    scale: 1.02,
    y: -5,
    transition: {
      duration: 0.3,
      ease: cubicBezier(0.4, 0, 0.2, 1)
    }
  }
};

// Button hover animations
export const buttonHover = {
  initial: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: cubicBezier(0.4, 0, 0.2, 1)
    }
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: cubicBezier(0.4, 0, 0.2, 1)
    }
  }
};

// List item animations
export const listItem = {
  initial: { opacity: 0, x: -20 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.5,
      ease: cubicBezier(0.4, 0, 0.2, 1)
    }
  }
};

// Loading spinner animation
export const spinnerAnimation = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// Notification animation
export const notificationAnimation = {
  initial: { 
    opacity: 0,
    y: 50,
    scale: 0.8
  },
  animate: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: cubicBezier(0.4, 0, 0.2, 1)
    }
  },
  exit: { 
    opacity: 0,
    y: 50,
    scale: 0.8,
    transition: {
      duration: 0.3,
      ease: cubicBezier(0.4, 0, 0.2, 1)
    }
  }
}; 