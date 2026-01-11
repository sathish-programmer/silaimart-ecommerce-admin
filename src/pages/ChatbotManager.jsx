import { useState, useEffect } from 'react';
import { 
  ChatBubbleLeftRightIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const ChatbotManager = () => {
  const [activeTab, setActiveTab] = useState('config');
  const [botConfig, setBotConfig] = useState({
    name: 'SilaiMart Assistant',
    welcomeMessage: 'Hello! I\'m here to help you find the perfect sculpture. How can I assist you today?',
    isActive: true,
    responses: [],
    quickActions: []
  });
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [editingResponse, setEditingResponse] = useState(null);
  const [responseForm, setResponseForm] = useState({
    trigger: '',
    response: '',
    category: 'general',
    isActive: true
  });

  useEffect(() => {
    fetchBotConfig();
    fetchConversations();
  }, []);

  const fetchBotConfig = async () => {
    try {
      const response = await axios.get(`${API_URL}/chatbot/config`);
      setBotConfig(response.data.bot);
    } catch (error) {
      console.error('Error fetching bot config:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_URL}/chatbot/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const updateBotConfig = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      await axios.put(`${API_URL}/chatbot/config`, botConfig, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Bot configuration updated successfully');
    } catch (error) {
      console.error('Error updating bot config:', error);
      toast.error('Failed to update bot configuration');
    }
  };

  const handleAddResponse = () => {
    setEditingResponse(null);
    setResponseForm({
      trigger: '',
      response: '',
      category: 'general',
      isActive: true
    });
    setShowResponseModal(true);
  };

  const handleEditResponse = (response, index) => {
    setEditingResponse(index);
    setResponseForm({
      trigger: response.trigger.join(', '),
      response: response.response,
      category: response.category,
      isActive: response.isActive
    });
    setShowResponseModal(true);
  };

  const handleSaveResponse = () => {
    const newResponse = {
      trigger: responseForm.trigger.split(',').map(t => t.trim()).filter(t => t),
      response: responseForm.response,
      category: responseForm.category,
      isActive: responseForm.isActive
    };

    const updatedResponses = [...(botConfig.responses || [])];
    
    if (editingResponse !== null) {
      updatedResponses[editingResponse] = newResponse;
    } else {
      updatedResponses.push(newResponse);
    }

    setBotConfig({ ...botConfig, responses: updatedResponses });
    setShowResponseModal(false);
    toast.success('Response saved successfully');
  };

  const handleDeleteResponse = (index) => {
    if (window.confirm('Are you sure you want to delete this response?')) {
      const updatedResponses = botConfig.responses.filter((_, i) => i !== index);
      setBotConfig({ ...botConfig, responses: updatedResponses });
      toast.success('Response deleted successfully');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bronze"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-bronze" />
            <span>AI Chatbot Manager</span>
          </h1>
          <p className="text-gray-400 mt-1">Configure your AI assistant and monitor conversations</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
            botConfig.isActive ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${botConfig.isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm">{botConfig.isActive ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-xl">
        {[
          { id: 'config', label: 'Configuration', icon: SparklesIcon },
          { id: 'responses', label: 'Responses', icon: ChatBubbleLeftRightIcon },
          { id: 'conversations', label: 'Conversations', icon: EyeIcon }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-bronze text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Configuration Tab */}
      {activeTab === 'config' && (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-6">Bot Configuration</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white mb-2">Bot Name</label>
                <input
                  type="text"
                  value={botConfig.name}
                  onChange={(e) => setBotConfig({ ...botConfig, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-bronze focus:outline-none"
                />
              </div>
              
              <div>
                <label className="flex items-center text-white">
                  <input
                    type="checkbox"
                    checked={botConfig.isActive}
                    onChange={(e) => setBotConfig({ ...botConfig, isActive: e.target.checked })}
                    className="mr-3"
                  />
                  Bot Active
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-white mb-2">Welcome Message</label>
              <textarea
                value={botConfig.welcomeMessage}
                onChange={(e) => setBotConfig({ ...botConfig, welcomeMessage: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-bronze focus:outline-none h-24 resize-none"
                placeholder="Enter the welcome message for users"
              />
            </div>
            
            <button
              onClick={updateBotConfig}
              className="bg-bronze text-black px-6 py-2 rounded-lg font-semibold hover:bg-gold transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* Responses Tab */}
      {activeTab === 'responses' && (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Bot Responses</h2>
            <button
              onClick={handleAddResponse}
              className="bg-bronze text-black px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gold transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Response</span>
            </button>
          </div>
          
          <div className="space-y-4">
            {botConfig.responses?.map((response, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        response.category === 'support' ? 'bg-blue-900/20 text-blue-400' :
                        response.category === 'product' ? 'bg-green-900/20 text-green-400' :
                        response.category === 'order' ? 'bg-purple-900/20 text-purple-400' :
                        'bg-gray-900/20 text-gray-400'
                      }`}>
                        {response.category}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        response.isActive ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'
                      }`}>
                        {response.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-white font-medium mb-1">Triggers: {response.trigger.join(', ')}</p>
                    <p className="text-gray-300 text-sm">{response.response}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEditResponse(response, index)}
                      className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteResponse(index)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {(!botConfig.responses || botConfig.responses.length === 0) && (
              <div className="text-center py-8 text-gray-400">
                <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No responses configured yet. Add your first response to get started.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conversations Tab */}
      {activeTab === 'conversations' && (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-6">Recent Conversations</h2>
          
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <div key={conversation._id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-medium">
                      {conversation.user?.name || 'Anonymous User'}
                    </p>
                    <p className="text-gray-400 text-sm">{conversation.user?.email}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {conversation.messages?.length || 0} messages • {new Date(conversation.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button className="text-blue-400 hover:text-blue-300 transition-colors">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                </div>
                
                {conversation.messages?.slice(-1).map((message, index) => (
                  <div key={index} className="mt-3 p-3 bg-gray-700 rounded-lg">
                    <p className="text-gray-300 text-sm">{message.message}</p>
                  </div>
                ))}
              </div>
            ))}
            
            {conversations.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <EyeIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No conversations yet. Conversations will appear here once users start chatting.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">
                {editingResponse !== null ? 'Edit Response' : 'Add Response'}
              </h2>
              <button
                onClick={() => setShowResponseModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <TrashIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-white mb-2">Trigger Keywords (comma separated)</label>
                <input
                  type="text"
                  value={responseForm.trigger}
                  onChange={(e) => setResponseForm({ ...responseForm, trigger: e.target.value })}
                  placeholder="price, cost, shipping, help"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-bronze focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-white mb-2">Response Message</label>
                <textarea
                  value={responseForm.response}
                  onChange={(e) => setResponseForm({ ...responseForm, response: e.target.value })}
                  placeholder="Enter the bot's response..."
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-bronze focus:outline-none h-24 resize-none"
                />
              </div>
              
              <div>
                <label className="block text-white mb-2">Category</label>
                <select
                  value={responseForm.category}
                  onChange={(e) => setResponseForm({ ...responseForm, category: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-bronze focus:outline-none"
                >
                  <option value="general">General</option>
                  <option value="support">Support</option>
                  <option value="product">Product</option>
                  <option value="order">Order</option>
                </select>
              </div>
              
              <div>
                <label className="flex items-center text-white">
                  <input
                    type="checkbox"
                    checked={responseForm.isActive}
                    onChange={(e) => setResponseForm({ ...responseForm, isActive: e.target.checked })}
                    className="mr-3"
                  />
                  Active
                </label>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveResponse}
                  className="px-4 py-2 bg-bronze text-black rounded-lg hover:bg-gold transition-colors"
                >
                  Save Response
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotManager;