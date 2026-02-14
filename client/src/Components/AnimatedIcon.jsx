import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AnimatedIcon = ({
    icon: Icon,
    size = 24,
    color = "currentColor",
    className = "",
    onClick,
    badge
}) => {
    return (
        <motion.div
            className={`relative inline-flex items-center justify-center ${className}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            onClick={onClick}
        >
            <Icon size={size} color={color} strokeWidth={2} />

            {/* Optional Badge for things like cart count */}
            <AnimatePresence>
                {badge !== undefined && badge !== null && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-2 -right-2 bg-[#42cbf5] text-black text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-white shadow-sm"
                    >
                        {badge}
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AnimatedIcon;
