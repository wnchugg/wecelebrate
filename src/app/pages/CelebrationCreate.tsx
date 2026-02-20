import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useSite } from '../context/SiteContext';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { toast } from 'sonner';
import { Gift, Calendar, ArrowLeft, Send, Mail } from 'lucide-react';

// eCard templates with unique designs
const eCardTemplates = [
  {
    id: 'confetti',
    name: 'Confetti Celebration',
    icon: '🎊',
    color: '#FF6B9D',
    gradient: 'linear-gradient(135deg, #FF6B9D 0%, #FFD93D 100%)',
    pattern: 'confetti',
    description: 'Bright and festive with confetti bursts',
  },
  {
    id: 'starlight',
    name: 'Starlight Achievement',
    icon: '🌟',
    color: '#6C5CE7',
    gradient: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
    pattern: 'stars',
    description: 'Elegant purple with twinkling stars',
  },
  {
    id: 'heartfelt',
    name: 'Heartfelt Thanks',
    icon: '💙',
    color: '#00B4CC',
    gradient: 'linear-gradient(135deg, #00B4CC 0%, #FFD93D 100%)',
    pattern: 'hearts',
    description: 'Warm cyan to yellow gradient',
  },
  {
    id: 'balloons',
    name: 'Balloon Party',
    icon: '🎈',
    color: '#FD79A8',
    gradient: 'linear-gradient(135deg, #FD79A8 0%, #FDCB6E 100%)',
    pattern: 'balloons',
    description: 'Playful pink with floating balloons',
  },
  {
    id: 'excellence',
    name: 'Excellence Award',
    icon: '✨',
    color: '#D91C81',
    gradient: 'linear-gradient(135deg, #D91C81 0%, #1B2A5E 100%)',
    pattern: 'sparkles',
    description: 'Bold magenta to blue gradient',
  },
  {
    id: 'champion',
    name: 'Champion Spirit',
    icon: '🏆',
    color: '#1B2A5E',
    gradient: 'linear-gradient(135deg, #1B2A5E 0%, #00B4CC 100%)',
    pattern: 'trophy',
    description: 'Professional blue gradient',
  },
  {
    id: 'floral',
    name: 'Floral Appreciation',
    icon: '🌸',
    color: '#FF6B9D',
    gradient: 'linear-gradient(135deg, #FF6B9D 0%, #FFFFFF 100%)',
    pattern: 'floral',
    description: 'Soft pink with floral accents',
  },
  {
    id: 'outstanding',
    name: 'Outstanding Achievement',
    icon: '⭐',
    color: '#00B4CC',
    gradient: 'linear-gradient(135deg, #00B4CC 0%, #0066CC 100%)',
    pattern: 'shine',
    description: 'Dynamic blue gradient',
  },
];

