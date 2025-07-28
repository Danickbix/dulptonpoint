import React, { useState } from 'react';
import { Menu, X, ChevronDown, ChevronUp, Star, Shield, Users, Gift, PlayCircle, DollarSign, ArrowRight } from 'lucide-react';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { TasksPage } from './components/TasksPage';
import GamesPage from './components/GamesPage';
import { ProfilePage } from './components/ProfilePage';
import { useAuth } from './hooks/useAuth';
import type { User } from '@shared/schema';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentPage, setCurrentPage] = useState<'home' | 'dashboard' | 'tasks' | 'games' | 'profile'>('home');
  
  const { user, logout } = useAuth();

  // Show appropriate page if user is logged in
  if (user) {
    if (currentPage === 'tasks') {
      return <TasksPage setCurrentPage={setCurrentPage} />;
    }
    if (currentPage === 'games') {
      return <GamesPage setCurrentPage={setCurrentPage} />;
    }
    if (currentPage === 'profile') {
      return <ProfilePage setCurrentPage={setCurrentPage} />;
    }
    return <Dashboard setCurrentPage={setCurrentPage} />;
  }

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const faqData = [
    {
      question: "How do I earn $DULP tokens?",
      answer: "You can earn $DULP tokens by completing various tasks such as surveys, watching videos, downloading apps, and referring friends. Each task has a specific token reward that gets added to your account instantly."
    },
    {
      question: "What is the minimum withdrawal amount?",
      answer: "The minimum withdrawal amount is 1,000 $DULP tokens. Once you reach this threshold, you can withdraw your earnings to your crypto wallet or exchange them for other cryptocurrencies."
    },
    {
      question: "How long does it take to receive my rewards?",
      answer: "Most rewards are credited to your account instantly after task completion. Withdrawals typically process within 24-48 hours to ensure security and fraud prevention."
    },
    {
      question: "Is Dulpton Point available worldwide?",
      answer: "Yes, Dulpton Point is available globally. However, some specific offers and tasks may be region-restricted based on advertiser requirements and local regulations."
    },
    {
      question: "How do referrals work?",
      answer: "You'll receive 10% of all $DULP tokens earned by users you refer, plus a 500 token bonus when they complete their first task. Share your unique referral link to start earning passive income."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="card-dulpton border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img 
                  src="@assets/dulp_1753703955444.png" 
                  alt="Dulpton Point Logo" 
                  className="h-8 w-8 sm:h-10 sm:w-10 mr-2"
                />
                <span className="text-lg sm:text-2xl font-bold text-gradient-primary">
                  Dulpton Point
                </span>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-6 lg:ml-10 flex items-baseline space-x-2 lg:space-x-4">
                <a href="#how-it-works" className="text-muted-foreground hover:text-gradient-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  How It Works
                </a>
                <a href="#faq" className="text-muted-foreground hover:text-gradient-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  FAQ
                </a>
                {user ? (
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setCurrentPage(currentPage === 'dashboard' ? 'tasks' : 'dashboard')}
                      className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      {currentPage === 'dashboard' ? 'Tasks' : 'Dashboard'}
                    </button>
                    <span className="text-gray-700">Welcome, {(user as User).email || (user as User).displayName || 'User'}</span>
                    <button
                      onClick={logout}
                      className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-2 rounded-full text-sm font-medium hover:from-gray-700 hover:to-gray-800 transition-all duration-200 transform hover:scale-105"
                    >
                      Log Out
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => openAuthModal('login')}
                      className="btn-gradient-secondary px-4 lg:px-6 py-2 text-sm rounded-full"
                    >
                      Log In
                    </button>
                    <button
                      onClick={() => openAuthModal('signup')}
                      className="btn-gradient px-4 lg:px-6 py-2 text-sm rounded-full shadow-lg"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-purple-600 focus:outline-none"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden card-dulpton border-t border-white/10">
            <div className="px-3 pt-3 pb-4 space-y-2">
              <a href="#how-it-works" className="text-gray-700 hover:text-purple-600 block px-4 py-3 rounded-md text-base font-medium transition-colors">
                How It Works
              </a>
              <a href="#faq" className="text-gray-700 hover:text-purple-600 block px-4 py-3 rounded-md text-base font-medium transition-colors">
                FAQ
              </a>
              <div className="flex flex-col space-y-3 px-4 pt-3 border-t border-gray-100">
                {user ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => setCurrentPage(currentPage === 'dashboard' ? 'tasks' : 'dashboard')}
                      className="text-gray-700 hover:text-purple-600 block px-4 py-3 rounded-md text-base font-medium transition-colors text-left w-full"
                    >
                      {currentPage === 'dashboard' ? 'View Tasks' : 'View Dashboard'}
                    </button>
                    <p className="text-gray-700 text-sm">Welcome, {(user as User).email || (user as User).displayName || 'User'}</p>
                    <button
                      onClick={logout}
                      className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-full text-sm font-medium w-full"
                    >
                      Log Out
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => openAuthModal('login')}
                      className="btn-gradient-secondary px-6 py-3 rounded-full text-sm w-full"
                    >
                      Log In
                    </button>
                    <button
                      onClick={() => openAuthModal('signup')}
                      className="btn-gradient px-6 py-3 rounded-full text-sm shadow-lg w-full"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-primary">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-32">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 drop-shadow-2xl leading-tight">
              High-Paying
              <span className="block mt-1 sm:mt-2 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent drop-shadow-lg">
                $DULP Rewards
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-2">
              Earn points daily by completing simple tasks
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 px-4">
              {user ? (
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-center w-full sm:w-auto">
                  <p className="text-white text-base sm:text-lg mb-2">Welcome back!</p>
                  <p className="text-white/80 text-sm sm:text-base">Ready to earn more $DULP tokens?</p>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="bg-white text-purple-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 shadow-xl flex items-center justify-center w-full sm:w-auto"
                  >
                    Sign Up Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="bg-transparent border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-white hover:text-purple-600 transition-all duration-200 transform hover:scale-105 w-full sm:w-auto"
                  >
                    Log In
                  </button>
                </>
              )}
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 max-w-sm sm:max-w-md mx-auto">
              <p className="text-white/90 text-xs sm:text-sm mb-2">Yesterday's Community Earnings</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">$24,567 DULP</p>
              <p className="text-white/80 text-xs sm:text-sm mt-2">Join 150,000+ active earners worldwide</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 opacity-70">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-green-600" />
              <span className="text-sm sm:text-base text-gray-600 font-medium">Secure Platform</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600" />
              <span className="text-sm sm:text-base text-gray-600 font-medium">150K+ Users</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-yellow-500" />
              <span className="text-sm sm:text-base text-gray-600 font-medium">4.8/5 Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              How It Works
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-2">
              Start earning $DULP tokens in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 sm:p-8 mb-4 sm:mb-6 transform group-hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                <Users className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-white mx-auto mb-3 sm:mb-4" />
                <div className="bg-white/20 rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center mx-auto">
                  <span className="text-white font-bold">1</span>
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Sign Up</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2">
                Create your free account in under 30 seconds. No fees, no commitments.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-pink-500 to-orange-500 rounded-2xl p-6 sm:p-8 mb-4 sm:mb-6 transform group-hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                <PlayCircle className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-white mx-auto mb-3 sm:mb-4" />
                <div className="bg-white/20 rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center mx-auto">
                  <span className="text-white font-bold">2</span>
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Earn Points</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2">
                Complete surveys, watch videos, and refer friends to earn $DULP tokens.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-6 sm:p-8 mb-4 sm:mb-6 transform group-hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                <DollarSign className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-white mx-auto mb-3 sm:mb-4" />
                <div className="bg-white/20 rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center mx-auto">
                  <span className="text-white font-bold">3</span>
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Cash Out</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2">
                Withdraw your earnings to your crypto wallet or exchange for other tokens.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 text-center">
            <div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">150K+</div>
              <div className="text-sm sm:text-base text-purple-100">Active Users</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">$2.4M</div>
              <div className="text-sm sm:text-base text-purple-100">Tokens Earned</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">500K+</div>
              <div className="text-sm sm:text-base text-purple-100">Tasks Completed</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">4.8★</div>
              <div className="text-sm sm:text-base text-purple-100">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 px-2">
              Everything you need to know about earning $DULP tokens
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {faqData.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-4 sm:px-6 py-4 sm:py-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span className="text-base sm:text-lg font-semibold text-gray-900 pr-4">{faq.question}</span>
                  {openFaqIndex === index ? (
                    <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {openFaqIndex === index && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 drop-shadow-lg">
            Ready to Start Earning?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 leading-relaxed px-2">
            Join thousands of users already earning $DULP tokens daily
          </p>
        {user ? (
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 max-w-md mx-auto">
            <p className="text-white text-lg sm:text-xl mb-2">You're all set!</p>
            <p className="text-white/80 text-sm sm:text-base">Start completing tasks to earn $DULP tokens</p>
          </div>
        ) : (
          <button
            onClick={() => openAuthModal('signup')}
            className="bg-white text-purple-600 px-8 sm:px-10 py-3 sm:py-4 rounded-full text-lg sm:text-xl font-semibold hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 shadow-xl"
          >
            Get Started Now
          </button>
        )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="sm:col-span-2 md:col-span-2">
              <div className="flex items-center mb-4">
                <Gift className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400 mr-2" />
                <span className="text-xl sm:text-2xl font-bold">Dulpton Point</span>
              </div>
              <p className="text-sm sm:text-base text-gray-400 mb-4 leading-relaxed">
                The premier platform for earning cryptocurrency rewards through simple, engaging tasks.
              </p>
            </div>
            
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Platform</h4>
              <ul className="space-y-2 text-sm sm:text-base text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Referral Program</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Earn More</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Support</h4>
              <ul className="space-y-2 text-sm sm:text-base text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
            <p className="text-xs sm:text-sm text-gray-400">
              © 2025 Dulpton Point. All rights reserved. | Earn crypto rewards safely and securely.
            </p>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onSwitchMode={setAuthMode}
      />
    </div>
  );
}

export default App;