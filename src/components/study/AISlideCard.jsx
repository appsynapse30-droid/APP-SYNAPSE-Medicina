import { useState } from 'react'
import { Copy, Check, Bookmark, Share2, ChevronDown, ChevronUp, Layers } from 'lucide-react'
import './AISlideCard.css'

/**
 * AISlideCard — Renders an AI response as a premium "lámina" / slide card
 * 
 * Props:
 *   slideData: {
 *     title: string,
 *     subtitle: string,
 *     sections: [{
 *       icon: string (emoji),
 *       title: string,
 *       content: string,
 *       list?: string[],
 *       table?: { headers: string[], rows: string[][] },
 *       highlight?: boolean
 *     }]
 *   }
 *   onGenerateFlashcards: (slideData: object) => void (optional)
 */
export default function AISlideCard({ slideData, animationDelay = 0, onGenerateFlashcards }) {
    const [copied, setCopied] = useState(false)
    const [saved, setSaved] = useState(false)
    const [collapsed, setCollapsed] = useState(false)

    if (!slideData) return null

    const handleCopy = () => {
        const textContent = slideData.sections
            .map(s => `${s.title}\n${s.content}${s.list ? '\n' + s.list.join('\n') : ''}`)
            .join('\n\n')

        navigator.clipboard.writeText(`${slideData.title}\n${slideData.subtitle}\n\n${textContent}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleSave = () => {
        setSaved(!saved)
    }

    // Parse bold markdown (**text**) to HTML
    const renderMarkdown = (text) => {
        if (!text) return ''
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    }

    return (
        <div
            className={`ai-slide-card ${collapsed ? 'collapsed' : ''}`}
            style={{ animationDelay: `${animationDelay}ms` }}
        >
            {/* Slide Header */}
            <div className="slide-header">
                <div className="slide-header-content">
                    <div className="slide-accent-bar" />
                    <div className="slide-title-group">
                        <h3 className="slide-title">{slideData.title}</h3>
                        <span className="slide-subtitle">{slideData.subtitle}</span>
                    </div>
                </div>
                <button
                    className="slide-collapse-btn"
                    onClick={() => setCollapsed(!collapsed)}
                    title={collapsed ? 'Expandir' : 'Colapsar'}
                >
                    {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                </button>
            </div>

            {/* Slide Sections */}
            {!collapsed && (
                <div className="slide-body">
                    {slideData.sections.map((section, idx) => (
                        <div
                            key={idx}
                            className={`slide-section ${section.highlight ? 'highlight' : ''}`}
                            style={{ animationDelay: `${(idx + 1) * 100 + animationDelay}ms` }}
                        >
                            <div className="section-header">
                                <span className="section-icon">{section.icon}</span>
                                <h4 className="section-title">{section.title}</h4>
                            </div>

                            {section.content && (
                                <p
                                    className="section-content"
                                    dangerouslySetInnerHTML={{ __html: renderMarkdown(section.content) }}
                                />
                            )}

                            {section.list && (
                                <ul className="section-list">
                                    {section.list.map((item, i) => (
                                        <li
                                            key={i}
                                            dangerouslySetInnerHTML={{ __html: renderMarkdown(item) }}
                                        />
                                    ))}
                                </ul>
                            )}

                            {section.table && (
                                <div className="section-table-wrapper">
                                    <table className="section-table">
                                        <thead>
                                            <tr>
                                                {section.table.headers.map((h, i) => (
                                                    <th key={i}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {section.table.rows.map((row, i) => (
                                                <tr key={i}>
                                                    {row.map((cell, j) => (
                                                        <td key={j}>{cell}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Slide Actions */}
                    <div className="slide-actions">
                        <button
                            className={`slide-action-btn ${copied ? 'active' : ''}`}
                            onClick={handleCopy}
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            <span>{copied ? 'Copiado' : 'Copiar'}</span>
                        </button>
                        <button
                            className={`slide-action-btn ${saved ? 'active' : ''}`}
                            onClick={handleSave}
                        >
                            <Bookmark size={14} />
                            <span>{saved ? 'Guardado' : 'Guardar'}</span>
                        </button>
                        <button className="slide-action-btn">
                            <Share2 size={14} />
                            <span>Compartir</span>
                        </button>
                        {onGenerateFlashcards && (
                            <button
                                className="slide-action-btn ai-action-btn"
                                onClick={() => onGenerateFlashcards(slideData)}
                            >
                                <Layers size={14} />
                                <span>Crear Flashcards</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
