/**
 * NEUROBOTIK AI CHAT WIDGET
 * Connects to n8n webhook for AI responses
 */

// Configuration - UPDATE THIS WITH YOUR N8N WEBHOOK URL
const CONFIG = {
    // Real n8n webhook URL
    n8nWebhookUrl: 'https://mlpnko.space/webhook/neurobotik-unified',

    // Demo mode - set to false to use real n8n workflow
    demoMode: false,

    // Session ID for conversation tracking
    sessionId: generateSessionId()
};

// DOM Elements
const chatModal = document.getElementById('chatModal');
const docsModal = document.getElementById('docsModal');
const openDemo = document.getElementById('openDemo');
const openDocs = document.getElementById('openDocs');
const closeChat = document.getElementById('closeChat');
const closeDocs = document.getElementById('closeDocs');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const docsContent = document.getElementById('docsContent');

// Initialize
function init() {
    // Modal controls
    openDemo.addEventListener('click', () => toggleModal(chatModal, true));
    openDocs.addEventListener('click', async () => {
        toggleModal(docsModal, true);
        docsContent.innerHTML = '<p style="color: var(--text-secondary);">Loading documentation...</p>';
        await renderDocs();
    });

    closeChat.addEventListener('click', () => toggleModal(chatModal, false));
    closeDocs.addEventListener('click', () => toggleModal(docsModal, false));

    // Close on backdrop click
    [chatModal, docsModal].forEach(modal => {
        modal.querySelector('.modal-backdrop').addEventListener('click', () => toggleModal(modal, false));
    });

    // Send message
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', handleKeyDown);

    // Auto-resize textarea
    messageInput.addEventListener('input', autoResizeTextarea);
}

// Toggle Modal
function toggleModal(modal, show) {
    if (show) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (modal === chatModal) messageInput.focus();
    } else {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Render Documentation
async function renderDocs() {
    try {
        const response = await fetch('how-it-works.md');
        const markdown = await response.text();

        if (typeof marked !== 'undefined') {
            docsContent.innerHTML = marked.parse(markdown);
        } else {
            docsContent.innerText = markdown;
        }
    } catch (error) {
        console.error('Error loading documentation:', error);
        docsContent.innerHTML = '<p>Error loading documentation. Please refresh the page.</p>';
    }
}

// Handle keyboard events
function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

// Send message
function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    sendUserMessage(message);
    messageInput.value = '';
    autoResizeTextarea();
}

// Send user message and get response
async function sendUserMessage(message) {
    // Hide quick actions after first message
    const quickActions = document.querySelector('.quick-actions');
    if (quickActions) {
        quickActions.style.display = 'none';
    }

    // Add user message to chat
    addMessage(message, 'user');

    // Show typing indicator
    const typingIndicator = showTypingIndicator();

    try {
        let response;

        if (CONFIG.demoMode || CONFIG.n8nWebhookUrl === 'YOUR_N8N_WEBHOOK_URL_HERE') {
            // Demo mode - use mock responses
            response = await getMockResponse(message);
        } else {
            // Production mode - call n8n webhook
            response = await callN8nWebhook(message);
        }

        // Remove typing indicator
        typingIndicator.remove();

        // Add bot response
        addMessage(response, 'bot');

    } catch (error) {
        console.error('Error getting response:', error);
        typingIndicator.remove();
        addMessage("I apologize, but I'm having trouble connecting right now. Please contact us at hello@neurobotik.com for immediate assistance.", 'bot', true);
    }
}

