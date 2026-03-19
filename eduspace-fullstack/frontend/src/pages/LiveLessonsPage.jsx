import { useState } from 'react';
import { Radio, Users, Clock, CalendarDays, PlayCircle, Mic, MicOff, Video, VideoOff, MonitorUp, MessageSquare } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLiveSessions } from '../hooks/useData';
import { Avatar } from '../components/ui/Avatar';
import { cn } from '../lib/utils';

function formatScheduled(iso) {
  const d = new Date(iso), now = new Date();
  const diff = (d - now) / 1000 / 60;
  if (diff < 0) return 'Ended';
  if (diff < 60) return `Starts in ${Math.round(diff)} min`;
  if (diff < 1440) return `Today at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function LiveLessonsPage() {
  const { user } = useAuth();
  const [active, setActive] = useState(null);
  const [micOn, setMicOn]   = useState(false);
  const [camOn, setCamOn]   = useState(false);

  const { data: sessions = [] } = useLiveSessions();
  const live     = sessions.filter((s) => s.status === 'live');
  const upcoming = sessions.filter((s) => s.status === 'upcoming');
  const ended    = sessions.filter((s) => s.status === 'ended');

  if (active) return (
    <LiveRoom session={active} onLeave={() => setActive(null)}
      micOn={micOn} setMicOn={setMicOn} camOn={camOn} setCamOn={setCamOn} />
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
            <Radio className="w-6 h-6 text-red-500" /> Live Lessons
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Join live interactive sessions with your teachers</p>
        </div>
        {user?.role !== 'student' && (
          <button className="btn-primary flex items-center gap-2 text-sm">
            <Radio className="w-4 h-4" /> Start Broadcast
          </button>
        )}
      </div>

      {live.length > 0 && (
        <section>
          <h2 className="text-sm font-bold flex items-center gap-2 mb-3" style={{ color: 'var(--text-main)' }}>
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse-soft" /> Live Now
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {live.map((s) => <SessionCard key={s.id} session={s} onJoin={() => setActive(s)} />)}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section>
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
            <CalendarDays className="w-4 h-4 text-brand-600" /> Upcoming
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcoming.map((s) => <SessionCard key={s.id} session={s} onJoin={() => setActive(s)} />)}
          </div>
        </section>
      )}

      {ended.length > 0 && (
        <section>
          <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--text-main)' }}>Recordings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ended.map((s) => <SessionCard key={s.id} session={s} onJoin={() => setActive(s)} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function SessionCard({ session, onJoin }) {
  const isLive     = session.status === 'live';
  const isUpcoming = session.status === 'upcoming';
  const pct = Math.round((session.attendees / session.maxAttendees) * 100);

  return (
    <div className="card card-hover overflow-hidden group" style={{
      border: isLive ? '2px solid #fca5a5' : '1px solid var(--border)',
      boxShadow: isLive ? '0 0 0 3px rgba(239,68,68,0.08)' : undefined,
    }}>
      {/* Thumbnail */}
      <div className="relative h-36 bg-slate-800 overflow-hidden">
        <img src={session.thumbnail} alt={session.title}
          className="w-full h-full object-cover opacity-70" onError={e => e.target.style.display='none'} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        <span className="absolute top-3 left-3 badge text-xs font-bold"
          style={{
            background: isLive ? '#ef4444' : isUpcoming ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.4)',
            color: '#fff',
          }}>
          {isLive ? '● LIVE' : isUpcoming ? 'Upcoming' : 'Ended'}
        </span>

        {isLive && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onJoin}
              className="font-bold text-sm px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-colors"
              style={{ background: '#fff', color: '#0f172a' }}>
              <PlayCircle className="w-4 h-4 text-red-500" /> Join Now
            </button>
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-white font-semibold text-sm line-clamp-1">{session.title}</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session.teacher}`} name={session.teacher} size="xs" />
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{session.teacher}</span>
          </div>
          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            <Clock className="w-3 h-3" /> {session.duration} min
          </span>
        </div>

        <p className="text-xs line-clamp-2" style={{ color: 'var(--text-muted)' }}>{session.description}</p>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {session.attendees} / {session.maxAttendees}</span>
            <span className="font-semibold" style={{ color: isLive ? '#ef4444' : 'var(--brand)' }}>{formatScheduled(session.scheduledAt)}</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: isLive ? '#ef4444' : 'var(--brand)' }} />
          </div>
        </div>

        {isLive ? (
          <button onClick={onJoin} className="w-full btn-primary text-xs py-2 flex items-center justify-center gap-1.5">
            <Radio className="w-3.5 h-3.5" /> Join Live
          </button>
        ) : isUpcoming ? (
          <button className="w-full btn-secondary text-xs py-2">Remind Me</button>
        ) : (
          <button onClick={onJoin} className="w-full btn-secondary text-xs py-2 flex items-center justify-center gap-1.5">
            <PlayCircle className="w-3.5 h-3.5" /> Watch Recording
          </button>
        )}
      </div>
    </div>
  );
}

