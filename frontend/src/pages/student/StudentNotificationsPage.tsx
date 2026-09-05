import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../../api';
import { PageLoader, EmptyState } from '../../components/ui';
import { Bell, CheckCheck, Briefcase, Calendar, BookOpen, Megaphone, Info } from 'lucide-react';

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  APPLICATION_UPDATE: { icon: <Briefcase size={16} />, color: 'bg-blue-50 text-blue-600' },
  INTERVIEW_SCHEDULED: { icon: <Calendar size={16} />, color: 'bg-purple-50 text-purple-600' },
  JOB_ALERT: { icon: <Briefcase size={16} />, color: 'bg-green-50 text-green-600' },
  TRAINING_REMINDER: { icon: <BookOpen size={16} />, color: 'bg-orange-50 text-orange-600' },
  ANNOUNCEMENT: { icon: <Megaphone size={16} />, color: 'bg-yellow-50 text-yellow-600' },
  PLACEMENT_UPDATE: { icon: <CheckCheck size={16} />, color: 'bg-green-50 text-green-700' },
  SYSTEM: { icon: <Info size={16} />, color: 'bg-slate-50 text-slate-600' },
};

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function StudentNotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifRes, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getAll(),
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });

  if (isLoading) return <PageLoader />;

  const notifications = notifRes?.data?.data || [];
  const unread = notifications.filter((n: any) => !n.read);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1>Notifications</h1>
          <p className="text-slate-500 text-sm mt-1">
            {unread.length > 0
              ? `You have ${unread.length} unread notification${unread.length > 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        {unread.length > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="btn-secondary text-sm"
          >
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={28} />}
          title="No notifications yet"
          description="Application updates, interview schedules, and announcements will appear here."
        />
      ) : (
        <div className="card divide-y divide-slate-100">
          {notifications.map((notif: any) => {
            const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.SYSTEM;
            return (
              <div
                key={notif.id}
                className={`flex items-start gap-4 px-5 py-4 transition-colors ${
                  !notif.read ? 'bg-brand-50/40' : 'hover:bg-slate-50'
                }`}
              >
                {/* Icon */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${config.color}`}>
                  {config.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${!notif.read ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                      {notif.title}
                    </p>
                    <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
                      {notif.createdAt ? timeAgo(notif.createdAt) : ''}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                  <span className="text-xs text-slate-400 mt-1 inline-block">
                    {notif.type?.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Unread dot */}
                {!notif.read && (
                  <div className="w-2 h-2 bg-brand-500 rounded-full mt-2 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
