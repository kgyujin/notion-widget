import React, { useState } from 'react';
import axios from 'axios';
import { Search, Loader2, BookOpen } from 'lucide-react';
import BookCard from './BookCard';
import Modal from './Modal';

export default function BookSearch({ config }) {
    const [query, setQuery] = useState('');
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [addingId, setAddingId] = useState(null);
    const [message, setMessage] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [pendingBook, setPendingBook] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setBooks([]);
        setMessage(null);

        try {
            const res = await axios.get(`/api/search?query=${encodeURIComponent(query)}`);
            setBooks(res.data);
            if (res.data.length === 0) setMessage({ type: 'info', text: '검색 결과가 없습니다.' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: '도서 검색에 실패했습니다.' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddBook = async (book, confirm = false) => {
        if (!config) return;
        setAddingId(book.isbn);

        try {
            const res = await axios.post('/api/notion', {
                notionToken: config.notionToken,
                databaseId: config.databaseId,
                propertyMap: config.propertyMap,
                book,
                confirm: confirm
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

            setMessage({ type: 'success', text: res.data.action === 'updated' ? `"${book.title}" 업데이트 완료!` : `"${book.title}" 저장 완료!` });
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.error || err.message;
            setMessage({ type: 'error', text: `저장 실패: ${errorMsg}` });
        } finally {
            setAddingId(null);
            if (!showModal) {
                setTimeout(() => setMessage(null), 3000);
            }
        }
    };

    const confirmOverwrite = () => {
        if (pendingBook) {
            setShowModal(false);
            handleAddBook(pendingBook, true);
            setPendingBook(null);
        }
    };

    const cancelOverwrite = () => {
        setShowModal(false);
        setPendingBook(null);
        setAddingId(null);
    };

    return (
        <div className="max-w-md mx-auto fade-in h-full flex flex-col">
            <form onSubmit={handleSearch} className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 pb-2 pt-0.5">
                <div className="relative group">
                    <input
                        type="text"
                        className="w-full pl-7 pr-2 py-1.5 bg-gray-50 border-none rounded-lg focus:bg-white focus:ring-1 focus:ring-primary/50 outline-none transition-all shadow-sm group-hover:shadow text-[11px]"
                        placeholder="책 제목, 저자 검색..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={12} />
                    {loading && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary">
                            <Loader2 className="animate-spin" size={20} />
                        </div>
                    )}
                </div>
            </form>

            {message && (
                <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium text-center animate-in fade-in slide-in-from-top-2 shadow-sm
          ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' :
                        message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-gray-50 text-gray-600'}`}>
                    {message.text}
                </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-2 pb-10 custom-scrollbar pr-0.5">
                {books.map((book, i) => (
                    <BookCard
                        key={book.isbn || i}
                        book={book}
                        onAdd={(b) => handleAddBook(b, false)}
                        adding={addingId === (book.isbn || i)}
                    />
                ))}
                {!loading && books.length === 0 && !message && (
                    <div className="flex flex-col items-center justify-center text-gray-300 mt-20 gap-3">
                        <BookOpen size={48} strokeWidth={1} />
                        <p className="text-sm font-light">나만의 책을 찾아보세요</p>
                    </div>
                )}
            </div>

            <Modal
                isOpen={showModal}
                onClose={cancelOverwrite}
                title="기존 도서 확인"
                footer={
                    <div className="flex gap-2 w-full justify-end">
                        <button
                            onClick={cancelOverwrite}
                            className="px-3 py-1.5 text-gray-500 hover:bg-gray-100 rounded-lg text-xs font-medium transition-colors"
                        >
                            취소
                        </button>
                        <button
                            onClick={confirmOverwrite}
                            className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold shadow-sm transition-all"
                        >
                            덮어쓰기
                        </button>
                    </div>
                }
            >
                <div className="text-gray-600 text-xs space-y-3">
                    <div>
                        <p className="text-[10px] text-gray-400 mb-0.5">입력하려는 도서</p>
                        <p className="font-bold text-gray-800 leading-tight">{pendingBook?.title} <span className="font-normal text-[10px] text-gray-500">({pendingBook?.author})</span></p>
                    </div>

                    {pendingBook?.foundTitle && (
                        <div className="pl-2 border-l-2 border-primary/20">
                            <p className="text-[10px] text-gray-400 mb-0.5">발견된 기존 도서</p>
                            <p className="font-bold text-gray-800 leading-tight">{pendingBook.foundTitle} <span className="font-normal text-[10px] text-gray-500">({pendingBook.foundAuthor})</span></p>
                        </div>
                    )}

                    <p className="text-[11px] bg-red-50 text-red-600 p-2 rounded-lg">
                        ⚠️ 제목, 저자, 표지 등 기본 정보만 업데이트됩니다.
                    </p>
                </div>
            </Modal>
        </div>
    );
}
