import { ReactElement } from 'react';

interface JsonViewerProps {
    content: string;
}

export const JsonViewer = ({ content }: JsonViewerProps) => {
    const highlightJson = (jsonString: string): ReactElement => {
        try {
            const parsed = JSON.parse(jsonString);
            const formatted = JSON.stringify(parsed, null, 2);

            // Syntax highlighting with softer, dark-mode-friendly colors
            const highlighted = formatted
                .replace(/(".*?"):/g, '<span class="text-sky-400/80">$1</span>:')
                .replace(/: (".*?")/g, ': <span class="text-emerald-400/80">$1</span>')
                .replace(/: (\d+\.?\d*)/g, ': <span class="text-amber-400/80">$1</span>')
                .replace(/: (true|false)/g, ': <span class="text-violet-400/80">$1</span>')
                .replace(/: (null)/g, ': <span class="text-slate-500">$1</span>');

            return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
        } catch (e) {
            // If parsing fails, return plain text
            return <>{content}</>;
        }
    };

    return (
        <pre className="text-sm font-mono leading-relaxed">
            <code className="language-json">{highlightJson(content)}</code>
        </pre>
    );
};
