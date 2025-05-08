import React from "react";
import { motion } from "framer-motion";
import { scaleIn, hoverRotate, textReveal, cardHover } from "@/lib/animations";

const WorkStep = ({ number, icon, title, description }) => (
  <motion.div 
    className="flex flex-col items-center text-center max-w-xs relative"
    variants={scaleIn}
    initial="initial"
    whileInView="animate"
    viewport={{ once: true }}
  >
    <motion.div 
      className="relative"
      variants={cardHover}
      whileHover="hover"
    >
      <motion.div 
        className="bg-gradient-to-br from-primary to-primary/80 h-16 w-16 rounded-full flex items-center justify-center mb-4 relative overflow-hidden"
        whileHover="hover"
        variants={{
          hover: {
            scale: 1.1,
            transition: {
              duration: 0.3,
              ease: "easeInOut"
            }
          }
        }}
      >
        <motion.div
          className="absolute inset-0 bg-white/20"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          variants={hoverRotate}
          whileHover="hover"
        >
          {icon}
        </motion.div>
      </motion.div>
      <motion.div 
        className="absolute -top-3 -right-3 bg-white h-8 w-8 rounded-full shadow-lg flex items-center justify-center text-sm font-bold text-primary border-2 border-primary"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ 
          scale: 1, 
          rotate: 0,
          transition: {
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2
          }
        }}
        whileHover={{
          scale: 1.1,
          rotate: 360,
          transition: {
            duration: 0.5,
            ease: "easeInOut"
          }
        }}
      >
        {number}
      </motion.div>
    </motion.div>
    <motion.h3 
      className="text-xl font-semibold mb-2 text-primary"
      variants={textReveal}
    >
      {title}
    </motion.h3>
    <motion.p 
      className="text-gray-600"
      variants={textReveal}
      transition={{ delay: 0.2 }}
    >
      {description}
    </motion.p>
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg"
      whileHover={{ opacity: 1 }}
    />
  </motion.div>
);

export default WorkStep;
