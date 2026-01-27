import { ReactElement } from 'react';

interface TomlViewerProps {
    content: string;
}

export const TomlViewer = ({ content }: TomlViewerProps): ReactElement => {
    const escapeHtml = (str: string): string => {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    const highlightToml = (tomlString: string): ReactElement => {
        // First escape HTML to prevent XSS and rendering issues
        const escaped = escapeHtml(tomlString);

        // Syntax highlighting for TOML with dark-mode-friendly colors
        const highlighted = escaped
            // Tables [section] and [[array.of.tables]]
            .replace(/^(\[{1,2}[^\]]+\]{1,2})/gm, '<span class="text-violet-400">$1</span>')
            // Comments (must be before keys to avoid conflicts)
            .replace(/(#.*$)/gm, '<span class="text-slate-500 italic">$1</span>')
            // Keys (before =)
            .replace(/^(\s*)([a-zA-Z0-9_.-]+)(\s*=)/gm, '$1<span class="text-sky-400">$2</span>$3')
            // String values (double and single quoted) - using escaped quotes
            .replace(/=(\s*)(&quot;[^&]*&quot;|&#039;[^&]*&#039;)/g, '=$1<span class="text-emerald-400">$2</span>')
            // Booleans
            .replace(/=(\s*)(true|false)(\s*)$/gm, '=$1<span class="text-violet-400">$2</span>$3')
            // Numbers (integers and floats)
            .replace(/=(\s*)(-?\d+\.?\d*(?:e[+-]?\d+)?)(\s*)$/gm, '=$1<span class="text-amber-400">$2</span>$3');

        return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
    };

    return (
        <pre className="text-sm font-mono leading-relaxed">
            <code className="language-toml">{highlightToml(content)}</code>
        </pre>
    );
};