// Call n8n webhook
async function callN8nWebhook(message) {
    const response = await fetch(CONFIG.n8nWebhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: message,
            sessionId: CONFIG.sessionId,
            timestamp: new Date().toISOString()
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.response || data.message || data.output || "I received your message but couldn't generate a proper response.";
}

// Mock responses for demo mode
async function getMockResponse(message) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const messageLower = message.toLowerCase();

    // What does Neurobotik do?
    if (messageLower.includes('what') && (messageLower.includes('do') || messageLower.includes('neurobotik'))) {
        return `Neurobotik designs and manages <strong>AI assistants</strong> that handle repetitive customer questions inside your existing tools.\n\nWe're not a new helpdesk tool – we're your <strong>AI support operations partner</strong>, running on top of tools you already use like Zendesk, Intercom, HubSpot, or shared inboxes.\n\n<strong>Key benefits:</strong>\n• Cut response times by 25–40%\n• No in-house AI team needed\n• Works 24/7 and keeps improving\n\nWould you like to know more about our pricing or who we work with?`;
    }

    // Who is it for?
    if (messageLower.includes('who') || messageLower.includes('for whom') || messageLower.includes('target') || messageLower.includes('fit')) {
        return `Neurobotik is best suited for:\n\n✅ <strong>B2B companies</strong> in tech, service, and e-commerce sectors\n✅ Businesses handling <strong>50+ support enquiries per month</strong>\n✅ Teams stuck answering the same questions repeatedly\n\n❌ If you're only getting a handful of enquiries per month, this probably isn't for you – and we're happy to say that.\n\nWe primarily work with <strong>US, Canada, and Australia-based</strong> companies, though any business with high support volumes can benefit.\n\nNot sure if it's right for you? Book a <a href="https://calendly.com/hello-neurobotik/30min" target="_blank">free discovery call</a> and we'll tell you honestly.`;
    }

    // Delivery timeline
    if (messageLower.includes('deliver') || messageLower.includes('timeline') || messageLower.includes('how long') || messageLower.includes('how quick') || messageLower.includes('start') || messageLower.includes('21 day')) {
        return `Most projects show <strong>measurable improvements within 21 days</strong> of onboarding.\n\n<strong>When does your project start?</strong>\n• Sign up <strong>on or before the 15th</strong> → Begin within 5 working days\n• Sign up <strong>after the 15th</strong> → Begin on the 1st of the following month\n\nThis scheduling policy ensures our team is fully prepared to deliver quality work.\n\nReady to get started? You can <a href="https://forms.gle/XavmLeWbJfd4oicT7" target="_blank">fill out our form</a> or <a href="https://calendly.com/hello-neurobotik/30min" target="_blank">book a call</a>.`;
    }

    // Cancellation and refund
    if (messageLower.includes('cancel') || messageLower.includes('refund') || messageLower.includes('money back')) {
        return `<strong>Cancellation Policy:</strong>\nYes, you can cancel anytime with <strong>7 days' notice</strong> before your renewal date. Service continues until the end of your current billing period.\n\n<strong>Refund Policy:</strong>\nPayments are non-refundable once onboarding starts. However, refunds ARE possible if:\n• No work has started within 30 days of payment\n• You cancel before your kickoff call\n\nApproved refunds are processed within <strong>10 working days</strong>.\n\nQuestions about billing? Email us at <a href="mailto:hello@neurobotik.com">hello@neurobotik.com</a>.`;
    }

    // Data protection
    if (messageLower.includes('data') || messageLower.includes('privacy') || messageLower.includes('secure') || messageLower.includes('gdpr') || messageLower.includes('protect')) {
        return `Your data security is our priority. Here's how we protect it:\n\n<strong>Compliance:</strong>\n• Full <strong>UK GDPR</strong> compliance\n• Data Protection Act 2018 compliant\n\n<strong>Security measures:</strong>\n• Encrypted cloud platforms (Google Workspace, Notion, Stripe)\n• Restricted access for authorized personnel only\n• Audit trails and access controls\n\n<strong>Confidentiality:</strong>\nAll configurations, scripts, and technical details are confidential and stored in secure portals accessible only to you and our team.\n\nYou can exercise your data rights (access, correction, deletion) by emailing <a href="mailto:hello@neurobotik.com">hello@neurobotik.com</a>.`;
    }

    // Pricing
    if (messageLower.includes('price') || messageLower.includes('cost') || messageLower.includes('plan') || messageLower.includes('pricing')) {
        return `We offer two main service plans:\n\n<strong>Neurobotik Lite</strong>\nFor teams overwhelmed by repeated questions:\n• AI FAQ Automation\n• 21-Day Setup\n• Monthly Reports\n• Cancel Anytime\n\n<strong>Neurobotik 2.0 Pro</strong>\nFor teams wanting automation + deeper reporting:\n• Everything in Lite, plus:\n• Workflow Automation\n• Live Reporting Dashboard\n• Ongoing Support\n\nA typical support agent costs ~$3,000/month. If our AI deflects 30-40% of tickets, it's often more cost-effective than hiring.\n\nFor specific pricing, <a href="https://calendly.com/hello-neurobotik/30min" target="_blank">book a discovery call</a>.`;
    }

    // Project status (for the automation demo)
    if (messageLower.includes('status') && messageLower.includes('project')) {
        const projectIdMatch = message.match(/#?(\d{6})/);
        if (projectIdMatch) {
            const projectId = projectIdMatch[1];
            if (projectId === '123456') {
                return `<strong>Project #123456 Status</strong>\n\n📊 <strong>Status:</strong> In Production\n📅 <strong>Due Date:</strong> 10 February 2026\n\n<strong>What happens next:</strong>\nYour AI assistant is currently in the final testing phase. Our team will run quality checks and prepare for go-live. You'll receive a launch readiness report by the due date.\n\nNeed more details? Email us at <a href="mailto:hello@neurobotik.com">hello@neurobotik.com</a>.`;
            } else {
                return `I couldn't find a project with ID <strong>#${projectId}</strong> in our system.\n\nCould you please double-check the project ID? If you're having trouble, contact our team at <a href="mailto:hello@neurobotik.com">hello@neurobotik.com</a> and we'll help you locate your project.`;
            }
        }
        return `To check your project status, please provide your <strong>6-digit project ID</strong>.\n\nFor example: "What's the status of project #123456?"\n\nIf you don't have your project ID, please email <a href="mailto:hello@neurobotik.com">hello@neurobotik.com</a>.`;
    }

    // Contact / Help
    if (messageLower.includes('contact') || messageLower.includes('help') || messageLower.includes('support') || messageLower.includes('speak') || messageLower.includes('talk')) {
        return `I'd be happy to connect you with our team!\n\n<strong>Contact Options:</strong>\n\n📞 <a href="https://calendly.com/hello-neurobotik/30min" target="_blank">Book a Free Discovery Call</a>\n\n✉️ Email: <a href="mailto:hello@neurobotik.com">hello@neurobotik.com</a>\n\n📝 <a href="https://forms.gle/XavmLeWbJfd4oicT7" target="_blank">Fill Out Our Contact Form</a>\n\nIf something is urgent, we respond to emails within <strong>24 hours on working days</strong>.`;
    }

    // Default response - uncertain/route to support
    return `Thanks for your question! I want to make sure I give you accurate information.\n\nI'm not entirely sure about the specifics of what you're asking. Rather than guess, I'd recommend:\n\n• <a href="https://calendly.com/hello-neurobotik/30min" target="_blank">Book a free discovery call</a> to speak with our team directly\n• Email us at <a href="mailto:hello@neurobotik.com">hello@neurobotik.com</a>\n\nIs there anything else I can help you with, like our services, pricing, or delivery timeline?`;
}

// Add message to chat
function addMessage(content, type, isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;

    if (type === 'bot') {
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <img src="logo.png" alt="NB">
            </div>
            <div class="message-content ${isError ? 'error' : ''}">${formatMessage(content)}</div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
            </div>
            <div class="message-content">${escapeHtml(content)}</div>
        `;
    }

    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Format bot message (using marked.js for Markdown)
function formatMessage(content) {
    if (typeof marked !== 'undefined') {
        // Configure marked options
        marked.setOptions({
            breaks: true,
            gfm: true,
            headerIds: false,
            mangle: false
        });
        return marked.parse(content);
    }

    // Fallback if marked is not loaded
    return content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line)
        .map(line => `<p>${line}</p>`)
        .join('');
}

// Escape HTML for user messages
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <img src="logo.png" alt="NB">
        </div>
        <div class="message-content">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    scrollToBottom();
    return typingDiv;
}

// Scroll to bottom of chat
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Auto-resize textarea
function autoResizeTextarea() {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
}

// Generate session ID
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);

// Lightbox Logic (Restored for Escalation Evidence)
function openLightbox(imgName) {
    const modal = document.getElementById('lightboxModal');
    const img = document.getElementById('lightboxImg');
    if (!modal || !img) return; // safety

    img.src = imgName;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const modal = document.getElementById('lightboxModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Live Demo Logic
function triggerLiveDemo(questionText) {
    // 1. Open the chat modal
    const chatModal = document.getElementById('chatModal');
    toggleModal(chatModal, true);

    // 2. Type the message into the input
    // Small delay to ensure modal transition is clean before "typing" appears
    setTimeout(() => {
        messageInput.value = questionText;
        messageInput.focus();
        autoResizeTextarea();

        // 3. Auto-send after a moment for dramatic effect (optional, or just leave it for them to click)
        const sendBtn = document.getElementById('sendBtn');

        // Highlight the send button to indicate action is needed
        sendBtn.style.transform = 'scale(1.2)';
        sendBtn.style.background = 'var(--gradient)';
        sendBtn.style.color = 'white';

        setTimeout(() => {
            // Reset style
            sendBtn.style.transform = '';
            sendBtn.style.background = '';
            sendBtn.style.color = '';
            // trigger send
            handleSendMessage();
        }, 800);

    }, 400);
}
