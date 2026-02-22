import { useState, useEffect } from 'react';
import {
  ChatBubbleLeftRightIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  SparklesIcon,
  XMarkIcon,
  CheckIcon
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center space-x-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-50">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-primary-600" />
            </div>
            <span>Intelligence Engine</span>
          </h1>
          <p className="text-gray-500 font-medium mt-1 pl-16">Configure AI response patterns and monitor automated customer service</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-3 px-6 py-2 rounded-full border transition-all ${botConfig.isActive ? 'bg-green-50 text-green-700 border-green-100 shadow-sm shadow-green-50' : 'bg-rose-50 text-rose-700 border-rose-100'
            }`}>
            <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${botConfig.isActive ? 'bg-green-500' : 'bg-rose-500'}`}></div>
            <span className="text-xs font-black uppercase tracking-widest">{botConfig.isActive ? 'Core Active' : 'Offline'}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-stone-100/50 p-2 rounded-[2rem] border border-gray-100 w-fit">
        {[
          { id: 'config', label: 'Bot DNA', icon: SparklesIcon },
          { id: 'responses', label: 'Response Library', icon: ChatBubbleLeftRightIcon },
          { id: 'conversations', label: 'Live History', icon: EyeIcon }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-3 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab.id
              ? 'bg-white text-primary-600 shadow-md shadow-gray-200/50 border border-gray-100 translate-y-[-1px]'
              : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            <tab.icon className="h-4 w-4 stroke-2" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Configuration Tab */}
      {activeTab === 'config' && (
        <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm max-w-4xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
            <SparklesIcon className="h-32 w-32 text-primary-600" />
          </div>

          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-10">Bot Personality & Controls</h2>

          <div className="space-y-10 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Assistant Identifier</label>
                <input
                  type="text"
                  value={botConfig.name}
                  onChange={(e) => setBotConfig({ ...botConfig, name: e.target.value })}
                  className="w-full px-5 py-4 bg-stone-50 border border-gray-100 rounded-2xl text-gray-900 font-black focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder:text-gray-300"
                />
              </div>

              <div className="flex flex-col justify-center">
                <div className="bg-stone-50 p-6 rounded-[2rem] flex items-center justify-between border border-gray-50">
                  <div>
                    <p className="text-gray-900 font-black text-sm uppercase tracking-widest">Global Status</p>
                    <p className="text-gray-500 text-xs font-medium">Toggle bot visibility on frontend</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={botConfig.isActive}
                      onChange={(e) => setBotConfig({ ...botConfig, isActive: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600 shadow-inner"></div>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-3 uppercase text-[10px] tracking-[0.2em] pl-1">Primary Greeting Phrase</label>
              <textarea
                value={botConfig.welcomeMessage}
                onChange={(e) => setBotConfig({ ...botConfig, welcomeMessage: e.target.value })}
                className="w-full px-6 py-6 bg-stone-50 border border-gray-100 rounded-[2.5rem] text-gray-700 font-medium h-32 resize-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all leading-relaxed"
                placeholder="Message that greets every new visitor..."
              />
            </div>

            <button
              onClick={updateBotConfig}
              className="bg-primary-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 active:scale-[0.98] inline-flex items-center gap-3"
            >
              <CheckIcon className="h-6 w-6 stroke-[3px]" />
              Commit Intelligence Update
            </button>
          </div>
        </div>
      )}

      {/* Responses Tab */}
      {activeTab === 'responses' && (
        <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm min-h-[500px]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Intelligence Patterns</h2>
              <p className="text-gray-500 text-sm font-medium mt-1">Define keyword triggers and corresponding AI outputs</p>
            </div>
            <button
              onClick={handleAddResponse}
              className="bg-primary-600 text-white px-8 py-3.5 rounded-2xl font-black hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 active:scale-[0.98] flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5 stroke-[3px]" />
              <span>Teach Pattern</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {botConfig.responses?.map((response, index) => (
              <div key={index} className="bg-stone-50/50 rounded-[2.5rem] p-8 border border-gray-50 group hover:bg-white hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-500">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${response.category === 'support' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      response.category === 'product' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        response.category === 'order' ? 'bg-violet-50 text-violet-700 border-violet-100' :
                          'bg-stone-100 text-gray-600 border-stone-200'
                      }`}>
                      {response.category}
                    </span>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${response.isActive ? 'bg-green-50 text-green-700 border-green-100 shadow-sm' : 'bg-stone-100 text-gray-400 border-stone-100 opacity-60'
                      }`}>
                      {response.isActive ? 'Active' : 'Muted'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditResponse(response, index)}
                      className="p-3 text-primary-400 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-all"
                    >
                      <PencilIcon className="h-5 w-5 stroke-2" />
                    </button>
                    <button
                      onClick={() => handleDeleteResponse(index)}
                      className="p-3 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                    >
                      <TrashIcon className="h-5 w-5 stroke-2" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1 p-1 bg-primary-100 rounded-lg">
                      <SparklesIcon className="h-3 w-3 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-black text-sm uppercase tracking-widest mb-1 opacity-40">Keywords</p>
                      <p className="text-gray-900 font-bold tracking-tight line-clamp-1">{response.trigger.join(', ')}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-gray-100 mt-4 h-24 overflow-y-auto scrollbar-hide">
                    <p className="text-gray-900 font-black text-[10px] uppercase tracking-[0.2em] mb-3 opacity-20">Output Response</p>
                    <p className="text-gray-600 font-medium text-sm leading-relaxed">{response.response}</p>
                  </div>
                </div>
              </div>
            ))}

            {(!botConfig.responses || botConfig.responses.length === 0) && (
              <div className="col-span-full text-center py-24 flex flex-col items-center">
                <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6">
                  <ChatBubbleLeftRightIcon className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">No patterns taught</h3>
                <p className="text-gray-500 font-medium max-w-xs mx-auto">Your assistant needs training data to interact with users.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conversations Tab */}
      {activeTab === 'conversations' && (
        <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm min-h-[500px]">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-10">Historical Interactions</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conversations.map((conversation) => (
              <div key={conversation._id} className="bg-stone-50/50 rounded-[2.5rem] p-8 border border-gray-50 hover:bg-white hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-500 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-2xl flex items-center justify-center">
                        <span className="text-primary-600 font-black text-xs">US</span>
                      </div>
                      <div>
                        <p className="text-gray-900 font-black tracking-tight truncate max-w-[120px]">
                          {conversation.user?.name || 'Anonymous Guest'}
                        </p>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{new Date(conversation.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button className="p-3 bg-white text-gray-400 hover:text-primary-600 rounded-2xl shadow-sm border border-gray-100 transition-all">
                      <EyeIcon className="h-5 w-5 stroke-2" />
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-gray-50/50 shadow-inner min-h-[100px]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-2">Final Utterance</p>
                    {conversation.messages?.slice(-1).map((message, index) => (
                      <p key={index} className="text-gray-600 text-sm font-medium italic line-clamp-3">"{message.message}"</p>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{conversation.messages?.length || 0} Exchanged</span>
                  <div className="h-1.5 w-1.5 rounded-full bg-primary-600"></div>
                </div>
              </div>
            ))}

            {conversations.length === 0 && (
              <div className="col-span-full text-center py-24 flex flex-col items-center">
                <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6">
                  <EyeIcon className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Registry is clean</h3>
                <p className="text-gray-500 font-medium max-w-xs mx-auto">Live user conversations will manifest here as they occur.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingResponse !== null ? 'Edit Response' : 'Add Response'}
              </h2>
              <button
                onClick={() => setShowResponseModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Trigger Keywords (comma separated)</label>
                <input
                  type="text"
                  value={responseForm.trigger}
                  onChange={(e) => setResponseForm({ ...responseForm, trigger: e.target.value })}
                  placeholder="price, cost, shipping, help"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:border-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Response Message</label>
                <textarea
                  value={responseForm.response}
                  onChange={(e) => setResponseForm({ ...responseForm, response: e.target.value })}
                  placeholder="Enter the bot's response..."
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:border-primary-500 focus:outline-none h-24 resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Category</label>
                <select
                  value={responseForm.category}
                  onChange={(e) => setResponseForm({ ...responseForm, category: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:border-primary-500 focus:outline-none"
                >
                  <option value="general">General</option>
                  <option value="support">Support</option>
                  <option value="product">Product</option>
                  <option value="order">Order</option>
                </select>
              </div>

              <div>
                <label className="flex items-center text-gray-700">
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
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveResponse}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
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