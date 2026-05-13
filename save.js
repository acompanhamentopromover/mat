/**
 * Sistema de Salvamento de Respostas - Promover
 * Compartilhado por todas as páginas de quiz
 */

function saveQuizResults(pageId, gameState) {
    const timestamp = new Date().toISOString();
    const historyKey = 'mathHistory_' + pageId;
    
    // Coleta dados da sessão
    const sessionData = {
        pageId: pageId,
        pageTitle: document.title,
        timestamp: timestamp,
        score: gameState.score || 0,
        total: gameState.logs ? gameState.logs.length : gameState.questions ? gameState.questions.length : 0,
        percentage: gameState.percentage || (gameState.score && gameState.logs ? Math.round((gameState.score / gameState.logs.length) * 100) : 0),
        logs: gameState.logs || gameState.userAnswers || [],
        metadata: {
            userAgent: navigator.userAgent,
            timeSpent: Math.round((Date.now() - (window.sessionStart || Date.now())) / 1000) // segundos
        }
    };
    
    // Salva no localStorage (local)
    try {
        const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
        history.push(sessionData);
        localStorage.setItem(historyKey, JSON.stringify(history));
        console.log('✅ Resultado salvo localmente:', sessionData);
    } catch (e) {
        console.warn('⚠ Não foi possível salvar localmente:', e);
    }
    
    // Tenta enviar para servidor (opcional)
    sendToServer(sessionData);
}

function sendToServer(sessionData) {
    // Endpoint para receber dados (você configura no seu servidor)
    const serverEndpoint = '/api/quiz-results';
    
    // Verificar se há endpoint configurado
    if (!window.QUIZ_SERVER_URL) return;
    
    fetch(window.QUIZ_SERVER_URL + serverEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('✅ Enviado para servidor:', data);
    })
    .catch(error => {
        console.warn('⚠ Erro ao enviar para servidor:', error);
    });
}

// Função para recuperar histórico local
function getLocalHistory(pageId) {
    const historyKey = 'mathHistory_' + pageId;
    try {
        return JSON.parse(localStorage.getItem(historyKey) || '[]');
    } catch (e) {
        return [];
    }
}

// Função para limpar histórico
function clearHistory(pageId) {
    const historyKey = 'mathHistory_' + pageId;
    localStorage.removeItem(historyKey);
    console.log('🗑️ Histórico limpo:', pageId);
}

// Registrar tempo de início da sessão
window.sessionStart = Date.now();
