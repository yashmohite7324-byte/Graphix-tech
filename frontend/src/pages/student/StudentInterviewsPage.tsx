import { useQuery } from '@tanstack/react-query';
import { interviewApi } from '../../api';
import { PageLoader, EmptyState, StatusBadge } from '../../components/ui';
import { Calendar, Clock, Video, MapPin, Users, ExternalLink } from 'lucide-react';

export default function StudentInterviewsPage() {
  const { data: interviewsRes, isLoading } = useQuery({
    queryKey: ['my-interviews'],
    queryFn: () => interviewApi.getAll(),
  });

  if (isLoading) return <PageLoader />;
  const interviews = interviewsRes?.data?.data || [];

  const upcoming = interviews.filter((i: any) =>
    i.result === 'PENDING' && new Date(i.scheduledAt) > new Date()
  );
  const past = interviews.filter((i: any) =>
    i.result !== 'PENDING' || new Date(i.scheduledAt) <= new Date()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1>My Interviews</h1>
        <p className="text-slate-500 text-sm mt-1">
          View your scheduled and past interview details.
        </p>
      </div>

      {interviews.length === 0 ? (
        <EmptyState
          icon={<Calendar size={28} />}
          title="No interviews scheduled yet"
          description="When a recruiter shortlists you and schedules an interview, it will appear here."
        />
      ) : (
        <div className="space-y-6">
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-slate-900 mb-3">
                Upcoming Interviews ({upcoming.length})
              </h2>
              <div className="space-y-4">
                {upcoming.map((interview: any) => (
                  <InterviewCard key={interview.id} interview={interview} isUpcoming />
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-slate-900 mb-3">
                Past Interviews ({past.length})
              </h2>
              <div className="space-y-4">
                {past.map((interview: any) => (
                  <InterviewCard key={interview.id} interview={interview} isUpcoming={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InterviewCard({ interview, isUpcoming }: { interview: any; isUpcoming: boolean }) {
  const scheduled = interview.scheduledAt ? new Date(interview.scheduledAt) : null;

  return (
    <div className={`card p-5 ${isUpcoming ? 'border-brand-200 bg-brand-50/30' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-lg ${
            isUpcoming ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-500'
          }`}>
            {interview.round || '?'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900">
                Round {interview.round} Interview
              </h3>
              <StatusBadge status={interview.result} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {interview.application?.job?.title} —{' '}
              {interview.application?.job?.company?.name}
            </p>
          </div>
        </div>

        {isUpcoming && interview.meetingLink && (
          <a
            href={interview.meetingLink}
            target="_blank"
            rel="noreferrer"
            className="btn-primary text-xs px-3 py-1.5 flex-shrink-0"
          >
            <ExternalLink size={13} /> Join Meeting
          </a>
        )}
      </div>

      {/* Details */}
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {scheduled && (
          <>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar size={15} className="text-slate-400" />
              {scheduled.toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock size={15} className="text-slate-400" />
              {scheduled.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </>
        )}
        {interview.mode && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            {interview.mode === 'ONLINE'
              ? <Video size={15} className="text-slate-400" />
              : <MapPin size={15} className="text-slate-400" />}
            {interview.mode}
          </div>
        )}
        {interview.panel && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users size={15} className="text-slate-400" />
            {interview.panel}
          </div>
        )}
      </div>

      {/* Venue or meeting link */}
      {interview.venue && (
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
          <MapPin size={14} className="text-slate-400" />
          {interview.venue}
        </div>
      )}

      {/* Feedback */}
      {interview.feedback && (
        <div className="mt-3 p-3 bg-slate-50 rounded-lg">
          <p className="text-xs font-medium text-slate-500 mb-1">Interviewer Feedback</p>
          <p className="text-sm text-slate-700">{interview.feedback}</p>
        </div>
      )}

      {/* Countdown for upcoming */}
      {isUpcoming && scheduled && (
        <div className="mt-3 flex items-center gap-2 text-xs font-medium text-brand-600 bg-brand-50 px-3 py-2 rounded-lg">
          <Clock size={13} />
          {Math.ceil((scheduled.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days away
        </div>
      )}
    </div>
  );
}
