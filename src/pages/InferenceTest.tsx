import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Send, Download, Copy, ThumbsUp, ThumbsDown, X, CheckCircle, MessageSquare } from 'lucide-react';

const InferenceTest: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [conversation, setConversation] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  
  const models = [
    { id: 1, name: 'Mistral-7B-Customer-Support-v1', type: 'fine-tuned' },
    { id: 2, name: 'LLaMa2-7B-ProductReviews-v1', type: 'fine-tuned' },
    { id: 3, name: 'Mistral-7B-base', type: 'base' },
  ];
  
  const [selectedModel, setSelectedModel] = useState(models[0]);
  
  const handleSendPrompt = () => {
    if (!prompt.trim()) return;
    
    // Add user message to conversation
    setConversation([...conversation, { role: 'user', content: prompt }]);
    
    // Simulate sending to the model
    setIsSending(true);
    
    // Clear the prompt input
    setPrompt('');
    
    // Simulate AI response after a delay
    setTimeout(() => {
      // Example responses based on model
      let response = '';
      
      if (selectedModel.name.includes('Customer-Support')) {
        response = "I understand you're having an issue. I'd be happy to help resolve this for you. Could you please provide more details about the problem you're experiencing, including any error messages or when you first noticed it? This will help me provide the most accurate assistance.";
      } else if (selectedModel.name.includes('ProductReviews')) {
        response = "Thank you for your interest in our product. Based on customer reviews, this product has received positive feedback for its durability and ease of use. Several customers have mentioned that it exceeded their expectations. Would you like me to provide more specific information about any aspect of the product?";
      } else {
        response = "I'm a language model trained to assist with a variety of tasks including answering questions, providing information, and engaging in conversation. How can I help you today?";
      }
      
      // Add AI response to conversation
      setConversation(prev => [...prev, { role: 'assistant', content: response }]);
      setIsSending(false);
    }, 1500);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt();
    }
  };
  
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inference Test</h1>
        
        <div className="flex space-x-3">
          <select 
            className="input text-sm"
            value={selectedModel.id}
            onChange={(e) => setSelectedModel(models.find(m => m.id === parseInt(e.target.value)) || models[0])}
          >
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
          <button className="btn-primary">
            <Download className="h-4 w-4 mr-2" />
            Export Conversation
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col min-h-0">
        {/* Chat interface */}
        <div className="card flex-1 flex flex-col">
          {/* Model info */}
          <div className="flex items-center justify-between p-3 border-b border-border bg-background rounded-t-xl">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white mr-3">
                <Terminal className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">{selectedModel.name}</p>
                <p className="text-xs text-text-secondary">
                  {selectedModel.type === 'fine-tuned' ? 'Fine-tuned Model' : 'Base Model'}
                </p>
              </div>
            </div>
            <div>
              <span className="badge-success flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Online
              </span>
            </div>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {conversation.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                <MessageSquare className="h-12 w-12 mb-3 opacity-20" />
                <p>Start a conversation with the model</p>
                <p className="text-sm mt-2">Try asking a question or providing a prompt</p>
              </div>
            ) : (
              conversation.map((message, index) => (
                <div 
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user' 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-background border border-border rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    
                    {message.role === 'assistant' && (
                      <div className="flex items-center justify-end mt-2 space-x-2">
                        <button className="p-1 text-text-secondary hover:text-text transition-colors">
                          <Copy className="h-3 w-3" />
                        </button>
                        <button className="p-1 text-text-secondary hover:text-success transition-colors">
                          <ThumbsUp className="h-3 w-3" />
                        </button>
                        <button className="p-1 text-text-secondary hover:text-error transition-colors">
                          <ThumbsDown className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                </div>
              ))
            )}
            
            {isSending && (
              <div className="flex justify-start">
                <div className="bg-background border border-border rounded-lg rounded-tl-none p-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-100"></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-200"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input area */}
          <div className="p-3 border-t border-border bg-background rounded-b-xl">
            <div className="relative">
              <textarea
                className="input w-full pr-10 resize-none"
                rows={3}
                placeholder="Type your message here..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
              ></textarea>
              <button 
                className={`absolute right-3 bottom-3 p-2 rounded-full ${
                  prompt.trim() ? 'bg-primary text-white' : 'bg-background-light text-text-secondary'
                } transition-colors`}
                onClick={handleSendPrompt}
                disabled={!prompt.trim() || isSending}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="flex justify-between items-center mt-2 text-xs text-text-secondary">
              <div>
                <span>Shift + Enter for new line</span>
              </div>
              <div>
                <span>Model: {selectedModel.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Parameter controls */}
      <div className="card p-4">
        <h2 className="font-medium mb-4">Inference Parameters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Temperature</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              defaultValue="0.7"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-text-secondary mt-1">
              <span>Precise (0)</span>
              <span>0.7</span>
              <span>Creative (1)</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Top-p Sampling</label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              defaultValue="0.9"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-text-secondary mt-1">
              <span>Focused (0.1)</span>
              <span>0.9</span>
              <span>Diverse (1)</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Max Tokens</label>
            <select className="input w-full">
              <option>256 tokens</option>
              <option>512 tokens</option>
              <option selected>1024 tokens</option>
              <option>2048 tokens</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InferenceTest;