export function CelebrationCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentSite: site } = useSite();
  
  const [step, setStep] = useState<'select' | 'compose' | 'preview' | 'success'>('select');
  const [selectedCard, setSelectedCard] = useState<typeof eCardTemplates[0] | null>(null);
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderRole, setSenderRole] = useState<'peer' | 'manager' | 'external'>('peer');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [celebrationId, setCelebrationId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Mock recipient data (would come from API)
  const recipientData = {
    name: 'Sarah Johnson',
    milestone: '5 Year Anniversary',
    date: 'March 15, 2024',
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCard || !message || !senderName) {
      toast.error('Please complete all required fields');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const response = await fetch(
        `https://us-central1-make-server-6fcaeea3.cloudfunctions.net/public/celebrations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Environment-ID': projectId,
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            recipientId: 'EMP001',
            recipientName: recipientData.name,
            milestoneId: 'anniversary-5',
            milestoneName: recipientData.milestone,
            message,
            eCardId: selectedCard.id,
            eCardImage: selectedCard.gradient,
            from: senderName,
            fromEmail: '', // Could add email field if needed
            visibility: 'public',
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to create celebration');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCelebrationId(data.celebration.id);
        toast.success('Celebration created successfully!');
        setStep('success');
      } else {
        throw new Error(data.error || 'Failed to create celebration');
      }
    } catch (error: any) {
      console.error('Error creating celebration:', error);
      toast.error(error.message || 'Failed to create celebration');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    const link = celebrationId 
      ? `${window.location.origin}/celebration?id=${celebrationId}`
      : `${window.location.origin}/celebrate/EMP001/anniversary-5`;
    void navigator.clipboard.writeText(link);
    setCopiedLink(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendInvite = async () => {
    if (!inviteEmail || !celebrationId) {
      toast.error('Please enter an email address');
      return;
    }
    
    try {
      const response = await fetch(
        `https://us-central1-make-server-6fcaeea3.cloudfunctions.net/public/celebrations/${celebrationId}/invite`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Environment-ID': projectId,
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email: inviteEmail }),
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to send invitation');
      }
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Invitation sent to ${inviteEmail}`);
        setInviteEmail('');
        setShowInviteModal(false);
      } else {
        throw new Error(data.error || 'Failed to send invitation');
      }
    } catch (error: any) {
      console.error('Error sending invite:', error);
      toast.error(error.message || 'Failed to send invitation');
    }
  };

  // Step 1: Select eCard
  if (step === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50">
        {/* Celebration Banner */}
        <div className="bg-gradient-to-r from-[#D91C81] to-[#1B2A5E] text-white py-8 px-4 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-3">
              <Gift className="w-10 h-10" />
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold">{recipientData.name}</h2>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <Calendar className="w-5 h-5" />
                  <p className="text-xl text-white/90">{recipientData.milestone} • {recipientData.date}</p>
                </div>
              </div>
              <Gift className="w-10 h-10" />
            </div>
            <p className="text-center text-white/80 text-sm">You're invited to share your congratulations</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm mb-4">
              <Gift className="w-5 h-5 text-[#D91C81]" />
              <span className="text-sm font-medium text-gray-700">Step 1 of 3</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Choose Your eCard
            </h1>
            <p className="text-xl text-gray-600">
              Select a design that expresses your appreciation
            </p>
          </div>

          {/* eCard Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {eCardTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  setSelectedCard(template);
                  setStep('compose');
                }}
                className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 text-left"
              >
                {/* eCard Preview */}
                <div
                  className="w-full h-48 rounded-xl flex flex-col items-center justify-center text-white font-bold text-2xl mb-4 overflow-hidden relative"
                  style={{ background: template.gradient }}
                >
                  {/* Pattern overlay */}
                  <div className="absolute inset-0 opacity-20">
                    {template.pattern === 'confetti' && (
                      <div className="absolute inset-0">
                        {Array.from({ length: 20 }).map((_, i) => (
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
                    {template.pattern === 'stars' && (
                      <div className="absolute inset-0">
                        {Array.from({ length: 15 }).map((_, i) => (
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
                    {template.pattern === 'hearts' && (
                      <div className="absolute inset-0">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div
                            key={i}
                            className="absolute text-white text-2xl"
                            style={{
                              left: `${Math.random() * 100}%`,
                              top: `${Math.random() * 100}%`,
                            }}
                          >
                            ♥
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <span className="text-6xl mb-3 relative z-10">{template.icon}</span>
                  <span className="text-lg relative z-10">{template.name}</span>
                </div>

                {/* Template Info */}
                <h3 className="font-bold text-gray-900 mb-1">{template.name}</h3>
                <p className="text-sm text-gray-600">{template.description}</p>

                {/* Hover effect */}
                <div className="absolute inset-0 rounded-2xl border-4 border-[#D91C81] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </button>
            ))}
          </div>

          {/* Back Button */}
          <div className="text-center">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900 font-medium inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Compose Message
  if (step === 'compose') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm mb-4">
              <Gift className="w-5 h-5 text-[#D91C81]" />
              <span className="text-sm font-medium text-gray-700">Step 2 of 3</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Write Your Message
            </h1>
            <p className="text-lg text-gray-600">
              For {recipientData.name}'s {recipientData.milestone}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Your Details</h2>
              
              {/* Sender Name */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D91C81] focus:ring focus:ring-pink-100 transition-colors"
                  required
                />
              </div>

              {/* Sender Role */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Relationship *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'peer', label: 'Colleague' },
                    { value: 'manager', label: 'Manager' },
                    { value: 'external', label: 'External' },
                  ].map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setSenderRole(role.value as any)}
                      className={`px-4 py-3 rounded-xl font-medium transition-all ${
                        senderRole === role.value
                          ? 'bg-[#D91C81] text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Message *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share your congratulations and appreciation..."
                  rows={6}
                  maxLength={500}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D91C81] focus:ring focus:ring-pink-100 transition-colors resize-none"
                  required
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  {message.length}/500 characters
                </div>
              </div>

              {/* Photo Upload */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Add a Photo (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D91C81] transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#D91C81] file:text-white file:font-medium hover:file:bg-[#C01872] file:cursor-pointer"
                />
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="mt-4 w-full h-40 object-cover rounded-xl"
                  />
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('select')}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep('preview')}
                  disabled={!senderName || !message}
                  className="flex-1 px-6 py-3 bg-[#D91C81] text-white rounded-xl font-semibold hover:bg-[#C01872] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Preview
                </button>
              </div>
            </div>

            {/* eCard Preview */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Card Preview</h2>
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <div
                  className="w-full h-64 rounded-xl flex flex-col items-center justify-center text-white font-bold text-2xl mb-6 relative overflow-hidden"
                  style={{ background: selectedCard?.gradient }}
                >
                  {/* Pattern overlay */}
                  <div className="absolute inset-0 opacity-20">
                    {selectedCard?.pattern === 'confetti' && (
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
                    {selectedCard?.pattern === 'stars' && (
                      <div className="absolute inset-0">
                        {Array.from({ length: 20 }).map((_, i) => (
                          <div
                            key={i}
                            className="absolute text-white text-2xl"
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

                  <span className="text-6xl mb-3 relative z-10">{selectedCard?.icon}</span>
                  <span className="text-xl relative z-10">{selectedCard?.name}</span>
                </div>

                <div className="text-center text-sm text-gray-500">
                  Selected: <span className="font-semibold text-gray-700">{selectedCard?.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Preview
  if (step === 'preview') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm mb-4">
              <Gift className="w-5 h-5 text-[#D91C81]" />
              <span className="text-sm font-medium text-gray-700">Step 3 of 3</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Preview Your Message
            </h1>
            <p className="text-lg text-gray-600">
              Here's how it will appear on the celebration wall
            </p>
          </div>

          {/* Preview Card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8">
            {/* eCard */}
            <div
              className="w-full h-64 flex flex-col items-center justify-center text-white font-bold text-3xl relative overflow-hidden"
              style={{ background: selectedCard?.gradient }}
            >
              {/* Pattern overlay */}
              <div className="absolute inset-0 opacity-20">
                {selectedCard?.pattern === 'confetti' && (
                  <div className="absolute inset-0">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-3 h-3 bg-white rounded-full"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          transform: `rotate(${Math.random() * 360}deg)`,
                        }}
                      />
                    ))}
                  </div>
                )}
                {selectedCard?.pattern === 'stars' && (
                  <div className="absolute inset-0">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute text-white text-3xl"
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

              <span className="text-7xl mb-4 relative z-10">{selectedCard?.icon}</span>
              <span className="text-2xl relative z-10">{selectedCard?.name}</span>
            </div>

            {/* Message Content */}
            <div className="p-8">
              {/* Message Text */}
              <p className="text-gray-700 text-lg leading-relaxed mb-6 italic">
                "{message}"
              </p>

              {/* Photo */}
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Attached"
                  className="w-full h-64 object-cover rounded-xl mb-6"
                />
              )}

              {/* Sender Info */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                <div className="w-12 h-12 bg-[#D91C81] rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {senderName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{senderName}</p>
                  <p className="text-gray-600 text-sm capitalize">
                    {senderRole === 'peer' ? 'Colleague' : senderRole === 'manager' ? 'Manager' : 'External Partner'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => setStep('compose')}
              className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Edit Message
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-6 py-4 bg-[#D91C81] text-white rounded-xl font-semibold hover:bg-[#C01872] transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Send Message
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Success
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Gift className="w-12 h-12 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Message Sent! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your celebration message has been added to {recipientData.name}'s wall.
          </p>

          {/* Invite Others Section */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Gift className="w-6 h-6 text-[#D91C81]" />
              <h2 className="text-2xl font-bold text-gray-900">
                Invite Others to Celebrate
              </h2>
            </div>
            <p className="text-gray-600 mb-6">
              Help make this milestone even more special by inviting colleagues to share their messages too!
            </p>

            {/* Invite Options */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-[#D91C81] text-[#D91C81] rounded-xl font-semibold hover:bg-pink-50 transition-colors"
              >
                {copiedLink ? (
                  <>
                    <Gift className="w-5 h-5" />
                    Link Copied!
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Copy Link
                  </>
                )}
              </button>

              {/* Send Email */}
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center justify-center gap-3 px-6 py-4 bg-[#D91C81] text-white rounded-xl font-semibold hover:bg-[#C01872] transition-colors"
              >
                <Mail className="w-5 h-5" />
                Send Email
              </button>
            </div>
          </div>

          {/* Done Button */}
          <button
            onClick={() => navigate('/')}
            className="w-full px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            Done
          </button>
        </div>

        {/* Email Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Send Invitation Email
              </h3>
              <p className="text-gray-600 mb-6">
                Enter the email address of someone you'd like to invite to celebrate {recipientData.name}.
              </p>
              
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D91C81] focus:ring focus:ring-pink-100 transition-colors mb-6"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendInvite}
                  disabled={!inviteEmail}
                  className="flex-1 px-6 py-3 bg-[#D91C81] text-white rounded-xl font-semibold hover:bg-[#C01872] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CelebrationCreate;