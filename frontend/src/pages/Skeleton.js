
import { motion } from "framer-motion";

export const Skeleton = ({ className = "", height = 16, width = 200, rounded = 8 }) => (
    <motion.div
    initial={{ backgroundPosition: "200% 0" }} // start from right
    animate={{ backgroundPosition: "0% 0" }}   // move to left
    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
    className={className}
    style={{
      height,
      width,
      borderRadius: rounded,
      background: "linear-gradient(90deg, rgba(0,0,0,0.18) 35%, rgba(0,0,0,0.22) 50%, rgba(0,0,0,0.18) 65%)",
      backgroundSize: "200% 100%",
    }}
    aria-busy="true"
    aria-live="polite"
  />

)