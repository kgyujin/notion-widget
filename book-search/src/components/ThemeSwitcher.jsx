import React from 'react';

const themes = [
    { name: 'original', color: '#82d6bf' },
    { name: 'pink', color: '#ff9cb1' },
    { name: 'blue', color: '#82b1ff' },
    { name: 'purple', color: '#b39ddb' },
    { name: 'gray', color: '#b0bec5' },
];

const ThemeSwitcher = ({ currentTheme, onThemeChange }) => {
    return (
        <div className="flex gap-2">
            {themes.map((theme) => (
                <button
                    key={theme.name}
                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${currentTheme === theme.name ? 'border-gray-600 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: theme.color }}
                    onClick={() => onThemeChange(theme.name)}
                    title={theme.name}
                />
            ))}
        </div>
    );
};

export default ThemeSwitcher;
