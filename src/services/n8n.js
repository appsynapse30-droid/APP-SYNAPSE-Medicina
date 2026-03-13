const N8N_BASE_URL = 'https://n8n-n8n.8noypn.easypanel.host/webhook';

/**
 * Service to interact with n8n AI Brain Workflows
 */
const n8nService = {
    /**
     * Generate a new simulation question/case
     * @param {Object} params { mode, difficulty, topics }
     */
    generateSimulation: async (params) => {
        try {
            const response = await fetch(`${N8N_BASE_URL}/sim-generator`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params)
            });
            if (!response.ok) throw new Error('Failed to generate simulation');
            return await response.json();
        } catch (error) {
            console.error('n8n generateSimulation Error:', error);
            throw error;
        }
    },

    /**
     * Get real-time feedback from the Invisible Tutor
     * @param {Object} data { question_text, context, user_answer, correct_answer }
     */
    getTutorFeedback: async (data) => {
        try {
            const response = await fetch(`${N8N_BASE_URL}/tutor-invisible`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Tutor unavailable');
            return await response.json();
        } catch (error) {
            console.error('n8n getTutorFeedback Error:', error);
            throw error;
        }
    },

    /**
     * Convert content to FSRS Flashcards
     * @param {Object} data { content, topic }
     */
    createFlashcards: async (data) => {
        try {
            const response = await fetch(`${N8N_BASE_URL}/flashcard-factory`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Flashcard factory failed');
            return await response.json();
        } catch (error) {
            console.error('n8n createFlashcards Error:', error);
            throw error;
        }
    }
};

export default n8nService;
