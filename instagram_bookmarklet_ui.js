javascript:(function(){
// Verificar si ya existe el bot para evitar duplicados
if(window.instagramBot) {
    document.getElementById('instagram-bot-panel')?.remove();
}

// Crear la clase del bot
class InstagramAutoCommenter {
    constructor() {
        this.users = [];
        this.currentIndex = 0;
        this.isRunning = false;
        this.config = {
            minDelay: 30000,
            maxDelay: 60000,
            maxTagsPerComment: 20,
            sheetsApiKey: 'AIzaSyBnwf-NWx6A0HKhUnS7D58HXg3NO680-5A',
            spreadsheetId: '1ZOVsrte8eSA_Fkn_RO8KwdqlZyWdxcRs3Wknhs-ORv0',
            defaultMessage: ''
        };
        this.createUI();
    }

    createUI() {
        // Crear panel de control
        const panel = document.createElement('div');
        panel.id = 'instagram-bot-panel';
        panel.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                width: 320px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                z-index: 999999;
                backdrop-filter: blur(10px);
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin: 0; font-size: 16px;">🚀 Instagram Bot</h3>
                    <button onclick="document.getElementById('instagram-bot-panel').remove()" style="
                        background: rgba(255,255,255,0.2);
                        border: none;
                        color: white;
                        width: 25px;
                        height: 25px;
                        border-radius: 50%;
                        cursor: pointer;
                        font-size: 16px;
                    ">×</button>
                </div>
                
                <div id="bot-status" style="
                    background: rgba(255,255,255,0.1);
                    padding: 10px;
                    border-radius: 8px;
                    margin-bottom: 15px;
                    font-size: 12px;
                ">
                    📊 Estado: Inicializando...
                </div>

                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 500;">Mensaje personalizado (opcional):</label>
                    <input type="text" id="custom-message" placeholder="¡Participen en esto!" style="
                        width: 100%;
                        padding: 8px;
                        border: none;
                        border-radius: 6px;
                        background: rgba(255,255,255,0.9);
                        color: #333;
                        box-sizing: border-box;
                    ">
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-size: 12px;">Etiquetas por comentario:</label>
                        <select id="tags-mode" onchange="toggleTagsInput()" style="
                            width: 100%;
                            padding: 6px;
                            border: none;
                            border-radius: 6px;
                            background: rgba(255,255,255,0.9);
                            color: #333;
                        ">
                            <option value="fixed">Cantidad fija</option>
                            <option value="variable">Cantidad variable</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-size: 12px;">Máx. comentarios (opcional):</label>
                        <input type="number" id="max-comments" placeholder="Sin límite" min="1" style="
                            width: 100%;
                            padding: 6px;
                            border: none;
                            border-radius: 6px;
                            background: rgba(255,255,255,0.9);
                            color: #333;
                            box-sizing: border-box;
                        ">
                    </div>
                </div>

                <div id="tags-input-container">
                    <div id="fixed-tags" style="margin-bottom: 10px;">
                        <label style="display: block; margin-bottom: 5px; font-size: 12px;">Cantidad de etiquetas:</label>
                        <input type="number" id="fixed-count" value="5" min="1" max="20" style="
                            width: 100%;
                            padding: 6px;
                            border: none;
                            border-radius: 6px;
                            background: rgba(255,255,255,0.9);
                            color: #333;
                            box-sizing: border-box;
                        ">
                    </div>
                    <div id="variable-tags" style="display: none; margin-bottom: 10px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-size: 12px;">Mínimo:</label>
                                <input type="number" id="min-tags" value="2" min="1" max="20" style="
                                    width: 100%;
                                    padding: 6px;
                                    border: none;
                                    border-radius: 6px;
                                    background: rgba(255,255,255,0.9);
                                    color: #333;
                                    box-sizing: border-box;
                                ">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-size: 12px;">Máximo:</label>
                                <input type="number" id="max-tags" value="8" min="1" max="20" style="
                                    width: 100%;
                                    padding: 6px;
                                    border: none;
                                    border-radius: 6px;
                                    background: rgba(255,255,255,0.9);
                                    color: #333;
                                    box-sizing: border-box;
                                ">
                            </div>
                        </div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                    <button onclick="startBot()" id="start-btn" style="
                        background: #00ff88;
                        color: #1a1a1a;
                        border: none;
                        padding: 10px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: bold;
                        font-size: 13px;
                    ">▶️ Iniciar</button>
                    <button onclick="stopBot()" style="
                        background: #ff4757;
                        color: white;
                        border: none;
                        padding: 10px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: bold;
                        font-size: 13px;
                    ">⏹️ Detener</button>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <button onclick="resetBot()" style="
                        background: rgba(255,255,255,0.2);
                        color: white;
                        border: 1px solid rgba(255,255,255,0.3);
                        padding: 8px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 12px;
                    ">🔄 Reiniciar</button>
                    <button onclick="showStatus()" style="
                        background: rgba(255,255,255,0.2);
                        color: white;
                        border: 1px solid rgba(255,255,255,0.3);
                        padding: 8px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 12px;
                    ">📊 Estado</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Cargar usuarios automáticamente
        this.loadUsersFromSheets();
    }

    updateStatus(message, type = 'info') {
        const statusEl = document.getElementById('bot-status');
        if (statusEl) {
            const icons = { info: '📊', success: '✅', error: '❌', warning: '⚠️' };
            statusEl.innerHTML = `${icons[type]} ${message}`;
        }
    }

    async loadUsersFromSheets() {
        try {
            this.updateStatus('Cargando usuarios desde Google Sheets...', 'info');
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/A:B?key=${this.config.sheetsApiKey}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (!data.values) {
                this.updateStatus('No se encontraron datos en la hoja', 'error');
                return;
            }

            this.users = data.values.map(row => ({
                username: row[0] || '',
                customMessage: row[1] || this.config.defaultMessage
            })).filter(user => user.username.trim());

            this.updateStatus(`${this.users.length} usuarios cargados - Listo para usar`, 'success');
            
        } catch (error) {
            this.updateStatus('Error cargando usuarios', 'error');
            console.error("❌ Error cargando usuarios:", error);
        }
    }

    // Resto de métodos del bot (igual que antes)
    checkInstagramPage() {
        if (!window.location.hostname.includes('instagram.com')) {
            this.updateStatus('Este script solo funciona en Instagram.com', 'error');
            return false;
        }
        return true;
    }

    findCommentBox() {
        const selectors = [
            'textarea[placeholder*="comentario"]',
            'textarea[placeholder*="Agregar"]',
            'textarea[placeholder*="Add"]',
            'textarea[aria-label*="comentario"]',
            'textarea[aria-label*="Add a comment"]'
        ];

        for (let selector of selectors) {
            const element = document.querySelector(selector);
            if (element) return element;
        }
        return null;
    }

    findSubmitButton() {
        const elements = document.querySelectorAll('button[type="submit"]');
        for (let element of elements) {
            const parent = element.closest('form');
            if (parent && parent.querySelector('textarea')) {
                return element;
            }
        }
        return null;
    }

    getRandomDelay() {
        return Math.floor(Math.random() * (this.config.maxDelay - this.config.minDelay + 1)) + this.config.minDelay;
    }

    getRandomTagCount(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    createComment(users, customMessage = '') {
        const userTags = users.map(user => user.username).join(' ');
        return customMessage ? `${customMessage} ${userTags}` : userTags;
    }

    async simulateTyping(element, text) {
        element.focus();
        element.value = '';
        
        for (let char of text) {
            element.value += char;
            element.dispatchEvent(new Event('input', { bubbles: true }));
            await this.sleep(Math.random() * 100 + 50);
        }
        
        const event = new Event('input', { bubbles: true });
        Object.defineProperty(event, 'target', { value: element, enumerable: true });
        element.dispatchEvent(event);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async postComment(users, customMessage = '') {
        try {
            const commentBox = this.findCommentBox();
            if (!commentBox) {
                this.updateStatus('No se encontró el área de comentarios', 'error');
                return false;
            }

            const comment = this.createComment(users, customMessage);
            console.log(`💬 Escribiendo comentario: ${comment.substring(0, 100)}...`);

            await this.simulateTyping(commentBox, comment);
            await this.sleep(2000);

            const submitButton = this.findSubmitButton();
            if (!submitButton) {
                this.updateStatus('No se encontró el botón de enviar', 'error');
                return false;
            }

            submitButton.click();
            return true;

        } catch (error) {
            console.error("❌ Error enviando comentario:", error);
            return false;
        }
    }

    async runCampaign() {
        if (!this.checkInstagramPage()) return;
        
        if (this.users.length === 0) {
            this.updateStatus('No hay usuarios cargados', 'error');
            return;
        }

        if (this.isRunning) {
            this.updateStatus('Ya hay una campaña en ejecución', 'warning');
            return;
        }

        // Leer configuración de la UI
        const customMessage = document.getElementById('custom-message').value;
        const maxComments = document.getElementById('max-comments').value || null;
        const tagsMode = document.getElementById('tags-mode').value;
        
        let getTagCount;
        if (tagsMode === 'fixed') {
            const fixedCount = parseInt(document.getElementById('fixed-count').value);
            getTagCount = () => fixedCount;
        } else {
            const minTags = parseInt(document.getElementById('min-tags').value);
            const maxTags = parseInt(document.getElementById('max-tags').value);
            getTagCount = () => this.getRandomTagCount(minTags, maxTags);
        }

        this.isRunning = true;
        document.getElementById('start-btn').style.opacity = '0.5';
        this.updateStatus('Iniciando campaña...', 'info');

        let commentsPosted = 0;

        try {
            while (this.currentIndex < this.users.length) {
                if (!this.isRunning) break;

                const remainingUsers = this.users.length - this.currentIndex;
                const requestedTagCount = getTagCount();
                
                // LÓGICA INTELIGENTE: Verificar si hay suficientes usuarios
                if (remainingUsers < requestedTagCount) {
                    this.updateStatus(`Finalizado: Solo quedan ${remainingUsers} usuarios (necesitas ${requestedTagCount})`, 'warning');
                    console.log(`⚠️ Campaña finalizada: Quedan ${remainingUsers} usuarios pero necesitas ${requestedTagCount}`);
                    break;
                }

                // Verificar límite de comentarios DESPUÉS de verificar usuarios disponibles
                if (maxComments && commentsPosted >= maxComments) {
                    this.updateStatus(`Límite alcanzado: ${maxComments} comentarios máximos`, 'success');
                    console.log(`✅ Límite de comentarios alcanzado: ${maxComments}`);
                    break;
                }

                const tagCount = Math.min(requestedTagCount, remainingUsers);
                const selectedUsers = this.users.slice(this.currentIndex, this.currentIndex + tagCount);
                const messageToUse = selectedUsers[0]?.customMessage || customMessage;

                this.updateStatus(`Enviando comentario ${commentsPosted + 1} (${tagCount} etiquetas)...`, 'info');
                const success = await this.postComment(selectedUsers, messageToUse);
                
                if (success) {
                    commentsPosted++;
                    this.currentIndex += tagCount;
                    
                    const remainingAfter = this.users.length - this.currentIndex;
                    this.updateStatus(`${commentsPosted} comentarios | ${remainingAfter} usuarios restantes`, 'success');
                    
                    // Verificar si hay suficientes usuarios para el próximo comentario
                    const nextRequestedCount = getTagCount();
                    if (remainingAfter > 0 && remainingAfter < nextRequestedCount) {
                        this.updateStatus(`Próximo: necesitas ${nextRequestedCount} pero solo quedan ${remainingAfter}`, 'warning');
                        console.log(`⚠️ Próximo comentario necesita ${nextRequestedCount} usuarios pero solo quedan ${remainingAfter}`);
                    }
                    
                    // Continuar solo si hay más usuarios y no se alcanzó el límite
                    if (this.currentIndex < this.users.length && 
                        (!maxComments || commentsPosted < maxComments) && 
                        remainingAfter >= nextRequestedCount) {
                        const delay = this.getRandomDelay();
                        this.updateStatus(`Esperando ${Math.round(delay/1000)} segundos...`, 'info');
                        await this.sleep(delay);
                    }
                } else {
                    this.updateStatus('Error en comentario, esperando...', 'warning');
                    await this.sleep(10000);
                }
            }

            // Mensaje final inteligente
            const remainingUsers = this.users.length - this.currentIndex;
            let finalMessage = `Campaña finalizada: ${commentsPosted} comentarios enviados`;
            
            if (remainingUsers === 0) {
                finalMessage += ' - Todos los usuarios etiquetados';
            } else if (maxComments && commentsPosted >= maxComments) {
                finalMessage += ` - Límite de ${maxComments} comentarios alcanzado`;
            } else {
                const nextNeeded = getTagCount();
                finalMessage += ` - Quedan ${remainingUsers} usuarios (insuficientes para ${nextNeeded} etiquetas)`;
            }

        } catch (error) {
            this.updateStatus('Error en campaña', 'error');
            console.error("❌ Error en campaña:", error);
        } finally {
            this.isRunning = false;
            document.getElementById('start-btn').style.opacity = '1';
            this.updateStatus(finalMessage, 'success');
        }
    }

    stop() {
        this.isRunning = false;
        document.getElementById('start-btn').style.opacity = '1';
        this.updateStatus('Campaña detenida por el usuario', 'warning');
    }

    reset() {
        this.currentIndex = 0;
        this.updateStatus(`${this.users.length} usuarios - Reiniciado desde el inicio`, 'success');
    }
}

// Funciones globales para los botones
window.toggleTagsInput = function() {
    const mode = document.getElementById('tags-mode').value;
    document.getElementById('fixed-tags').style.display = mode === 'fixed' ? 'block' : 'none';
    document.getElementById('variable-tags').style.display = mode === 'variable' ? 'block' : 'none';
};

window.startBot = function() {
    if (window.instagramBot) {
        window.instagramBot.runCampaign();
    }
};

window.stopBot = function() {
    if (window.instagramBot) {
        window.instagramBot.stop();
    }
};

window.resetBot = function() {
    if (window.instagramBot) {
        window.instagramBot.reset();
    }
};

window.showStatus = function() {
    if (window.instagramBot) {
        const bot = window.instagramBot;
        alert(`📊 Estado del Bot:
        
✅ Usuarios cargados: ${bot.users.length}
📍 Índice actual: ${bot.currentIndex}
🏃 En ejecución: ${bot.isRunning ? 'Sí' : 'No'}
📋 Usuarios restantes: ${bot.users.length - bot.currentIndex}`);
    }
};

// Crear instancia del bot
window.instagramBot = new InstagramAutoCommenter();
})();