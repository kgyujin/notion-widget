import React, { useState } from 'react';
import axios from 'axios';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import RecommendCard from './RecommendCard';
import Modal from './Modal';

export default function AIRecommend({ config }) {
    const [query, setQuery] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [processingId, setProcessingId] = useState(null);
    const [message, setMessage] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [pendingBook, setPendingBook] = useState(null);

    const handleRecommend = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setRecommendations([]);
        setMessage(null);

        try {
            const res = await axios.post('/api/ai-recommend', {
                query,
                config
            });
            setRecommendations(res.data);
            if (res.data.length === 0) setMessage({ type: 'info', text: '추천 결과를 찾을 수 없습니다.' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'AI 추천 중 오류가 발생했습니다.' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddBook = async (book, confirm = false) => {
        setProcessingId(book.isbn);
        try {
            const res = await axios.post('/api/notion', {
                notionToken: config.notionToken,
                databaseId: config.databaseId,
                propertyMap: config.propertyMap,
                book,
                confirm
            });

            if (res.data.action === 'confirm_required') {
                setPendingBook({
                    ...book,
                    foundTitle: res.data.foundTitle,
                    foundAuthor: res.data.foundAuthor
                });
                setShowModal(true);
                return;
            }

            const newStatus = config.statusValUnread || 'To Read';
            updateLocalBookState(book.isbn, { existingPageId: res.data.url, currentStatus: newStatus });

            setMessage({ type: 'success', text: `"${book.title}" 저장 완료!` });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: '저장 실패' });
        } finally {
            setProcessingId(null);
        }
    };

    const updateLocalBookState = (isbn, updates) => {
        setRecommendations(prev => prev.map(b =>
            b.isbn === isbn ? { ...b, ...updates } : b
        ));
    };

    const handleUpdateStatus = async (book) => {
        if (!book.existingPageId) return;
        setProcessingId(book.isbn);

        try {
            await axios.post('/api/update-status', {
                pageId: book.existingPageId,
                statusProp: config.statusProp,
                newStatus: config.statusValReading,
                notionToken: config.notionToken
            });

            setMessage({ type: 'success', text: `"${book.title}" 읽기 시작!` });
            updateLocalBookState(book.isbn, { currentStatus: config.statusValReading });

        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: '상태 업데이트 실패' });
        } finally {
            setProcessingId(null);
        }
    };

    const confirmOverwrite = () => {
        if (pendingBook) {
            setShowModal(false);
            handleAddBook(pendingBook, true);
            setPendingBook(null);
        }
    };

    return (
        <div className="max-w-md mx-auto fade-in h-full flex flex-col">
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 pb-2 pt-0.5 px-0.5 border-b border-gray-50 mb-2">
                <form onSubmit={handleRecommend} className="relative">
                    <textarea
                        className="w-full pl-3 pr-10 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-1 focus:ring-primary/20 focus:border-primary/50 outline-none transition-all shadow-sm resize-none text-sm leading-relaxed custom-scrollbar placeholder:text-gray-400"
                        placeholder="요즘 기분이나 읽고 싶은 장르를 자유롭게 적어보세요... (예: 위로가 되는 에세이 추천해줘)"
                        rows={2}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleRecommend(e);
                            }
                        }}
                    />
                    <button
                        type="submit"
                        disabled={loading || !query.trim()}
                        className="absolute right-2 bottom-2.5 p-2 bg-primary text-white rounded-xl hover:bg-primary-hover disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} strokeWidth={2.5} />}
                    </button>
                    {!query && (
                        <div className="absolute top-3 right-3 text-primary/30 pointer-events-none animate-pulse">
                            <Sparkles size={18} />
                        </div>
                    )}
                </form>
            </div>

            {message && (
                <div className={`mx-0.5 mb-4 px-4 py-3 rounded-xl text-xs font-bold text-center animate-in fade-in slide-in-from-top-2 shadow-sm
                    ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' :
                        message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-gray-50 text-gray-600'}`}>
                    {message.text}
                </div>
            )}

            <div className="flex-1 overflow-y-auto pb-10 custom-scrollbar px-0.5">
                {recommendations.map((book, i) => {
                    const isLibrary = !!book.existingPageId;
                    const isReading = book.currentStatus === config.statusValReading;

                    return (
                        <RecommendCard
                            key={book.isbn || i}
                            book={book}
                            onAdd={(b) => handleAddBook(b)}
                            libraryInfo={isLibrary ? { status: book.currentStatus, isReading } : null}
                            onUpdateStatus={handleUpdateStatus}
                            adding={processingId === book.isbn}
                        />
                    );
                })}

                {!loading && recommendations.length === 0 && !message && (
                    <div className="flex flex-col items-center justify-center text-gray-300 mt-12 gap-4 fade-in">
                        <div className="bg-gray-50 p-6 rounded-full shadow-inner">
                            <Sparkles size={40} strokeWidth={1} className="text-gray-300" />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-sm font-medium text-gray-400">AI에게 책 추천을 받아보세요</p>
                            <p className="text-[11px] text-gray-300">"우울할 때 읽기 좋은 책"<br />"성장을 위한 자기계발서"</p>
                        </div>
                    </div>
                )}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="기존 도서 확인" footer={<div className="flex gap-2 w-full justify-end"><button onClick={() => setShowModal(false)} className="px-3 py-1.5 text-gray-500 hover:bg-gray-100 rounded-lg text-xs font-medium">취소</button><button onClick={confirmOverwrite} className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold">덮어쓰기</button></div>}>
                <div className="text-gray-600 text-xs">이미 서재에 비슷한 책이 있습니다. 덮어쓰시겠습니까?</div>
            </Modal>
        </div>
    );
}
