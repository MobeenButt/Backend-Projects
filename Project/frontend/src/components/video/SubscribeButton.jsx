import { useState } from 'react';
import { subscriptionService } from '../../services/subscription.service';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const SubscribeButton = ({ channelId, initialIsSubscribed = false, initialSubscribersCount = 0 }) => {
  const [isSubscribed, setIsSubscribed] = useState(initialIsSubscribed);
  const [subscribersCount, setSubscribersCount] = useState(initialSubscribersCount);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleToggleSubscribe = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to subscribe');
      navigate('/login');
      return;
    }

    try {
      setIsLoading(true);
      const response = await subscriptionService.toggleSubscription(channelId);
      
      const newIsSubscribed = response.data.isSubscribed;
      setIsSubscribed(newIsSubscribed);
      setSubscribersCount(prev => newIsSubscribed ? prev + 1 : prev - 1);
      
      toast.success(newIsSubscribed ? 'Subscribed!' : 'Unsubscribed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update subscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleSubscribe}
      disabled={isLoading}
      className={`
        px-6 py-2.5 rounded-full font-medium text-sm transition-all
        ${isSubscribed 
          ? 'bg-youtube-surface text-youtube-text hover:bg-youtube-hover' 
          : 'bg-youtube-red text-white hover:bg-red-700'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {isLoading ? 'Loading...' : isSubscribed ? 'Subscribed' : 'Subscribe'}
    </button>
  );
};

export default SubscribeButton;
