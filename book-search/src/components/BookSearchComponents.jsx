import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

export const SearchBar = ({ onSearch, isLoading }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 w-full">
            <div className="relative w-full">
                <input
                    type="text"
                    className="w-full p-3 pl-10 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    placeholder="Search for a book..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            </div>
            <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-[var(--primary-color)] text-white rounded font-bold hover:opacity-90 disabled:opacity-50 min-w=[80px]"
            >
                {isLoading ? <Loader2 className="animate-spin" /> : 'Search'}
            </button>
        </form>
    );
};

export const BookCard = ({ book, onSelect }) => {
    return (
        <div
            className="book-card p-3 border rounded hover:shadow-lg hover:border-[var(--primary-color)] cursor-pointer transition-all bg-white flex flex-col items-center text-center h-full"
            onClick={() => onSelect(book)}
        >
            <div className="w-full h-40 mb-2 flex items-center justify-center overflow-hidden rounded bg-gray-50">
                {book.cover ? (
                    <img src={book.cover} alt={book.title} className="max-h-full object-contain" />
                ) : (
                    <div className="text-gray-300">No Image</div>
                )}
            </div>
            <h3 className="font-bold text-sm line-clamp-2 mb-1" title={book.title}>{book.title}</h3>
            <p className="text-xs text-gray-500 line-clamp-1">{book.author}</p>
        </div>
    );
};

export const BookList = ({ books, onSelect }) => {
    if (!books || books.length === 0) return null;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {books.map((book) => (
                <BookCard key={book.itemId} book={book} onSelect={onSelect} />
            ))}
        </div>
    );
};
