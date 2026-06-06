import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Button from './Button';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md', // sm, md, lg, xl
  footer = null
}) => {
  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Content Wrapper */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`w-full ${sizes[size]} bg-zinc-950 border border-zinc-800 shadow-[0_10px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(6,182,212,0.05)] rounded-xl overflow-hidden relative z-10 flex flex-col`}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-zinc-900/60 flex items-center justify-between">
              <h3 className="text-base font-semibold text-zinc-100">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 hover:bg-zinc-900/60 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-5 overflow-y-auto max-h-[75vh]">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-5 py-3.5 border-t border-zinc-900/60 flex items-center justify-end gap-3 bg-zinc-950">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
