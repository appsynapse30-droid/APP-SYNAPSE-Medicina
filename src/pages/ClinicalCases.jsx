import { useState } from 'react'
import { useClinicalCases } from '../context/ClinicalCasesContext'
import CasesLibrary from '../components/cases/CasesLibrary'
import CaseForm from '../components/cases/CaseForm'
import CaseDetail from '../components/cases/CaseDetail'
import CaseStudyMode from '../components/cases/CaseStudyMode'
import './ClinicalCases.css'

// Vistas disponibles
const VIEWS = {
    LIBRARY: 'library',
    FORM: 'form',
    DETAIL: 'detail',
    STUDY: 'study',
}

export default function ClinicalCases() {
    const { cases } = useClinicalCases()
    const [currentView, setCurrentView] = useState(VIEWS.LIBRARY)
    const [selectedCaseId, setSelectedCaseId] = useState(null)
    const [editingCaseId, setEditingCaseId] = useState(null)

    // Navegación
    const goToLibrary = () => {
        setCurrentView(VIEWS.LIBRARY)
        setSelectedCaseId(null)
        setEditingCaseId(null)
    }

    const openNewCase = () => {
        setEditingCaseId(null)
        setCurrentView(VIEWS.FORM)
    }

    const openEditCase = (caseId) => {
        setEditingCaseId(caseId)
        setCurrentView(VIEWS.FORM)
    }

    const openCaseDetail = (caseId) => {
        setSelectedCaseId(caseId)
        setCurrentView(VIEWS.DETAIL)
    }

    const openStudyMode = (caseId) => {
        setSelectedCaseId(caseId)
        setCurrentView(VIEWS.STUDY)
    }

    const handleFormSave = (savedCaseId) => {
        setSelectedCaseId(savedCaseId)
        setCurrentView(VIEWS.DETAIL)
    }

    const handleStudyComplete = () => {
        // Volver a la biblioteca después de completar el estudio
        goToLibrary()
    }

    // Renderizar vista actual
    const renderView = () => {
        switch (currentView) {
            case VIEWS.LIBRARY:
                return (
                    <CasesLibrary
                        onNewCase={openNewCase}
                        onEditCase={openEditCase}
                        onSelectCase={openCaseDetail}
                        onStudyCase={openStudyMode}
                        onSimulateCase={() => { }} // Simulación pendiente
                    />
                )

            case VIEWS.FORM:
                return (
                    <CaseForm
                        caseId={editingCaseId}
                        onClose={goToLibrary}
                        onSave={handleFormSave}
                    />
                )

            case VIEWS.DETAIL:
                return (
                    <CaseDetail
                        caseId={selectedCaseId}
                        onBack={goToLibrary}
                        onEdit={openEditCase}
                        onStudy={openStudyMode}
                        onSimulate={() => { }} // Simulación pendiente
                    />
                )

            case VIEWS.STUDY:
                return (
                    <CaseStudyMode
                        caseId={selectedCaseId}
                        onBack={goToLibrary}
                        onComplete={handleStudyComplete}
                    />
                )

            default:
                return <CasesLibrary onNewCase={openNewCase} />
        }
    }

    return (
        <div className="clinical-cases-page">
            {renderView()}
        </div>
    )
}
