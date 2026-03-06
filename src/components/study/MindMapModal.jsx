import { useState, useCallback, useEffect } from 'react'
import { ReactFlow, Controls, Background, applyNodeChanges, applyEdgeChanges, Panel, useReactFlow, ReactFlowProvider } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { X, Network, Wand2, Lightbulb, Focus, BrainCircuit, Maximize2 } from 'lucide-react'
import './MindMapModal.css'

// Custom node component for premium styling
const CustomNode = ({ data, selected }) => {
    return (
        <div className={`mindmap-node ${selected ? 'selected' : ''} type-${data.type || 'default'}`}>
            <div className="node-icon">{data.icon || '🧠'}</div>
            <div className="node-content">
                <div className="node-title">{data.label}</div>
                {data.desc && <div className="node-desc">{data.desc}</div>}
            </div>
        </div>
    )
}

const nodeTypes = {
    custom: CustomNode
}

function MindMapFlow({ topic, onClose }) {
    const [nodes, setNodes] = useState([])
    const [edges, setEdges] = useState([])
    const [isGenerating, setIsGenerating] = useState(true)
    const { fitView } = useReactFlow()

    // Generate Mock Map Data
    useEffect(() => {
        setIsGenerating(true)

        // Simulate AI generation time
        const timer = setTimeout(() => {
            const rootLabel = topic || 'Fisiopatología General'

            const initialNodes = [
                { id: '1', type: 'custom', position: { x: 400, y: 100 }, data: { label: rootLabel, icon: '🌟', type: 'root' } },
                { id: '2', type: 'custom', position: { x: 200, y: 250 }, data: { label: 'Etiología', icon: '🧬', desc: 'Causas principales' } },
                { id: '3', type: 'custom', position: { x: 600, y: 250 }, data: { label: 'Cuadro Clínico', icon: '🩺', desc: 'Signos y síntomas' } },
                { id: '4', type: 'custom', position: { x: 400, y: 400 }, data: { label: 'Diagnóstico', icon: '📊', desc: 'Labs e Imagen' } },
                { id: '5', type: 'custom', position: { x: 200, y: 550 }, data: { label: 'Tratamiento', icon: '💊', desc: 'Fármacos de elección' } },
                { id: '6', type: 'custom', position: { x: 800, y: 200 }, data: { label: 'Complicaciones', icon: '⚠️', type: 'warning' } }
            ]

            const initialEdges = [
                { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
                { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#39d5ff', strokeWidth: 2 } },
                { id: 'e1-4', source: '1', target: '4', animated: true, style: { stroke: '#3fb950', strokeWidth: 2 } },
                { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: '#f7c948', strokeWidth: 2 } },
                { id: 'e3-6', source: '3', target: '6', animated: true, style: { stroke: '#f85149', strokeWidth: 2 } }
            ]

            setNodes(initialNodes)
            setEdges(initialEdges)
            setIsGenerating(false)

            setTimeout(() => {
                fitView({ duration: 800, padding: 0.2 })
            }, 50)
        }, 3000)

        return () => clearTimeout(timer)
    }, [topic, fitView])

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    )
    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    )

    const expandNode = () => {
        // Mock function to add child nodes recursively
        alert('En un entorno real, la IA generaría sub-nodos dinámicamente para expandir este concepto.')
    }

    return (
        <div className="mindmap-wrapper">
            {isGenerating && (
                <div className="mm-generator-overlay">
                    <div className="mm-brain-animation">
                        <Network size={64} className="network-pulse" />
                        <BrainCircuit size={32} className="circuit-orbit" />
                    </div>
                    <h4>Construyendo mapa conceptual...</h4>
                    <p>Mapeando relaciones semánticas sobre {topic}</p>
                </div>
            )}

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                className="synapse-flow-theme"
            >
                <Background color="#ffffff" gap={20} size={1} opacity={0.05} />
                <Controls showInteractive={false} className="mm-controls" />

                <Panel position="top-right" className="mm-panel">
                    <button className="mm-icon-btn close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                    <div className="mm-divider" />
                    <button className="mm-icon-btn action-btn text-tooltip" data-tooltip="Centrar">
                        <Focus size={18} onClick={() => fitView({ duration: 800 })} />
                    </button>
                    <button className="mm-icon-btn action-btn text-tooltip" data-tooltip="Expandir Nodo AI" onClick={expandNode}>
                        <Wand2 size={18} />
                    </button>
                    <button className="mm-icon-btn action-btn text-tooltip" data-tooltip="Generar Flashcards">
                        <Lightbulb size={18} />
                    </button>
                </Panel>
            </ReactFlow>
        </div>
    )
}

export default function MindMapModal({ isOpen, onClose, topic }) {
    if (!isOpen) return null

    return (
        <div className="mm-modal-overlay">
            <div className="mm-modal-content">
                <ReactFlowProvider>
                    <MindMapFlow topic={topic} onClose={onClose} />
                </ReactFlowProvider>
            </div>
        </div>
    )
}
