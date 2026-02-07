import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Heart, 
  MessageCircle, 
  Star, 
  Filter, 
  Search,
  Users,
  Sparkles,
  Volume2,
  Eye,
  Share2,
  Send,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';

interface Tip {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  author: string;
  rating: number;
  votes: number;
  created_at: string;
  visual_url?: string;
  audio_url?: string;
  japanese_terms?: Array<{
    term: string;
    reading: string;
    meaning: string;
  }>;
  user_id?: string;
  rating_count?: number;
  average_rating?: number;
  likeCount?: number;
  isLiked?: boolean;
  comments?: Comment[];
}

interface Comment {
  id: string;
  content: string;
  author: string;
  created_at: string;
  user_id: string;
}

const categories = [
  { id: 'all', name: 'All Tips', emoji: '✨' },
  { id: 'living', name: 'Living', emoji: '🏠' },
  { id: 'mobile', name: 'Mobile', emoji: '📱' },
  { id: 'banking', name: 'Banking', emoji: '💰' },
  { id: 'city-hall', name: 'City Hall', emoji: '🧾' },
  { id: 'language', name: 'Language', emoji: '💬' },
  { id: 'culture', name: 'Culture', emoji: '🎌' }
];

const mockTips: Tip[] = [
  {
    id: '1',
    title: 'Best Time to Visit City Hall',
    content: 'Visit the city hall before 10 AM to avoid long lines. Bring your passport and residence card. The staff is usually more patient in the morning.',
    summary: 'Visit city hall before 10 AM with required documents for shorter wait times.',
    category: 'city-hall',
    author: 'Sarah M.',
    rating: 4.8,
    votes: 24,
    created_at: '2024-01-15',
    visual_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20city%20hall%20entrance%20with%20people%20waiting%20in%20line%20early%20morning&image_size=landscape_4_3',
    japanese_terms: [
      { term: '市役所', reading: 'shiyakusho', meaning: 'city hall' },
      { term: '住民票', reading: 'jūminhyō', meaning: 'residence certificate' }
    ]
  },
  {
    id: '2',
    title: 'Japan Post Bank for Foreigners',
    content: 'Japan Post Bank is the most foreigner-friendly bank. They have English forms and patient staff. You can open an account with just your residence card and passport.',
    summary: 'Japan Post Bank offers English support and easy account opening for foreigners.',
    category: 'banking',
    author: 'Mike T.',
    rating: 4.6,
    votes: 18,
    created_at: '2024-01-14',
    visual_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Japan%20Post%20Bank%20branch%20with%20friendly%20staff%20helping%20foreign%20customer&image_size=landscape_4_3',
    japanese_terms: [
      { term: 'ゆうちょ銀行', reading: 'yūcho ginkō', meaning: 'Japan Post Bank' },
      { term: '口座開設', reading: 'kōza kaisetsu', meaning: 'account opening' }
    ]
  },
  {
    id: '3',
    title: 'Garbage Day Survival Guide',
    content: 'Learn your local garbage schedule immediately! Different areas have different days for different types of trash. Ask your neighbors or check the local ward office website.',
    summary: 'Master your local garbage schedule by checking with neighbors or ward office.',
    category: 'living',
    author: 'Emma K.',
    rating: 4.9,
    votes: 31,
    created_at: '2024-01-13',
    visual_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Japanese%20residential%20street%20with%20organized%20garbage%20collection%20bins&image_size=landscape_4_3',
    japanese_terms: [
      { term: 'ゴミ', reading: 'gomi', meaning: 'garbage' },
      { term: '分別', reading: 'bunbetsu', meaning: 'sorting/separation' }
    ]
  }
];

