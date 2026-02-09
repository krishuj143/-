
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import { TabType, ResearchAnalysis } from './types';
import { fetchRajasthanCurrentAffairs, performDeepResearch, generateQuiz, getTrendingResearchTopics, speakSummary } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState<{text: string, sources: any[]}>({ text: '', sources: [] });
  const [newsPeriod, setNewsPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [researchTopic, setResearchTopic] = useState('');
  const [researchResult, setResearchResult] = useState<ResearchAnalysis | null>(null);
  const [quizText, setQuizText] = useState('');
  const [resourceFilter, setResourceFilter] = useState('All');
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadNews();
    }
    if (activeTab === 'research' && trendingTopics.length === 0) {
      getTrendingResearchTopics().then(setTrendingTopics);
    }
  }, [activeTab, newsPeriod]);

  const loadNews = async () => {
    setLoading(true);
    try {
      const data = await fetchRajasthanCurrentAffairs(newsPeriod);
      setNews(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResearch = async (topic: string) => {
    setResearchTopic(topic);
    setLoading(true);
    setResearchResult(null);
    setQuizText('');
    try {
      const result = await performDeepResearch(topic);
      setResearchResult(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAudioSummary = async () => {
    if (!researchResult || isSpeaking) return;
    setIsSpeaking(true);
    try {
      await speakSummary(researchResult.summary);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderDashboard = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-br from-indigo-700 via-orange-500 to-red-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-3xl font-black mb-2">Rajasthan Current Affairs</h3>
          <p className="opacity-90 max-w-xl text-lg font-medium">
            Stay updated with state-specific news, policy changes, and recruitment updates.
          </p>
          <div className="mt-8 flex items-center gap-3">
             <div className="bg-white/10 backdrop-blur-lg p-1 rounded-2xl flex border border-white/20">
                <button 
                  onClick={() => setNewsPeriod('weekly')}
                  className={`px-6 py-2.5 rounded-xl font-bold transition-all ${newsPeriod === 'weekly' ? 'bg-white text-orange-600 shadow-lg' : 'text-white hover:bg-white/5'}`}
                >
                  Weekly
                </button>
                <button 
                  onClick={() => setNewsPeriod('monthly')}
                  className={`px-6 py-2.5 rounded-xl font-bold transition-all ${newsPeriod === 'monthly' ? 'bg-white text-orange-600 shadow-lg' : 'text-white hover:bg-white/5'}`}
                >
                  Monthly
                </button>
             </div>
             <button 
               onClick={loadNews} 
               disabled={loading}
               className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/20"
             >
                <i className={`fa-solid fa-arrows-rotate ${loading ? 'animate-spin' : ''}`}></i>
             </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none select-none">
          <i className="fa-solid fa-landmark-dome text-[200px]"></i>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[32px] shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
            <h4 className="text-xl font-bold flex items-center gap-3 text-slate-800">
              <span className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                <i className="fa-solid fa-newspaper"></i>
              </span>
              Insights for {newsPeriod === 'weekly' ? 'the Week' : 'the Month'}
            </h4>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 font-bold animate-pulse">Aggregating state news from 20+ sources...</p>
            </div>
          ) : (
            <div className="prose prose-slate max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-lg font-medium">
                {news.text}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6">
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
              <i className="fa-solid fa-earth-asia text-blue-500"></i>
              Grounding Citations
            </h4>
            <div className="space-y-3">
              {news.sources.length > 0 ? news.sources.map((src, i) => (
                <a 
                  key={i}
                  href={src.web?.uri || '#'} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-3 p-4 rounded-2xl border border-gray-50 hover:border-orange-200 hover:bg-orange-50 transition-all group"
                >
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-gray-800 truncate">{src.web?.title || 'External Report'}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight truncate">
                      {src.web?.uri ? new URL(src.web.uri).hostname : 'source'}
                    </p>
                  </div>
                  <i className="fa-solid fa-arrow-up-right-from-square text-gray-300 group-hover:text-orange-500 transition-colors text-xs"></i>
                </a>
              )) : (
                <p className="text-sm text-gray-400 italic py-4 text-center">Referencing official sources...</p>
              )}
            </div>
          </div>

          <div className="bg-slate-900 rounded-[32px] p-6 text-white overflow-hidden relative group">
            <div className="relative z-10">
              <h4 className="font-bold text-orange-500 mb-2 uppercase tracking-widest text-[10px]">Preparation Strategy</h4>
              <p className="text-sm leading-relaxed text-slate-300 font-medium italic">
                "For RAS Mains, always substantiate your answers with data from the 'Rajasthan Economic Review'."
              </p>
            </div>
            <i className="fa-solid fa-quote-right absolute -bottom-4 -right-4 text-white/5 text-7xl group-hover:scale-125 transition-transform duration-500"></i>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResearch = () => (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-24 research-report-container">
      {/* Search Header - Hidden on Print */}
      <div className="bg-white p-12 rounded-[48px] shadow-sm border border-gray-100 text-center space-y-6 relative overflow-hidden no-print">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
        <div className="relative z-10">
          <div className="w-20 h-20 bg-orange-500 text-white rounded-[28px] flex items-center justify-center mx-auto text-3xl shadow-xl shadow-orange-500/20 rotate-3 mb-6">
            <i className="fa-solid fa-microscope"></i>
          </div>
          <h3 className="text-4xl font-black text-gray-900 tracking-tight">Research Lab</h3>
          <p className="text-gray-500 max-w-xl mx-auto text-lg font-medium mt-2">
            AI-powered deep analysis with practice questions for RAS Mains and Personality Tests.
          </p>
          
          <form onSubmit={(e) => { e.preventDefault(); handleResearch(researchTopic); }} className="mt-10 flex flex-col md:flex-row gap-3 max-w-3xl mx-auto">
            <input 
              type="text"
              value={researchTopic}
              onChange={(e) => setResearchTopic(e.target.value)}
              placeholder="Topic (e.g. Rajasthan Solar Policy)"
              className="flex-1 px-8 py-5 rounded-3xl border-2 border-gray-100 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 focus:outline-none transition-all text-lg shadow-inner font-medium"
            />
            <button 
              type="submit"
              disabled={loading}
              className="bg-orange-500 text-white px-10 py-5 rounded-3xl font-black hover:bg-orange-600 hover:scale-105 active:scale-95 transition-all disabled:bg-gray-400 shadow-xl shadow-orange-500/20"
            >
              {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : 'Research'}
            </button>
          </form>

          <div className="pt-8">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Trending in Rajasthan</p>
            <div className="flex flex-wrap justify-center gap-2">
              {trendingTopics.map((topic, i) => (
                <button 
                  key={i} 
                  onClick={() => handleResearch(topic)}
                  className="px-5 py-2.5 bg-gray-50 hover:bg-orange-500 hover:text-white rounded-2xl text-xs font-bold border border-gray-100 transition-all shadow-sm hover:shadow-lg hover:shadow-orange-500/20"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {researchResult && !loading && (
        <>
          {/* Professional Header for Print Only */}
          <div className="hidden print:block mb-10 border-b-8 border-orange-500 pb-8">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase mb-2">RAS Research Report</h1>
                <p className="text-orange-600 font-black text-sm uppercase tracking-[0.3em]">Official Candidate Briefing</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-400 uppercase">Generated on</p>
                <p className="text-lg font-black text-slate-800">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="mt-8 bg-slate-900 text-white p-6 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Research Focus</span>
                <span className="text-2xl font-black">{researchTopic}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Significance Tier</span>
                <span className="text-2xl font-black text-orange-500">{researchResult.significanceScore}/100</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Magic Oracle Section */}
              {researchResult.significanceScore < 10 && (
                <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-black rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden border border-purple-500/30 animate-pulse-subtle">
                  <div className="absolute inset-0 opacity-20 pointer-events-none no-print">
                     {Array.from({length: 20}).map((_, i) => (
                       <div key={i} className="absolute bg-white rounded-full" style={{
                         width: Math.random() * 4 + 'px',
                         height: Math.random() * 4 + 'px',
                         top: Math.random() * 100 + '%',
                         left: Math.random() * 100 + '%',
                         animation: `twinkle ${Math.random() * 5 + 3}s infinite`
                       }}></div>
                     ))}
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 bg-purple-600/50 rounded-2xl flex items-center justify-center border border-purple-400/50 backdrop-blur-md shadow-lg shadow-purple-500/20">
                        <i className="fa-solid fa-crystal-ball text-2xl text-purple-200"></i>
                      </div>
                      <div>
                        <h4 className="text-2xl font-black tracking-tighter text-purple-200 uppercase">Magic Oracle Insight</h4>
                        <p className="text-xs font-bold text-purple-400 uppercase tracking-widest">Elite Visionary Perspective</p>
                      </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 mb-6">
                      <p className="text-lg leading-relaxed italic font-medium text-purple-100">
                        "{researchResult.oracleInsight}"
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase text-purple-400 tracking-widest bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20">
                        Exam Priority: High Importance
                      </span>
                      <i className="fa-solid fa-sparkles text-purple-500 text-xl no-print"></i>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-10 research-main-content">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-1.5 h-10 bg-orange-500 rounded-full"></div>
                    <h4 className="text-3xl font-black text-gray-900 tracking-tight">Detailed Summary</h4>
                  </div>
                  <button 
                    onClick={handleAudioSummary}
                    disabled={isSpeaking}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg no-print ${isSpeaking ? 'bg-orange-500 text-white animate-pulse' : 'bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white'}`}
                    title="Audio Summary"
                  >
                    <i className={`fa-solid ${isSpeaking ? 'fa-waveform' : 'fa-volume-high'} text-xl`}></i>
                  </button>
                </div>
                
                <p className="text-gray-700 leading-relaxed text-xl mb-10 font-medium bg-slate-50 p-8 rounded-[32px] border border-slate-100/50 print:bg-white print:border-slate-200">
                  {researchResult.summary}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                  <div className="bg-indigo-50/50 p-6 rounded-[32px] border border-indigo-100/50 print:bg-white print:border-slate-200">
                    <h5 className="font-black text-indigo-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                      <i className="fa-solid fa-landmark"></i>
                      Rajasthan Context
                    </h5>
                    <p className="text-sm text-indigo-800 font-medium leading-relaxed">{researchResult.historicalContext}</p>
                  </div>
                  <div className="bg-amber-50/50 p-6 rounded-[32px] border border-amber-100/50 print:bg-white print:border-slate-200">
                    <h5 className="font-black text-amber-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                      <i className="fa-solid fa-book-bookmark"></i>
                      Syllabus Relevance
                    </h5>
                    <p className="text-sm text-amber-800 font-medium leading-relaxed">{researchResult.relevanceToRAS}</p>
                  </div>
                </div>

                <h5 className="font-black text-gray-900 mb-6 flex items-center gap-3 text-lg uppercase tracking-tight">
                  <i className="fa-solid fa-bolt-lightning text-orange-500"></i>
                  Key Analytical Points
                </h5>
                <div className="space-y-4">
                  {researchResult.keyPoints.map((point, idx) => (
                    <div key={idx} className="flex gap-4 items-start group">
                      <div className="mt-1 w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 font-black text-xs group-hover:bg-orange-600 group-hover:text-white transition-all shadow-sm">
                        {idx + 1}
                      </div>
                      <p className="text-gray-700 leading-snug font-bold text-base pt-1">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm group hover:border-indigo-200 transition-all print:border-slate-200">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform no-print">
                    <i className="fa-solid fa-comments text-2xl"></i>
                  </div>
                  <h5 className="font-black text-indigo-900 mb-4 text-xl tracking-tight uppercase border-b border-indigo-100 pb-2">Interview Drills</h5>
                  <ul className="space-y-4">
                    {researchResult.shortQuestions.map((q, i) => (
                      <li key={i} className="text-sm font-bold text-indigo-800 bg-indigo-50/40 p-5 rounded-2xl border border-indigo-50 leading-relaxed print:bg-white print:border-slate-100">
                        <span className="text-indigo-400 mr-2 uppercase text-[10px]">Q:</span> {q}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm group hover:border-emerald-200 transition-all print:border-slate-200">
                   <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform no-print">
                    <i className="fa-solid fa-feather-pointed text-2xl"></i>
                  </div>
                  <h5 className="font-black text-emerald-900 mb-4 text-xl tracking-tight uppercase border-b border-emerald-100 pb-2">Mains Questions</h5>
                  <ul className="space-y-4">
                    {researchResult.longQuestions.map((q, i) => (
                      <li key={i} className="text-sm font-bold text-emerald-800 bg-emerald-50/40 p-5 rounded-2xl border border-emerald-50 leading-relaxed print:bg-white print:border-slate-100">
                        <span className="text-emerald-400 mr-2 uppercase text-[10px]">Topic:</span> {q}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 sticky top-24 print:static print:border-slate-200">
                <h5 className="font-black mb-6 flex items-center gap-2 text-lg text-slate-800 uppercase tracking-tight">
                  <i className="fa-solid fa-square-rss text-orange-500"></i>
                  Grounding Sources
                </h5>
                <div className="space-y-3 mb-8">
                  {researchResult.sources.map((s, i) => (
                    <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-orange-500 hover:text-white transition-all text-xs font-black group border border-gray-100/50 print:bg-white print:border-slate-100">
                      <i className="fa-solid fa-globe opacity-30 group-hover:opacity-100"></i>
                      <span className="truncate">{s.title}</span>
                    </a>
                  ))}
                </div>
                
                <div className="space-y-4 no-print">
                  <button 
                     onClick={() => {
                       setQuizText('');
                       setLoading(true);
                       generateQuiz(researchTopic).then(q => {
                         setQuizText(q);
                         setLoading(false);
                       });
                     }}
                     className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10 active:scale-95"
                  >
                    <i className="fa-solid fa-brain-circuit text-orange-400"></i>
                    Launch Simulation
                  </button>
                  <button 
                     className="w-full bg-orange-100 text-orange-600 py-5 rounded-3xl font-black hover:bg-orange-200 transition-all flex items-center justify-center gap-3 active:scale-95"
                     onClick={handlePrint}
                  >
                    <i className="fa-solid fa-file-pdf"></i>
                    Export PDF Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {quizText && (
        <div className="bg-white rounded-[48px] shadow-2xl border-2 border-orange-500/10 p-12 animate-slideUp relative overflow-hidden print:static print:border-slate-200">
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-50 rounded-full -mr-24 -mt-24 pointer-events-none opacity-40 no-print"></div>
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-100 relative z-10">
             <div className="flex items-center gap-4">
               <div className="w-16 h-16 bg-orange-500 rounded-[24px] flex items-center justify-center text-white text-2xl shadow-xl shadow-orange-500/20 rotate-3 no-print">
                 <i className="fa-solid fa-graduation-cap"></i>
               </div>
               <div>
                 <h4 className="text-2xl font-black text-gray-900 tracking-tight">Mains Writing Test</h4>
                 <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Simulated Practice Paper</p>
               </div>
             </div>
             <button onClick={() => setQuizText('')} className="w-12 h-12 flex items-center justify-center rounded-2xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all border border-gray-100 no-print">
               <i className="fa-solid fa-xmark text-xl"></i>
             </button>
          </div>
          <div className="prose prose-slate max-w-none whitespace-pre-wrap text-gray-800 text-xl leading-relaxed font-bold relative z-10">
            {quizText}
          </div>
          <div className="hidden print:block mt-10 pt-10 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-400 font-bold uppercase">End of Research Report</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 4s ease-in-out infinite;
        }
        @keyframes pulse-subtle {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.1); }
          50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.3); }
        }
      `}</style>
    </div>
  );

  const renderResources = () => {
    const categories = ['All', 'Live', 'YouTube', 'Govt', 'News'];
    const resources = [
      { name: "DIPR Rajasthan", desc: "Live Govt Press Releases and PR News", type: "Govt", color: "indigo", icon: "fa-building", url: "https://dipr.rajasthan.gov.in" },
      { name: "Sujas Rajasthan", desc: "Official Monthly State Magazine Archive", type: "Govt", color: "indigo", icon: "fa-book-open", url: "https://dipr.rajasthan.gov.in/content/dipr/en/news/publications.html" },
      { name: "Utkarsh Classes", desc: "Daily Morning Current Affairs (Live)", type: "Live", color: "red", icon: "fa-tower-broadcast", url: "https://www.youtube.com/@UtkarshClassesJodhpur" },
      { name: "Springboard Academy", desc: "In-depth RAS Mains Syllabus Focus", type: "YouTube", color: "red", icon: "fa-tv", url: "https://www.youtube.com/@SpringboardAcademy" },
      { name: "Economic Review 2024", desc: "The Bible for RAS Economy Questions", type: "Govt", color: "indigo", icon: "fa-chart-column", url: "https://planning.rajasthan.gov.in/content/planning-portal/en/economic-review.html" },
      { name: "Rajasthan Patrika", desc: "State News & Investigative Journalism", type: "News", color: "orange", icon: "fa-newspaper", url: "https://www.patrika.com/rajasthan-news/" },
      { name: "Samyak RAS", desc: "Mains Test Series and Writing Skills", type: "Live", color: "red", icon: "fa-signature", url: "https://www.youtube.com/@SamyakRAS" },
      { name: "RPSC Official", desc: "Recruitment Exams and Gazettes", type: "Govt", color: "indigo", icon: "fa-stamp", url: "https://rpsc.rajasthan.gov.in" },
    ];

    const filtered = resourceFilter === 'All' ? resources : resources.filter(r => r.type === resourceFilter);

    return (
      <div className="space-y-10 animate-fadeIn pb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-gray-100">
          <div className="space-y-3">
            <h3 className="text-5xl font-black text-gray-900 tracking-tighter">Resource Vault</h3>
            <p className="text-gray-500 font-bold text-lg">Curated direct links to the best RAS preparation materials.</p>
          </div>
          <div className="flex flex-wrap gap-2 p-2 bg-gray-100 rounded-[32px] w-fit shadow-inner">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setResourceFilter(cat)}
                className={`px-7 py-3 rounded-2xl text-sm font-black transition-all ${
                  resourceFilter === cat 
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30 scale-105 ring-4 ring-orange-100' 
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filtered.map((res, i) => (
            <div key={i} className="bg-white rounded-[44px] p-10 shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-3 transition-all group relative overflow-hidden">
               <div className={`absolute -right-10 -top-10 w-40 h-40 bg-${res.color}-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              <div className={`w-20 h-20 rounded-[30px] mb-8 flex items-center justify-center bg-${res.color}-50 text-${res.color}-600 relative z-10 transition-transform group-hover:rotate-12 duration-500 shadow-sm`}>
                <i className={`fa-solid ${res.icon} text-4xl`}></i>
              </div>
              <h4 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-orange-600 transition-colors relative z-10 tracking-tight leading-tight">{res.name}</h4>
              <p className="text-sm text-gray-500 mb-10 line-clamp-2 relative z-10 leading-relaxed font-bold">{res.desc}</p>
              <div className="flex items-center justify-between relative z-10">
                <span className={`text-[10px] uppercase font-black tracking-widest px-5 py-2.5 rounded-2xl bg-${res.color}-50 text-${res.color}-600 border border-${res.color}-100/50`}>
                  {res.type}
                </span>
                <a href={res.url} target="_blank" rel="noreferrer" className="w-14 h-14 rounded-[22px] bg-slate-900 text-white flex items-center justify-center hover:bg-orange-500 transition-all shadow-xl shadow-slate-900/20 active:scale-90">
                  <i className="fa-solid fa-arrow-right text-xl"></i>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'research' && renderResearch()}
      {activeTab === 'resources' && renderResources()}
      {activeTab === 'quiz' && (
        <div className="bg-white rounded-[64px] p-24 text-center space-y-10 shadow-sm border border-gray-100 max-w-4xl mx-auto mt-10 relative overflow-hidden">
          <div className="absolute -left-20 -top-20 w-80 h-80 bg-orange-50 rounded-full opacity-40"></div>
          <div className="relative z-10">
            <div className="w-32 h-32 bg-orange-100 text-orange-600 rounded-[44px] flex items-center justify-center mx-auto text-6xl mb-8 rotate-6 animate-pulse shadow-xl shadow-orange-500/10">
              <i className="fa-solid fa-pen-nib"></i>
            </div>
            <h3 className="text-5xl font-black text-gray-900 tracking-tight">Exam Simulation Hub</h3>
            <p className="text-gray-500 text-2xl font-bold max-w-xl mx-auto leading-relaxed mt-4">
              Enter the Research Lab, analyze a specific Rajasthan topic, and click "Launch Simulation" to generate a tailored test paper.
            </p>
            <div className="pt-12">
               <button 
                 onClick={() => setActiveTab('research')}
                 className="bg-slate-900 text-white px-14 py-6 rounded-[32px] font-black text-xl hover:bg-orange-600 shadow-2xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all"
               >
                 Launch Research Lab
               </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
