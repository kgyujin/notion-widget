import React from 'react';
import { X, AlertCircle } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, footer }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-[90%] max-w-[320px] max-h-[85vh] flex flex-col overflow-hidden ring-1 ring-black/5 scale-100 animate-in zoom-in-95 duration-200">

                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
                    <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="px-4 py-3 overflow-y-auto custom-scrollbar">
                    {children}
                </div>

                {footer && (
                    <div className="px-4 py-3 bg-gray-50/50 flex gap-2 justify-end items-center shrink-0 border-t border-gray-50">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
