import React, { useState } from 'react';
import { Plus, BookOpen, Play, ChevronDown, ChevronUp } from 'lucide-react';

export default function RecommendCard({ book, onAdd, adding, libraryInfo, onUpdateStatus }) {
    const [showDesc, setShowDesc] = useState(false);
    const isReading = libraryInfo?.isReading;
    const isLibrary = !!libraryInfo;

    return (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] mb-3">
            <div className="bg-primary/5 px-4 py-3 border-b border-primary/10">
                <div className="flex gap-2 items-start">
                    <span className="text-xl">💬</span>
                    <p className="text-sm text-gray-700 leading-snug font-medium italic">
                        "{book.reason}"
                    </p>
                </div>
            </div>

            <div className="p-4 flex gap-4">
                <div className="w-[70px] flex-shrink-0">
                    <div className="aspect-[1/1.5] bg-gray-100 rounded-lg overflow-hidden shadow-sm relative">
                        {book.cover ? (
                            <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <span className="text-xs">No Image</span>
                            </div>
                        )}
                        {isLibrary && (
                            <div className="absolute top-0 right-0 bg-primary/90 text-white text-[9px] px-1.5 py-0.5 rounded-bl-lg font-bold backdrop-blur-sm">
                                {libraryInfo.status || '서재'}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                        <h3 className="font-bold text-gray-800 text-[15px] leading-tight mb-1 break-keep">
                            {book.title}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2 truncate">
                            {book.author} · {book.publisher}
                        </p>

                        <div className="flex flex-wrap gap-1 mb-3">
                            {book.categoryName && (
                                <span className="inline-block px-2 py-0.5 bg-gray-50 text-gray-500 text-[10px] rounded-md border border-gray-100 truncate max-w-full">
                                    {book.categoryName}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {isLibrary ? (
                            <button
                                onClick={() => !isReading && !adding && onUpdateStatus(book)}
                                disabled={isReading || adding}
                                className={`flex-1 h-9 flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all
                                ${isReading
                                        ? 'bg-gray-100 text-gray-400 cursor-default'
                                        : 'bg-primary text-white hover:bg-primary-hover active:scale-95 shadow-sm shadow-primary/20'
                                    }`}
                            >
                                {adding ? (
                                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : isReading ? (
                                    <><BookOpen size={14} /> 읽는 중</>
                                ) : (
                                    <><Play size={14} fill="currentColor" /> 바로 읽기</>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={() => !adding && onAdd(book)}
                                disabled={adding}
                                className={`flex-1 h-9 flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all
                                ${adding
                                        ? 'bg-gray-100 text-gray-400 cursor-wait'
                                        : 'bg-black text-white hover:bg-gray-800 active:scale-95 shadow-sm'
                                    }`}
                            >
                                {adding ? (
                                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <><Plus size={14} strokeWidth={3} /> 서재에 추가</>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {book.description && (
                <div className="px-4 pb-3">
                    <button
                        onClick={() => setShowDesc(!showDesc)}
                        className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 font-medium mb-1 transition-colors"
                    >
                        {showDesc ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        줄거리 {showDesc ? '접기' : '더보기'}
                    </button>
                    <div className={`text-xs text-gray-600 bg-gray-50 rounded-lg p-2.5 leading-relaxed transition-all duration-300 ease-in-out origin-top
                        ${showDesc ? 'opacity-100 max-h-[500px]' : 'opacity-0 max-h-0 py-0 overflow-hidden'}`}>
                        {book.description}
                    </div>
                </div>
            )}
        </div>
    );
}
