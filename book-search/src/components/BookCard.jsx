import React from 'react';
import { Plus, Book, Check } from 'lucide-react';

export default function BookCard({ book, onAdd, adding }) {
    return (
        <div
            className="group relative flex bg-white border border-transparent hover:border-primary/30 rounded-xl p-2 shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-300 cursor-default"
        >
            {/* Cover Image */}
            <div className="w-[50px] h-[72px] flex-shrink-0 bg-gray-50 rounded-md overflow-hidden shadow-sm relative mr-3">
                {book.cover ? (
                    <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100">
                        <Book size={16} />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                    <h3 className="font-bold text-gray-800 text-[13px] leading-tight mb-0.5 line-clamp-2" title={book.title}>
                        {book.title}
                    </h3>
                    <p className="text-[11px] text-gray-500 truncate">{book.author}</p>
                </div>

                <div className="flex justify-between items-end mt-1 gap-2">
                    <div className="flex gap-1 overflow-hidden">
                        <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded truncate max-w-[60px]">
                            {book.publisher}
                        </span>
                        {book.categoryName && (
                            <span className="text-[10px] text-primary bg-primary/5 px-1.5 py-0.5 rounded truncate max-w-[80px]">
                                {book.categoryName}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={() => !adding && onAdd(book)}
                        disabled={adding}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold transition-all
                    ${adding
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-primary/10 text-primary hover:bg-primary hover:text-white active:scale-95 shadow-sm'
                            }`
                        }
                    >
                        {adding ? (
                            <div className="w-2.5 h-2.5 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                        ) : (
                            <>
                                <Plus size={12} strokeWidth={3} /> 추가
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
