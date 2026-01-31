import React from 'react';
import { Plus, Book, BookOpen, Play } from 'lucide-react';

export default function BookCard({ book, onAdd, adding, libraryInfo, onUpdateStatus }) {
    const isReading = libraryInfo?.isReading;
    const isLibrary = !!libraryInfo;

    return (
        <div
            className={`group relative flex bg-white border rounded-xl p-2 shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-300 cursor-default
            ${isReading ? 'border-primary/50 bg-primary/5' : 'border-transparent hover:border-primary/30'}`}
        >
            <div className="w-[50px] h-[72px] flex-shrink-0 bg-gray-50 rounded-md overflow-hidden shadow-sm relative mr-3">
                {book.cover ? (
                    <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100">
                        <Book size={16} />
                    </div>
                )}
                {isLibrary && (
                    <div className="absolute top-0 right-0 bg-primary text-white text-[9px] px-1 py-0.5 rounded-bl-md font-bold shadow-sm">
                        {libraryInfo.status || '서재'}
                    </div>
                )}
            </div>

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

                    {isLibrary ? (
                        <button
                            onClick={() => !isReading && !adding && onUpdateStatus(book)}
                            disabled={isReading || adding}
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold transition-all
                            ${isReading
                                    ? 'bg-primary text-white cursor-default'
                                    : 'bg-green-50 text-green-600 hover:bg-green-100 active:scale-95 border border-green-100'
                                }`}
                        >
                            {adding ? (
                                <div className="w-2.5 h-2.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : isReading ? (
                                <><BookOpen size={12} strokeWidth={2.5} /> 읽는 중</>
                            ) : (
                                <><Play size={10} fill="currentColor" /> 읽기 시작</>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={() => !adding && onAdd(book)}
                            disabled={adding}
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold transition-all
                            ${adding
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-primary/10 text-primary hover:bg-primary hover:text-white active:scale-95 shadow-sm'
                                }`}
                        >
                            {adding ? (
                                <div className="w-2.5 h-2.5 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                            ) : (
                                <><Plus size={12} strokeWidth={3} /> 추가</>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
