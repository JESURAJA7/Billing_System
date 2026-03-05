import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, FileText, BarChart3, Menu, X, Clock } from 'lucide-react';
import ExchangeBill from './bills/ExchangeBill';
import RetailBill from './bills/RetailBill';
import ServiceBill from './bills/ServiceBill';
import WholesaleBill from './bills/WholesaleBill';
import Reports from './Reports';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('exchange');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [now, setNow] = useState(new Date());
  const { signOut } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = now.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const tabs = [
    { id: 'exchange', label: 'Exchange Bill', icon: FileText },
    { id: 'retail', label: 'Retail Bill', icon: FileText },
    { id: 'service', label: 'Service Bill', icon: FileText },
    { id: 'wholesale', label: 'Wholesale Bill', icon: FileText },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'exchange':
        return <ExchangeBill />;
      case 'retail':
        return <RetailBill />;
      case 'service':
        return <ServiceBill />;
      case 'wholesale':
        return <WholesaleBill />;
      case 'reports':
        return <Reports />;
      default:
        return <ExchangeBill />;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #f0f9ff 50%, #e0f2fe 100%)' }}>
      <style>{`
        @keyframes mstGoldShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes mstGoldPulse {
          0%, 100% { text-shadow: 0 0 8px rgba(212,175,55,0.6), 0 0 20px rgba(212,175,55,0.3); }
          50%       { text-shadow: 0 0 18px rgba(212,175,55,0.9), 0 0 40px rgba(212,175,55,0.5), 0 0 60px rgba(255,215,0,0.3); }
        }
        .mst-gold-text {
          background: linear-gradient(90deg, #b8860b 0%, #d4af37 20%, #ffd700 40%, #fffacd 50%, #ffd700 60%, #d4af37 80%, #b8860b 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: mstGoldShimmer 3s linear infinite, mstGoldPulse 2.5s ease-in-out infinite;
          font-weight: 800;
          letter-spacing: 0.04em;
        }
      `}</style>

      {/* Glassmorphism Navbar */}
      <nav style={{
        background: 'rgba(255, 255, 255, 0.55)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: '0 4px 24px rgba(99, 102, 241, 0.12), 0 1px 4px rgba(0,0,0,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Left — Logo */}
            <div className="flex items-center gap-2">
              {/* <div style={{
                background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                borderRadius: '10px',
                padding: '6px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)',
              }}>
               
              </div> */}
              <span className="text-xl mst-gold-text">
                MST Gold
              </span>
            </div>

            {/* Right — Date/Time + Sign Out */}
            <div className="hidden md:flex items-center gap-3">

              {/* Glass datetime pill */}
              <div style={{
                background: 'rgba(255,255,255,0.5)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: '999px',
                padding: '6px 16px',
                boxShadow: '0 2px 12px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.7)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <Clock className="w-4 h-4 flex-shrink-0" style={{ color: '#6366f1' }} />
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-bold tabular-nums" style={{ color: '#4f46e5' }}>
                    {formattedTime}
                  </span>
                  <span className="text-xs font-medium" style={{ color: '#6b7280' }}>
                    {formattedDate}
                  </span>
                </div>
              </div>

              {/* Glass sign out button */}
              <button
                onClick={handleSignOut}
                style={{
                  background: 'rgba(255,255,255,0.45)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.5)',
                  borderRadius: '10px',
                  padding: '7px 16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.12)';
                  (e.currentTarget as HTMLButtonElement).style.color = '#4f46e5';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.45)';
                  (e.currentTarget as HTMLButtonElement).style.color = '#374151';
                }}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>

            {/* Mobile — Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.5)' }}
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.3)' }}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.3)' }}
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Premium Glassmorphism Gold Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.45)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '20px',
          border: '1.5px solid rgba(212, 175, 55, 0.45)',
          boxShadow: [
            '0 8px 40px rgba(212, 175, 55, 0.18)',
            '0 2px 8px rgba(0,0,0,0.08)',
            'inset 0 1px 0 rgba(255,255,255,0.75)',
            'inset 0 -1px 0 rgba(212,175,55,0.12)',
          ].join(', '),
          overflow: 'hidden',
          position: 'relative',
        }}>

          {/* Inner gold shimmer top-left highlight */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.6) 40%, rgba(245,226,122,0.8) 60%, transparent 100%)',
          }} />

          {/* Tab Bar */}
          <div style={{
            borderBottom: '1px solid rgba(212,175,55,0.2)',
            overflowX: 'auto',
            background: 'rgba(255,255,255,0.3)',
          }}>
            <nav className="flex -mb-px">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="whitespace-nowrap"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '14px 24px',
                      fontSize: '14px',
                      fontWeight: isActive ? 600 : 500,
                      borderBottom: isActive
                        ? '2.5px solid #D4AF37'
                        : '2.5px solid transparent',
                      color: isActive ? '#B8860B' : '#6b7280',
                      background: isActive
                        ? 'linear-gradient(180deg, rgba(212,175,55,0.08) 0%, transparent 100%)'
                        : 'transparent',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      textShadow: isActive ? '0 0 12px rgba(212,175,55,0.4)' : 'none',
                      gap: '6px',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLButtonElement).style.color = '#92400e';
                        (e.currentTarget as HTMLButtonElement).style.borderBottomColor = 'rgba(212,175,55,0.4)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        (e.currentTarget as HTMLButtonElement).style.color = '#6b7280';
                        (e.currentTarget as HTMLButtonElement).style.borderBottomColor = 'transparent';
                      }
                    }}
                  >
                    <Icon style={{ width: '15px', height: '15px', color: isActive ? '#D4AF37' : 'currentColor' }} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div style={{ padding: '28px 24px' }}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