function LiveRoom({ session, onLeave, micOn, setMicOn, camOn, setCamOn }) {
  const [chatMsg, setChatMsg] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, user: 'Dr. Sarah Chen', text: "Welcome everyone! We'll start in a moment.", time: '10:00 AM', isTeacher: true },
    { id: 2, user: 'Alex Morgan',    text: 'Excited for this session!',                  time: '10:01 AM', isTeacher: false },
    { id: 3, user: 'Priya Sharma',   text: 'Can you cover integration by parts today?',  time: '10:02 AM', isTeacher: false },
    { id: 4, user: 'Dr. Sarah Chen', text: "Yes! That's on our agenda.",                 time: '10:03 AM', isTeacher: true },
  ]);

  const sendMsg = (e) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;
    setMessages((m) => [...m, { id: Date.now(), user: 'You', text: chatMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isMe: true }]);
    setChatMsg('');
  };

  const controls = [
    { icon: micOn ? Mic : MicOff,     label: micOn ? 'Mute' : 'Unmute',   active: micOn,  action: () => setMicOn(v => !v) },
    { icon: camOn ? Video : VideoOff,  label: camOn ? 'Cam Off' : 'Cam On',active: camOn,  action: () => setCamOn(v => !v) },
    { icon: MonitorUp,                 label: 'Share Screen',               active: false,  action: () => {} },
  ];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onLeave} className="btn-ghost text-sm flex items-center gap-2">← Back</button>
        <div>
          <h1 className="font-display font-bold text-lg" style={{ color: 'var(--text-main)' }}>{session.title}</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{session.courseName} · {session.teacher}</p>
        </div>
        <span className="ml-auto badge bg-red-500 text-white text-xs font-bold animate-pulse-soft">● LIVE</span>
      </div>

      <div className="flex flex-col xl:flex-row gap-4" style={{ height: 'calc(100vh - 200px)', minHeight: 500 }}>
        {/* Video area */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <div className="flex-1 rounded-2xl overflow-hidden relative" style={{ background: '#0f172a' }}>
            {session.youtubeStreamId ? (
              <iframe className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${session.youtubeStreamId}?autoplay=0&rel=0`}
                title={session.title} allowFullScreen />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Radio className="w-16 h-16 text-white/20 mb-3" />
                <p className="text-white/40 text-sm font-medium">Stream not started yet</p>
                <p className="text-white/25 text-xs mt-1">{formatScheduled(session.scheduledAt)}</p>
              </div>
            )}
            {/* Attendee thumbnails */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              {['Alex','Priya','Carlos','Emma'].map((name) => (
                <div key={name} className="w-16 h-12 rounded-xl overflow-hidden border-2 border-slate-600 bg-slate-700">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt={name} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="absolute top-4 left-4 text-white/60 text-xs flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> {session.attendees} watching
            </div>
          </div>

          {/* Controls */}
          <div className="rounded-2xl p-4 flex items-center justify-between" style={{ background: '#1e293b' }}>
            <span className="text-white/50 text-xs">{session.courseName}</span>
            <div className="flex items-center gap-2">
              {controls.map(({ icon: Icon, label, active, action }) => (
                <button key={label} onClick={action} title={label}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                  style={{ background: active ? 'var(--brand)' : '#334155', color: active ? '#fff' : '#94a3b8' }}>
                  <Icon className="w-4 h-4" />
                </button>
              ))}
              <button onClick={onLeave}
                className="px-4 py-2 rounded-xl text-sm font-semibold ml-2 transition-colors"
                style={{ background: '#ef4444', color: '#fff' }}>
                Leave
              </button>
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="xl:w-72 card flex flex-col overflow-hidden flex-shrink-0">
          <div className="p-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
              <MessageSquare className="w-4 h-4 text-brand-600" /> Live Chat
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto scroll-area p-4 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={cn('flex flex-col', m.isMe && 'items-end')}>
                <div className="max-w-[90%] rounded-2xl px-3 py-2" style={{
                  background: m.isTeacher ? 'var(--brand-light)' : m.isMe ? 'var(--brand)' : 'var(--surface)',
                  color: m.isTeacher ? 'var(--brand)' : m.isMe ? '#fff' : 'var(--text-main)',
                }}>
                  {!m.isMe && (
                    <p className="text-[10px] font-bold mb-0.5" style={{ color: m.isTeacher ? 'var(--brand)' : 'var(--text-muted)' }}>
                      {m.user} {m.isTeacher && '👩‍🏫'}
                    </p>
                  )}
                  <p className="text-xs leading-relaxed">{m.text}</p>
                </div>
                <span className="text-[10px] mt-0.5 px-1" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>{m.time}</span>
              </div>
            ))}
          </div>
          <form onSubmit={sendMsg} className="p-3 flex gap-2" style={{ borderTop: '1px solid var(--border)' }}>
            <input value={chatMsg} onChange={(e) => setChatMsg(e.target.value)}
              placeholder="Type a message…" className="flex-1 input-field text-xs py-2" />
            <button type="submit" className="btn-primary px-3 py-2 text-xs">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}
