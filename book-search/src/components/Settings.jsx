import React, { useState } from 'react';
import { Save, Check, Info, HelpCircle } from 'lucide-react';

const THEMES = [
    { id: 'default', color: '#82d6bf', name: '민트 (기본)' },
    { id: 'pink', color: '#ff8ba0', name: '핑크' },
    { id: 'blue', color: '#7abaff', name: '블루' },
    { id: 'purple', color: '#a48eff', name: '퍼플' },
    { id: 'gray', color: '#6b7280', name: '그레이' }
];

export default function Settings({ initialConfig, onSave, currentTheme, onThemeChange }) {
    const [formData, setFormData] = useState(initialConfig || {
        notionToken: '',
        databaseId: '',
        propertyMap: { title: '제목', author: '지은이', publisher: '출판사', category: '장르', cover: '책 표지' },
        statusProp: 'Status',
        statusValUnread: 'To Read',
        statusValReading: 'Reading'
    });
    const [showHelp, setShowHelp] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMapChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            propertyMap: { ...prev.propertyMap, [name]: value }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="max-w-md mx-auto fade-in h-full overflow-y-auto custom-scrollbar pr-1 pb-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold tracking-tight">설정</h2>
                <button
                    onClick={() => setShowHelp(!showHelp)}
                    className="text-[10px] flex items-center gap-1 text-gray-500 hover:text-primary transition-colors bg-gray-50 px-2 py-1 rounded-full"
                >
                    <HelpCircle size={12} />
                    {showHelp ? '닫기' : '도움말'}
                </button>
            </div>

            {showHelp && (
                <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm text-gray-600 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Info size={16} className="text-primary" /> Notion 연결 방법
                    </h3>
                    <ol className="list-decimal list-inside space-y-1 ml-1 text-xs">
                        <li><a href="https://www.notion.so/my-integrations" target="_blank" className="underline text-primary">Notion 내 통합</a> 페이지에서 새 통합을 만드세요.</li>
                        <li><strong>시크릿 토큰</strong>을 복사해두세요.</li>
                        <li>책을 저장할 Notion 데이터베이스 페이지로 가세요.</li>
                        <li>우측 상단 <strong>...</strong> → 연결(Connect) → 통합 선택 및 추가.</li>
                        <li>URL에서 <strong>데이터베이스 ID</strong>를 복사하세요.</li>
                    </ol>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg text-xs mt-2">
                        ℹ️ Notion 페이지에서 <strong>/embed</strong> (임베드)를 입력하여 위젯 주소를 넣으면 더 예쁘게 쓸 수 있어요!
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 mb-2">
                <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">테마</h3>
                <div className="flex gap-2 justify-center">
                    {THEMES.map(t => (
                        <button
                            key={t.id}
                            onClick={() => onThemeChange(t.id)}
                            className={`group relative w-6 h-6 rounded-full transition-all duration-300 ${currentTheme === t.id ? 'scale-110 shadow ring-1 ring-offset-1 ring-gray-200' : 'hover:scale-105'}`}
                            style={{ backgroundColor: t.color }}
                            title={t.name}
                        >
                            {currentTheme === t.id && (
                                <span className="absolute inset-0 flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white drop-shadow-sm" strokeWidth={3} />
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 space-y-2">
                    <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">연결 정보</h3>

                    <div className="group">
                        <input
                            type="password"
                            name="notionToken"
                            value={formData.notionToken}
                            onChange={handleChange}
                            placeholder="Notion Token"
                            className="w-full px-2 py-1 bg-gray-50 border border-transparent rounded focus:bg-white focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-300 text-[10px]"
                            required
                        />
                    </div>

                    <div className="group">
                        <input
                            type="text"
                            name="databaseId"
                            value={formData.databaseId}
                            onChange={handleChange}
                            placeholder="Database ID"
                            className="w-full px-2 py-1 bg-gray-50 border border-transparent rounded focus:bg-white focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-300 text-[10px]"
                            required
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">속성 매핑 (기본)</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        {[
                            { label: '책 제목', name: 'title', ph: '제목' },
                            { label: '저자', name: 'author', ph: '지은이' },
                            { label: '출판사', name: 'publisher', ph: '출판사' },
                            { label: '장르', name: 'category', ph: '장르' },
                            { label: '표지', name: 'cover', ph: '표지' },
                        ].map((field) => (
                            <div key={field.name} className="flex items-center gap-2">
                                <label className="w-16 text-[11px] font-medium text-gray-500 text-right">{field.label}</label>
                                <input
                                    type="text"
                                    name={field.name}
                                    value={formData.propertyMap[field.name]}
                                    onChange={handleMapChange}
                                    placeholder={field.ph}
                                    className="flex-1 px-3 py-1.5 bg-gray-50 border border-transparent rounded focus:bg-white focus:border-primary outline-none text-xs transition-colors"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                            상태 매핑 <span className="text-[9px] font-normal text-gray-300 normal-case">(AI/내 서재 추천용)</span>
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center gap-2">
                            <label className="w-16 text-[11px] font-medium text-gray-500 text-right">상태 속성명</label>
                            <input
                                type="text"
                                name="statusProp"
                                value={formData.statusProp || ''}
                                onChange={handleChange}
                                placeholder="예: Status, 상태"
                                className="flex-1 px-3 py-1.5 bg-gray-50 border border-transparent rounded focus:bg-white focus:border-primary outline-none text-xs transition-colors"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="w-16 text-[11px] font-medium text-gray-500 text-right">읽지 않음</label>
                            <input
                                type="text"
                                name="statusValUnread"
                                value={formData.statusValUnread || ''}
                                onChange={handleChange}
                                placeholder="예: To Read, 읽을 예정"
                                className="flex-1 px-3 py-1.5 bg-gray-50 border border-transparent rounded focus:bg-white focus:border-primary outline-none text-xs transition-colors"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="w-16 text-[11px] font-medium text-gray-500 text-right">읽는 중</label>
                            <input
                                type="text"
                                name="statusValReading"
                                value={formData.statusValReading || ''}
                                onChange={handleChange}
                                placeholder="예: Reading, 읽는 중"
                                className="flex-1 px-3 py-1.5 bg-gray-50 border border-transparent rounded focus:bg-white focus:border-primary outline-none text-xs transition-colors"
                            />
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-[10px] text-gray-400 mb-4 max-w-xs mx-auto">
                        🔒 모든 정보는 브라우저(LocalStorage)에만 안전하게 저장됩니다.
                    </p>
                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-[0.98] mb-3"
                    >
                        <Save size={18} strokeWidth={2.5} />
                        <span>설정 저장하기</span>
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                const url = window.location.origin + window.location.pathname;
                                navigator.clipboard.writeText(url);
                                alert('기본 위젯 주소가 복사되었습니다.\n(설정이 브라우저에 저장된 기기에서만 작동합니다)');
                            }}
                            className="bg-white border text-gray-500 font-bold py-3 rounded-xl text-[11px] hover:bg-gray-50 transition-colors"
                        >
                            🔗 기본 주소 복사
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                if (!formData.notionToken || !formData.databaseId) {
                                    alert('설정을 먼저 입력해주세요.');
                                    return;
                                }
                                const json = JSON.stringify(formData);
                                const encoded = btoa(encodeURIComponent(json));
                                const url = `${window.location.origin}${window.location.pathname}?config=${encoded}`;
                                navigator.clipboard.writeText(url);
                                alert('🔐 설정이 포함된 주소가 복사되었습니다!\n이 주소를 Notion에 임베드하면 어디서든 바로 사용할 수 있습니다.\n(주의: 이 주소는 타인에게 공유하지 마세요.)');
                            }}
                            className="bg-primary/10 text-primary font-bold py-3 rounded-xl text-[11px] hover:bg-primary/20 transition-colors"
                        >
                            🌍 어디서나 연동 (추천)
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