export default function Community() {
  const { user, token } = useAuthStore();
  const [tips, setTips] = useState<Tip[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDiscussModal, setShowDiscussModal] = useState(false);
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTip, setNewTip] = useState({
    title: '',
    content: '',
    category: 'living'
  });
  
  // State for expanded summaries
  const [expandedSummaries, setExpandedSummaries] = useState<Set<string>>(new Set());

  const [likedTips, setLikedTips] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTips();
  }, []);

  const toggleSummaryExpansion = (tipId: string) => {
    setExpandedSummaries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tipId)) {
        newSet.delete(tipId);
      } else {
        newSet.add(tipId);
      }
      return newSet;
    });
  };

  const loadTips = async () => {
    try {
      const response = await fetch('/api/tips', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (response.ok) {
        const data = await response.json();
        const tipsData = data.tips || [];
        
        // Map the API response to match our Tip interface
        const mappedTips = tipsData.map((tip: any) => ({
          id: tip.id,
          title: tip.title,
          content: tip.content,
          summary: tip.summary || tip.content.substring(0, 100) + '...',
          category: tip.category,
          author: tip.author,
          rating: tip.averageRating || 0,
          votes: tip.ratingCount || 0,
          created_at: tip.created_at,
          visual_url: tip.visual_url,
          user_id: tip.user_id,
          rating_count: tip.ratingCount,
          average_rating: tip.averageRating,
          likeCount: tip.likeCount || 0,
          isLiked: false // Will be updated based on user's ratings
        }));
        
        setTips(mappedTips);
      } else {
        // Fallback to mock data if API fails
        setTips(mockTips);
      }
    } catch (error) {
      console.error('Failed to load tips:', error);
      setTips(mockTips);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTips = tips.filter(tip => {
    const matchesCategory = selectedCategory === 'all' || tip.category === selectedCategory;
    const matchesSearch = tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tip.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubmitTip = async () => {
    if (!user) {
      toast.error('Please login to share tips');
      return;
    }

    if (!newTip.title.trim() || !newTip.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/tips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTip.title,
          content: newTip.content,
          category: newTip.category
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Your tip has been shared successfully!');
        setNewTip({ title: '', content: '', category: 'living' });
        setShowShareModal(false);
        // Reload tips to show the new one
        await loadTips();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to share tip');
      }
    } catch (error) {
      console.error('Error sharing tip:', error);
      toast.error('Failed to share tip. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (tipId: string) => {
    if (!user) {
      toast.error('Please login to like');
      return;
    }

    // Prevent duplicate likes
    if (likedTips.has(tipId)) {
      toast.info('You have already liked this tip');
      return;
    }

    try {
      const response = await fetch(`/api/tips/${tipId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setLikedTips(prev => new Set([...prev, tipId]));
        
        // Reload tips to get updated like counts from server
        await loadTips();
        
        toast.success('Thanks for the like!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to like');
      }
    } catch (error) {
      console.error('Error liking:', error);
      toast.error('Failed to like. Please try again.');
    }
  };

  const handleRate = async (tipId: string, rating: number) => {
    if (!user) {
      toast.error('Please login to rate');
      return;
    }

    try {
      const response = await fetch(`/api/tips/${tipId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating })
      });

      if (response.ok) {
        // Reload tips to get updated ratings from server
        await loadTips();
        
        toast.success('Rating saved!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to rate');
      }
    } catch (error) {
      console.error('Error rating:', error);
      toast.error('Failed to rate. Please try again.');
    }
  };

  const handleDiscuss = async (tip: Tip) => {
    setSelectedTip(tip);
    setShowDiscussModal(true);
    
    // Load comments for this tip
    try {
      const response = await fetch(`/api/tips/${tip.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setSelectedTip(prev => prev ? {
          ...prev,
          comments: data.comments
        } : null);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!user || !selectedTip || !newComment.trim() || !token) {
      return;
    }

    try {
      const response = await fetch(`/api/tips/${selectedTip.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newComment.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add the new comment to the selected tip
        setSelectedTip(prev => prev ? {
          ...prev,
          comments: [...(prev.comments || []), data.comment]
        } : null);

        setNewComment('');
        toast.success('Comment added!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleShare = async (tip: Tip) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: tip.title,
          text: tip.summary,
          url: window.location.href
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${tip.title}\n\n${tip.summary}\n\n${window.location.href}`);
        toast.success('Tip copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share tip');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading community tips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <span className="text-6xl">👥</span>
              <div>
                <h1 className="text-4xl font-bold text-gray-800">Community Hub</h1>
                <p className="text-lg text-gray-600 mt-2">Share experiences, learn from others</p>
              </div>
            </div>
            {user && (
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <Plus size={20} />
                Share Your Tip
              </button>
            )}
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search tips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white/80 backdrop-blur-sm"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white/80 backdrop-blur-sm appearance-none cursor-pointer"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.emoji} {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{tips.length}</p>
                <p className="text-gray-600">Community Tips</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-pink-100 p-3 rounded-full">
                <Heart className="text-pink-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {tips.reduce((sum, tip) => sum + (tip.likeCount || 0), 0)}
                </p>
                <p className="text-gray-600">Total Likes</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-full">
                <Sparkles className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">AI Enhanced</p>
                <p className="text-gray-600">Smart Summaries</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTips.map(tip => (
            <div key={tip.id} className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 group">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-3 rounded-2xl border border-blue-200">
                    <span className="text-2xl">
                      {categories.find(c => c.id === tip.category)?.emoji || '✨'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{tip.title}</h3>
                    <p className="text-sm text-gray-500">by {tip.author} • {new Date(tip.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Likes */}
                  <div className="flex items-center gap-1 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                    <Heart className={`text-red-500 ${tip.isLiked ? 'fill-current' : ''}`} size={16} />
                    <span className="text-sm font-medium text-red-700">{tip.likeCount || 0}</span>
                  </div>
                  {/* Ratings */}
                  <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                    <Star className="text-yellow-500 fill-current" size={16} />
                    <span className="text-sm font-medium text-yellow-700">{(tip.average_rating || tip.rating || 0).toFixed(1)}</span>
                    <span className="text-xs text-yellow-600">({tip.rating_count || 0})</span>
                  </div>
                </div>
              </div>

              {/* AI Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="text-purple-600" size={16} />
                  <span className="text-sm font-semibold text-purple-700">AI Summary</span>
                </div>
                <div className="relative">
                  <div 
                    className={`text-sm text-gray-700 leading-relaxed transition-all duration-300 ease-in-out overflow-hidden ${
                      expandedSummaries.has(tip.id) ? 'max-h-none' : 'max-h-16'
                    }`}
                  >
                    <p className={expandedSummaries.has(tip.id) ? '' : 'line-clamp-3'}>
                      {expandedSummaries.has(tip.id) 
                        ? tip.content 
                        : (tip.summary || tip.content.substring(0, 150) + '...')
                      }
                    </p>
                  </div>
                  
                  {/* Read More/Less Button */}
                  {(tip.summary && tip.summary !== tip.content) || tip.content.length > 150 ? (
                    <button
                      onClick={() => toggleSummaryExpansion(tip.id)}
                      className="flex items-center gap-1 mt-2 text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors duration-200"
                    >
                      {expandedSummaries.has(tip.id) ? (
                        <>
                          <span>Read Less</span>
                          <ChevronUp size={14} />
                        </>
                      ) : (
                        <>
                          <span>Read More</span>
                          <ChevronDown size={14} />
                        </>
                      )}
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Content Preview */}
              <div className="mb-4">
                <p className="text-gray-700 leading-relaxed line-clamp-3">
                  {tip.content}
                </p>
              </div>

              {/* Visual Content */}
              {tip.visual_url && (
                <div className="mb-4 rounded-2xl overflow-hidden border border-gray-200">
                  <img 
                    src={tip.visual_url} 
                    alt={tip.title}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              {/* Japanese Terms */}
              {tip.japanese_terms && tip.japanese_terms.length > 0 && (
                <div className="mb-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🇯🇵</span>
                    <span className="text-sm font-semibold text-green-700">Key Japanese Terms</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tip.japanese_terms.slice(0, 3).map((term, index) => (
                      <div key={index} className="bg-white/80 px-3 py-1 rounded-full border border-green-300">
                        <span className="text-sm font-medium text-green-800">
                          {term.term} ({term.reading})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(tip.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 ${
                      likedTips.has(tip.id) || tip.isLiked
                        ? 'text-pink-600 bg-pink-50 border border-pink-200'
                        : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50 border border-gray-200'
                    }`}
                    disabled={likedTips.has(tip.id) || tip.isLiked}
                  >
                    <Heart size={16} className={likedTips.has(tip.id) || tip.isLiked ? 'fill-current' : ''} />
                    <span className="text-sm font-medium">{tip.likeCount || 0}</span>
                  </button>
                  <button 
                    onClick={() => handleDiscuss(tip)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full text-blue-600 hover:bg-blue-50 border border-blue-200 transition-all duration-200"
                  >
                    <MessageCircle size={16} />
                    <span className="text-sm font-medium">Discuss</span>
                  </button>
                  {tip.audio_url && (
                    <button className="flex items-center gap-2 px-3 py-2 rounded-full text-purple-600 hover:bg-purple-50 border border-purple-200 transition-all duration-200">
                      <Volume2 size={16} />
                      <span className="text-sm font-medium">Listen</span>
                    </button>
                  )}
                  {/* Rating Section */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleRate(tip.id, rating)}
                        className="text-yellow-400 hover:text-yellow-500 transition-colors"
                      >
                        <Star 
                          size={16} 
                          className={rating <= (tip.average_rating || 0) ? 'fill-current' : ''} 
                        />
                      </button>
                    ))}
                    <span className="text-sm text-gray-600 ml-1">
                      ({tip.rating_count || 0})
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => handleShare(tip)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full text-gray-600 hover:bg-gray-50 border border-gray-200 transition-all duration-200"
                >
                  <Share2 size={16} />
                  <span className="text-sm font-medium">Share</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredTips.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No tips found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or category filter</p>
            {user && (
              <button
                onClick={() => setShowShareModal(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200"
              >
                Be the first to share a tip!
              </button>
            )}
          </div>
        )}
      </div>

      {/* Share Tip Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Sparkles className="text-purple-600" />
                Share Your Tip
              </h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tip Title
                </label>
                <input
                  type="text"
                  value={newTip.title}
                  onChange={(e) => setNewTip(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Best time to visit city hall"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={newTip.category}
                  onChange={(e) => setNewTip(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  {categories.slice(1).map(category => (
                    <option key={category.id} value={category.id}>
                      {category.emoji} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Experience & Advice
                </label>
                <textarea
                  value={newTip.content}
                  onChange={(e) => setNewTip(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Share your experience and practical advice for other newcomers..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                />
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="text-purple-600" size={16} />
                  <span className="text-sm font-semibold text-purple-700">AI Enhancement</span>
                </div>
                <p className="text-sm text-gray-700">
                  Our AI will automatically generate a summary, create helpful visuals, 
                  and identify key Japanese terms to make your tip more helpful!
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 px-6 py-3 rounded-full border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitTip}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Share Tip'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discussion Modal */}
      {showDiscussModal && selectedTip && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <MessageCircle className="text-blue-600" />
                Discussion: {selectedTip.title}
              </h2>
              <button
                onClick={() => setShowDiscussModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Comments */}
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
              {selectedTip.comments && selectedTip.comments.length > 0 ? (
                selectedTip.comments.map(comment => (
                  <div key={comment.id} className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-800">{comment.author}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No comments yet. Be the first to start the discussion!</p>
                </div>
              )}
            </div>

            {/* Add Comment */}
            {user && (
              <div className="border-t pt-4">
                <div className="flex gap-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={3}
                    className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            )}

            {!user && (
              <div className="border-t pt-4 text-center">
                <p className="text-gray-600 mb-4">Please login to join the discussion</p>
                <Link
                  to="/login"
                  className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}