import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Sparkles, Gift, Heart, Star, Calendar, MapPin, Users, ArrowRight, Award, Loader2, Filter, MessageCircle, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { getCurrentEnvironment } from '../config/deploymentEnvironments';

// Role color mapping
const roleColors = {
  peer: 'bg-blue-100 text-blue-700',
  manager: 'bg-purple-100 text-purple-700',
  external: 'bg-green-100 text-green-700',
  leadership: 'bg-red-100 text-red-700',
};

const roleLabels = {
  peer: 'Colleague',
  manager: 'Manager',
  external: 'External Partner',
  leadership: 'Leadership',
};

interface Message {
  id: string;
  senderName: string;
  senderRole: 'peer' | 'manager' | 'external' | 'leadership';
  message: string;
  createdAt: string;
  photoUrl?: string;
  eCardColor: string;
  eCardGradient: string;
  eCardIcon: string;
  eCardText: string;
}

interface Milestone {
  id: string;
  title: string;
  date: string;
  type: 'anniversary' | 'achievement' | 'retirement';
  yearsOfService?: number;
  messages: Message[];
}

export function Celebration() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const environment = getCurrentEnvironment();
        const response = await fetch(`${environment.apiBaseUrl}/milestones/${user?.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch milestones');
        }
        const data: Milestone[] = await response.json();
        setMilestones(data);
      } catch (error) {
        toast.error('Failed to load milestones');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchMilestones();
    }
  }, [user?.id]);

  const activeMilestone = selectedMilestone 
    ? milestones.find(m => m.id === selectedMilestone) 
    : milestones[0];

  const filteredMessages = activeMilestone?.messages.filter(msg => 
    filterRole === 'all' || msg.senderRole === filterRole
  ) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="text-white py-16 px-6"
        style={{
          background: 'linear-gradient(135deg, #D91C81 0%, #1B2A5E 100%)',
        }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">My Celebrations</h1>
              <p className="text-white/90 text-lg mt-2">
                View all the wonderful messages from your milestones
              </p>
            </div>
          </div>

          {/* Milestone Selector */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {milestones.map((milestone) => (
              <button
                key={milestone.id}
                onClick={() => setSelectedMilestone(milestone.id)}
                className={`flex-shrink-0 px-6 py-3 rounded-xl font-semibold transition-all ${
                  (selectedMilestone === milestone.id || (!selectedMilestone && milestone.id === milestones[0].id))
                    ? 'bg-white text-[#D91C81] shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <div className="text-left">
                  <div className="font-bold">{milestone.title}</div>
                  <div className="text-sm opacity-90">
                    {milestone.messages.length} {milestone.messages.length === 1 ? 'message' : 'messages'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <Loader2 className="w-10 h-10 animate-spin text-gray-500" />
          </div>
        ) : (
          <>
            {/* Milestone Info & Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Milestone Details */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {activeMilestone.title}
                  </h2>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{activeMilestone.date}</span>
                    {activeMilestone.yearsOfService && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm font-semibold">
                          {activeMilestone.yearsOfService} Years of Service
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-3">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-[#D91C81] focus:ring focus:ring-pink-100 transition-colors"
                  >
                    <option value="all">All Messages</option>
                    <option value="peer">Colleagues</option>
                    <option value="manager">Managers</option>
                    <option value="leadership">Leadership</option>
                    <option value="external">External</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-6">
              {filteredMessages.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    No messages found for this filter
                  </p>
                </div>
              ) : (
                filteredMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* eCard Display */}
                    <div
                      className="h-48 flex flex-col items-center justify-center text-white font-bold text-2xl relative overflow-hidden"
                      style={{ background: msg.eCardGradient }}
                    >
                      {/* Pattern overlay based on eCard type */}
                      <div className="absolute inset-0 opacity-20">
                        {msg.eCardIcon === '🎊' && (
                          <div className="absolute inset-0">
                            {Array.from({ length: 30 }).map((_, i) => (
                              <div
                                key={i}
                                className="absolute w-2 h-2 bg-white rounded-full"
                                style={{
                                  left: `${Math.random() * 100}%`,
                                  top: `${Math.random() * 100}%`,
                                  transform: `rotate(${Math.random() * 360}deg)`,
                                }}
                              />
                            ))}
                          </div>
                        )}
                        {msg.eCardIcon === '🌟' && (
                          <div className="absolute inset-0">
                            {Array.from({ length: 20 }).map((_, i) => (
                              <div
                                key={i}
                                className="absolute text-white text-xl"
                                style={{
                                  left: `${Math.random() * 100}%`,
                                  top: `${Math.random() * 100}%`,
                                }}
                              >
                                ★
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <span className="text-6xl mb-3 relative z-10">{msg.eCardIcon}</span>
                      <span className="text-xl relative z-10">{msg.eCardText}</span>
                    </div>

                    {/* Message Content */}
                    <div className="p-6">
                      {/* Sender Info */}
                      <div className="flex items-start gap-4 mb-4">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                          style={{ backgroundColor: '#D91C81' }}
                        >
                          {msg.senderName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-gray-900">{msg.senderName}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${roleColors[msg.senderRole]}`}>
                              {roleLabels[msg.senderRole]}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(msg.createdAt).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Message Text */}
                      <p className="text-gray-700 text-lg leading-relaxed mb-4 italic">
                        "{msg.message}"
                      </p>

                      {/* Photo */}
                      {msg.photoUrl && (
                        <img
                          src={msg.photoUrl}
                          alt="Celebration"
                          className="rounded-xl w-full max-h-96 object-cover mb-4"
                        />
                      )}

                      {/* Like Button */}
                      <button className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors">
                        <Heart className="w-5 h-5" />
                        <span className="text-sm font-medium">Thank</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Empty State for No Messages */}
            {activeMilestone.messages.length === 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No Messages Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Be the first to leave a celebration message!
                </p>
                <button
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#D91C81] text-white rounded-xl font-semibold hover:bg-[#C01872] transition-colors"
                >
                  <Send className="w-5 h-5" />
                  Add Your Message
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Celebration;