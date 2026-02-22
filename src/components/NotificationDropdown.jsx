import { useState, useEffect, useRef } from 'react';
import { BellIcon, EnvelopeOpenIcon, TrashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) return;
            const response = await axios.get(`${API_URL}/notifications/unread-count`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const response = await axios.get(`${API_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data.notifications || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleDropdown = () => {
        if (!isOpen) {
            fetchNotifications();
        }
        setIsOpen(!isOpen);
    };

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('admin_token');
            await axios.put(`${API_URL}/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
            fetchUnreadCount();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllRead = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            await axios.put(`${API_URL}/notifications/mark-all-read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="p-2.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all relative"
            >
                <BellIcon className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-primary-600 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white translate-x-1/2 -translate-y-1/2">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                    <div className="p-5 border-b border-gray-50 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Sanctuary Alerts</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Recent notifications</p>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest flex items-center gap-1.5"
                            >
                                <CheckCircleIcon className="h-3.5 w-3.5" />
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {loading ? (
                            <div className="p-10 text-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-100 border-t-primary-600 mx-auto"></div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-10 text-center">
                                <EnvelopeOpenIcon className="h-10 w-10 text-gray-100 mx-auto mb-3" />
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No new whispers</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        className={`p-4 hover:bg-stone-50 transition-colors cursor-pointer relative group ${!notification.read ? 'bg-primary-50/30' : ''}`}
                                        onClick={() => !notification.read && markAsRead(notification._id)}
                                    >
                                        {!notification.read && (
                                            <div className="absolute top-5 left-1 w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                                        )}
                                        <div className="flex gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${notification.type === 'order' ? 'bg-amber-100 text-amber-600' :
                                                    notification.type === 'user' ? 'bg-blue-100 text-blue-600' :
                                                        'bg-gray-100 text-gray-600'
                                                }`}>
                                                {notification.type === 'order' ? <BellIcon className="h-5 w-5" /> : <BellIcon className="h-5 w-5" />}
                                            </div>
                                            <div className="flex-grow">
                                                <p className={`text-xs ${notification.read ? 'text-gray-600' : 'text-gray-900 font-bold'}`}>
                                                    {notification.message}
                                                </p>
                                                <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <Link
                        to="/orders"
                        onClick={() => setIsOpen(false)}
                        className="block p-4 bg-stone-50 text-center text-[10px] font-black text-gray-400 hover:text-primary-600 uppercase tracking-[0.2em] transition-colors"
                    >
                        View All Activity
                    </Link>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
