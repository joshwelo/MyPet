import React, { useState } from 'react'; // Ensure Bootstrap is imported

const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { sender: 'user', text: input }]);
      setInput(''); // Clear input field
      // Simulate AI response (you can replace this logic with actual AI integration)
      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'ai', text: "This is an AI response." },
        ]);
      }, 500);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 'auto' }}>
      <div className="card shadow-sm">
        <div className="card-header text-center bg-primary text-white">
          <h5>AI Chatbot</h5>
        </div>
        <div className="card-body" style={{ height: '400px', overflowY: 'auto' }}>
          <div className="chat-area">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`d-flex mb-3 ${
                  msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'
                }`}
              >
                <div
                  className={`p-2 rounded-3 ${
                    msg.sender === 'user' ? 'bg-primary text-white' : 'bg-light text-dark'
                  }`}
                  style={{ maxWidth: '75%' }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card-footer">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="btn btn-primary" onClick={handleSend}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
