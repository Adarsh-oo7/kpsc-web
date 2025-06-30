'use client'
import React, { useState, useEffect } from 'react';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// API Service
class ApiService {
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authentication token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // User Profile API
  static async getUserProfile() {
    return this.request('/user-profile/');
  }

  static async getUser() {
    return this.request('/user/');
  }

  // Exam & Question APIs
  static async getExams() {
    return this.request('/exams/');
  }

  static async getTopics() {
    return this.request('/topics/');
  }

  static async getQuestions(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/questions/${query ? '?' + query : ''}`);
  }

  // Progress & Bookmarks
  static async getUserProgress() {
    return this.request('/user-progress/');
  }

  static async getBookmarks() {
    return this.request('/bookmarks/');
  }

  static async getReports() {
    return this.request('/reports/');
  }

  // Daily Question
  static async getDailyQuestion() {
    return this.request('/daily-question/');
  }

  // Create a dashboard summary from existing data
  static async getDashboardSummary() {
    try {
      const [progress, bookmarks, reports, questions] = await Promise.all([
        this.getUserProgress().catch(() => null),
        this.getBookmarks().catch(() => []),
        this.getReports().catch(() => []),
        this.getQuestions().catch(() => [])
      ]);

      return {
        completed_tasks: progress?.quizzes_completed || 0,
        total_questions: progress?.total_questions || 0,
        total_score: progress?.total_score || 0,
        progress_percentage: progress ? Math.round((progress.total_score / progress.total_questions) * 100) || 0 : 0,
        bookmarks_count: bookmarks.length || 0,
        reports_count: reports.length || 0,
        available_questions: questions.length || 0,
        welcome_message: 'സ്വാഗതം! എന്താണ് ഇന്ന് പഠിക്കാൻ ആഗ്രഹിക്കുന്നത്?'
      };
    } catch (error) {
      console.error('Error creating dashboard summary:', error);
      return {
        completed_tasks: 0,
        total_questions: 0,
        total_score: 0,
        progress_percentage: 0,
        bookmarks_count: 0,
        reports_count: 0,
        available_questions: 0,
        welcome_message: 'സ്വാഗതം! എന്താണ് ഇന്ന് പഠിക്കാൻ ആഗ്രഹിക്കുന്നത്?'
      };
    }
  }
}

export default function HomePage() {
  // State Management
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sectionLoading, setSectionLoading] = useState(null);

  // Icon Components (SVG-based, no external dependencies)
  const CheckSquareIcon = () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const PlayIcon = () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h1m4 0h1M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );

  const TrendingUpIcon = () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );

  const BookOpenIcon = () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );

  const UserIcon = () => (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const Loader2Icon = () => (
    <svg className="w-8 h-8 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );

  const AlertCircleIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  // Section Configuration
  const sections = [
    {
      id: 'practical-tasks',
      title: 'പ്രായോഗിക\nപരീക്ഷകൾ',
      subtitle: 'Practice Questions',
      icon: CheckSquareIcon,
      bgColor: 'bg-emerald-600',
      hoverColor: 'hover:bg-emerald-700',
      action: () => handleSectionClick('practical-tasks')
    },
    {
      id: 'daily-question',
      title: 'ദൈനംദിന\nചോദ്യം',
      subtitle: 'Daily Question',
      icon: PlayIcon,
      bgColor: 'bg-teal-600',
      hoverColor: 'hover:bg-teal-700',
      action: () => handleSectionClick('daily-question')
    },
    {
      id: 'progress-tracking',
      title: 'പരീക്ഷാഫല\nവിശകലനം',
      subtitle: 'Progress Analysis',
      icon: TrendingUpIcon,
      bgColor: 'bg-green-600',
      hoverColor: 'hover:bg-green-700',
      action: () => handleSectionClick('progress-tracking')
    },
    {
      id: 'bookmarks',
      title: 'ബുക്ക്മാർക്കുകൾ\nഎന്റെ കുറിപ്പുകൾ',
      subtitle: 'Bookmarks & Notes',
      icon: BookOpenIcon,
      bgColor: 'bg-emerald-700',
      hoverColor: 'hover:bg-emerald-800',
      action: () => handleSectionClick('bookmarks')
    }
  ];

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load user profile and dashboard data in parallel
      const [userProfile, dashboardInfo] = await Promise.all([
        ApiService.getUserProfile(),
        ApiService.getDashboardSummary()
      ]);

      // Format user data for display
      const formattedUser = {
        greeting: `ലൈലാ, ${userProfile.user?.first_name || userProfile.user?.username || 'വിദ്യാർത്ഥി'}`,
        title: 'വിദ്യാർത്ഥിനി',
        subtitle: '(Hello, Student)',
        profile_image: userProfile.profile_image || null,
        preferred_topics: userProfile.preferred_topics || [],
        preferred_difficulty: userProfile.preferred_difficulty || 'medium'
      };

      setUser(formattedUser);
      setDashboardData(dashboardInfo);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle section clicks
  const handleSectionClick = async (sectionId) => {
    try {
      setSectionLoading(sectionId);
      
      // Handle different section types based on your Django backend
      switch (sectionId) {
        case 'practical-tasks':
          // Fetch questions for practice
          const questions = await ApiService.getQuestions();
          console.log('Available questions:', questions);
          // Navigate to questions page or show modal
          // window.location.href = '/questions';
          break;
        
        case 'daily-question':
          // Fetch daily question
          const dailyQuestion = await ApiService.getDailyQuestion();
          console.log('Daily question:', dailyQuestion);
          // Show daily question modal or navigate
          // window.location.href = '/daily-question';
          break;
        
        case 'progress-tracking':
          // Fetch user progress
          const progress = await ApiService.getUserProgress();
          console.log('User progress:', progress);
          // Navigate to progress page
          // window.location.href = '/progress';
          break;
        
        case 'bookmarks':
          // Fetch user bookmarks
          const bookmarks = await ApiService.getBookmarks();
          console.log('User bookmarks:', bookmarks);
          // Navigate to bookmarks page
          // window.location.href = '/bookmarks';
          break;
        
        default:
          console.log('Unknown section:', sectionId);
      }
    } catch (err) {
      console.error(`Error loading ${sectionId}:`, err);
      setError(`Failed to load ${sectionId}. Please try again.`);
    } finally {
      setSectionLoading(null);
    }
  };

  // Retry function
  const handleRetry = () => {
    loadInitialData();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-800 via-teal-800 to-green-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2Icon />
          <p className="text-white text-lg">ലോഡ് ചെയ്യുന്നു... Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-800 via-teal-800 to-green-900 flex items-center justify-center">
        <div className="text-center bg-white bg-opacity-10 rounded-2xl p-8 max-w-md mx-4">
          <div className="w-12 h-12 text-red-400 mx-auto mb-4">
            <AlertCircleIcon />
          </div>
          <h2 className="text-white text-xl font-semibold mb-2">എറർ / Error</h2>
          <p className="text-emerald-100 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            വീണ്ടും ശ്രമിക്കുക / Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-800 via-teal-800 to-green-900">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-600 bg-opacity-90 text-white p-3 text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5">
              <AlertCircleIcon />
            </div>
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 bg-white bg-opacity-20 px-3 py-1 rounded text-sm hover:bg-opacity-30"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="pt-12 pb-8 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Profile Section */}
          <div className="flex items-center space-x-4 mb-12">
            <div className="w-24 h-24 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg">
              {user?.profile_image ? (
                <img
                  src={user.profile_image}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-orange-400 rounded-full flex items-center justify-center">
                  <UserIcon />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {user?.greeting || 'ലൈലാ'},
              </h1>
              <h2 className="text-3xl font-semibold text-emerald-100">
                {user?.title || 'വിദ്യാർത്ഥിനി'}
              </h2>
              <p className="text-emerald-200 mt-1">
                {user?.subtitle || '(Hello, Student)'}
              </p>
            </div>
          </div>

          {/* Dashboard Stats */}
          {dashboardData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white bg-opacity-10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {dashboardData.completed_tasks || 0}
                </div>
                <div className="text-emerald-200 text-sm">പൂർത്തിയായത് / Completed</div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {dashboardData.total_questions || 0}
                </div>
                <div className="text-emerald-200 text-sm">ചോദ്യങ്ങൾ / Questions</div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {dashboardData.progress_percentage || 0}%
                </div>
                <div className="text-emerald-200 text-sm">പുരോഗതി / Progress</div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {dashboardData.bookmarks_count || 0}
                </div>
                <div className="text-emerald-200 text-sm">ബുക്ക്മാർക്കുകൾ / Bookmarks</div>
              </div>
            </div>
          )}

          {/* Main Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {sections.map((section, index) => {
              const IconComponent = section.icon;
              const isLoading = sectionLoading === section.id;
              
              return (
                <div
                  key={section.id}
                  onClick={section.action}
                  className={`${section.bgColor} ${section.hoverColor} rounded-3xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group relative ${
                    isLoading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    {/* Icon */}
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center group-hover:bg-opacity-30 transition-all duration-300">
                      {isLoading ? (
                        <Loader2Icon />
                      ) : (
                        <IconComponent />
                      )}
                    </div>
                    
                    {/* Title */}
                    <div>
                      <h3 className="text-2xl font-bold text-white leading-tight whitespace-pre-line">
                        {section.title}
                      </h3>
                      <p className="text-emerald-100 text-sm mt-2 opacity-80">
                        {section.subtitle}
                      </p>
                    </div>

                    {/* Count Badge */}
                    {dashboardData && dashboardData[section.id] && (
                      <div className="absolute top-4 right-4 bg-white bg-opacity-30 rounded-full w-8 h-8 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {dashboardData[section.id]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Welcome Message */}
          <div className="text-center mt-12">
            <div className="bg-white bg-opacity-10 rounded-2xl p-6 max-w-2xl mx-auto backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white mb-2">
                {dashboardData?.welcome_message || 'സ്വാഗതം! എന്താണ് ഇന്ന് പഠിക്കാൻ ആഗ്രഹിക്കുന്നത്?'}
              </h3>
              <p className="text-emerald-100 opacity-90">
                Welcome! What would you like to learn today?
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 text-center">
        <p className="text-emerald-300 opacity-70">
          നിങ്ങളുടെ പഠന യാത്ര തുടരൂ • Continue your learning journey
        </p>
      </div>
    </div>
  );
}