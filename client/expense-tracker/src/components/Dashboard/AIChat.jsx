import React, { useState, useRef, useEffect } from 'react';
import { BsStars, BsChatDots, BsX, BsSend } from 'react-icons/bs';
import { API_PATH } from '../../utils/apiPath';

function AIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi there! I am Gullak AI. Ask me about your expenses, income, or any financial advice!' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        const newMessages = [...messages, { role: 'user', content: userMsg }];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
            
            const response = await fetch(`${baseURL}/${API_PATH.AI.CHAT}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ messages: newMessages })
            });

            if (!response.ok) {
                throw new Error("Failed to connect to AI");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let assistantMessage = "";
            
            setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.error) {
                                console.error(data.error);
                            } else if (data.done) {
                                break;
                            } else if (data.delta) {
                                assistantMessage += data.delta;
                                setMessages((prev) => {
                                    const updated = [...prev];
                                    updated[updated.length - 1] = { role: 'assistant', content: assistantMessage };
                                    return updated;
                                });
                            }
                        } catch (e) {
                            // ignore parsing errors on partial chunks
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => {
                const updated = [...prev];
                // if the last message is an empty assistant message, replace it
                if (updated[updated.length - 1].role === 'assistant' && updated[updated.length - 1].content === '') {
                    updated[updated.length - 1].content = 'Oops! Something went wrong.';
                } else {
                    updated.push({ role: 'assistant', content: 'Oops! Something went wrong.' });
                }
                return updated;
            });
        } finally {
            setIsLoading(false);
        }
    };

    const formatText = (text) => {
        let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return { __html: formatted };
    };

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed', bottom: 24, right: 24, zIndex: 50,
                    width: 60, height: 60, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #C8F73A 0%, #FFE600 100%)',
                    border: 'none', cursor: 'pointer',
                    display: isOpen ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(200,247,58,0.4)',
                    transition: 'transform 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                <BsStars style={{ fontSize: 24, color: '#111' }} />
            </button>

            {/* Chat Modal / Slide-over */}
            {isOpen && (
                <div style={{
                    position: 'fixed', bottom: 24, right: 24, zIndex: 60,
                    width: 360, height: 600, maxHeight: 'calc(100vh - 48px)',
                    background: '#FFFFFF', borderRadius: 24,
                    boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
                    display: 'flex', flexDirection: 'column',
                    overflow: 'hidden', border: '1px solid #EAEEF5'
                }}>
                    {/* Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, #111 0%, #1A1A1A 100%)',
                        padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        color: '#FFF'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #C8F73A, #FFE600)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <BsStars style={{ color: '#111', fontSize: 18 }} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Gullak AI</h3>
                                <p style={{ margin: 0, fontSize: 12, color: '#AAA' }}>Your financial companion</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}
                        >
                            <BsX style={{ fontSize: 28 }} />
                        </button>
                    </div>

                    {/* Messages Container */}
                    <div style={{
                        flex: 1, padding: 20, overflowY: 'auto', background: '#F7F8FA',
                        display: 'flex', flexDirection: 'column', gap: 16
                    }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                            }}>
                                <div style={{
                                    maxWidth: '80%', padding: '12px 16px', borderRadius: 16,
                                    borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 16,
                                    borderBottomRightRadius: msg.role === 'user' ? 4 : 16,
                                    background: msg.role === 'user' ? '#C8F73A' : '#FFF',
                                    color: '#111', fontSize: 14, lineHeight: 1.5,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                    whiteSpace: 'pre-wrap'
                                }} dangerouslySetInnerHTML={formatText(msg.content)} />
                            </div>
                        ))}
                        {isLoading && messages[messages.length - 1].role !== 'assistant' && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <div style={{
                                    padding: '12px 16px', borderRadius: 16, borderBottomLeftRadius: 4,
                                    background: '#FFF', display: 'flex', gap: 4, alignItems: 'center'
                                }}>
                                    <div className="animate-bounce" style={{ width: 6, height: 6, background: '#CCC', borderRadius: '50%' }} />
                                    <div className="animate-bounce" style={{ width: 6, height: 6, background: '#CCC', borderRadius: '50%', animationDelay: '0.1s' }} />
                                    <div className="animate-bounce" style={{ width: 6, height: 6, background: '#CCC', borderRadius: '50%', animationDelay: '0.2s' }} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div style={{ padding: 16, background: '#FFF', borderTop: '1px solid #EAEEF5' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            background: '#F7F8FA', padding: '8px 16px', borderRadius: 999, border: '1px solid #EAEEF5'
                        }}>
                            <input
                                type="text"
                                placeholder="Ask me anything..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                style={{
                                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                                    fontSize: 14, color: '#111'
                                }}
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                style={{
                                    background: input.trim() && !isLoading ? '#111' : '#E0E0E0',
                                    color: '#FFF', border: 'none', borderRadius: '50%',
                                    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: input.trim() && !isLoading ? 'pointer' : 'default',
                                    transition: 'background 0.2s'
                                }}
                            >
                                <BsSend style={{ fontSize: 14 }} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default AIChat;
