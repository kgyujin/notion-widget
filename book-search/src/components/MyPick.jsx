import React, { useState } from 'react';
import axios from 'axios';
import { BookOpen, RefreshCw, Play } from 'lucide-react';

export default function MyPick({ config }) {
    const [pickedBook, setPickedBook] = useState(null);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);

    const pickBook = async () => {
        setLoading(true);
        setError(null);
        setPickedBook(null);
        try {
            const res = await axios.post('/api/my-pick', {
                databaseId: config.databaseId,
                config
            });

            if (res.data.empty) {
                setError(res.data.message);
            } else {
                setPickedBook(res.data.book);
            }
        } catch (err) {
            console.error(err);
            setError('추천을 가져오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const startReading = async () => {
        if (!pickedBook) return;
        setUpdating(true);
        try {
            await axios.post('/api/update-status', {
                pageId: pickedBook.id,
                statusProp: config.statusProp,
                newStatus: config.statusValReading,
                notionToken: config.notionToken
            });

            setPickedBook(prev => ({ ...prev, status: config.statusValReading }));

        } catch (err) {
            console.error(err);
            alert("상태 업데이트 실패");
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="max-w-md mx-auto fade-in h-full flex flex-col items-center justify-center pb-20 px-4">

            {!pickedBook && !loading && !error && (
                <div className="text-center space-y-6">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                        <BookOpen size={64} className="relative text-primary" strokeWidth={1} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">어떤 책을 읽을지 고민되시나요?</h2>
                        <p className="text-xs text-gray-500 mt-1">서재에 있는 '읽지 않은 책' 중 하나를 골라드릴게요.</p>
                    </div>
                    <button
                        onClick={pickBook}
                        className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
                    >
                        <RefreshCw size={18} />
                        <span>책 골라주세요!</span>
                    </button>
                </div>
            )}

            {loading && (
                <div className="flex flex-col items-center gap-3">
                    <RefreshCw size={32} className="animate-spin text-primary" />
                    <p className="text-xs text-gray-500 animate-pulse">서재를 둘러보는 중...</p>
                </div>
            )}

            {error && (
                <div className="text-center space-y-4">
                    <p className="text-sm font-bold text-gray-800">앗!</p>
                    <p className="text-xs text-gray-500">{error}</p>
                    <button onClick={pickBook} className="text-primary text-xs font-bold hover:underline">다시 시도하기</button>
                </div>
            )}

            {pickedBook && (
                <div className="w-full animate-in zoom-in-50 duration-300">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative">
                        <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-center py-8">
                            {pickedBook.cover ? (
                                <img src={pickedBook.cover} className="h-40 rounded-lg shadow-md object-cover transform transition-transform hover:scale-105" alt="cover" />
                            ) : (
                                <div className="h-40 w-28 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                                    <BookOpen size={32} />
                                </div>
                            )}
                        </div>
                        <div className="p-5 text-center space-y-1">
                            <div className="text-[10px] text-primary font-bold uppercase tracking-wider mb-2">Today's Pick</div>
                            <h3 className="text-lg font-bold text-gray-800 leading-tight">{pickedBook.title}</h3>
                            <p className="text-xs text-gray-500">{pickedBook.author}</p>

                            <div className="pt-6 flex gap-2 justify-center">
                                <button
                                    onClick={pickBook}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-1.5"
                                >
                                    <RefreshCw size={14} /> 다른 책
                                </button>

                                {pickedBook.status === config.statusValReading ? (
                                    <button disabled className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-green-500 cursor-default flex items-center gap-1.5">
                                        <BookOpen size={14} /> 읽는 중
                                    </button>
                                ) : (
                                    <button
                                        onClick={startReading}
                                        disabled={updating}
                                        className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-1.5"
                                    >
                                        {updating ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Play size={14} fill="currentColor" />}
                                        바로 읽기
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
