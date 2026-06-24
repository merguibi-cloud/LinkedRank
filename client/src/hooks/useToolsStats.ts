import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useEffect, useMemo, useState } from "react";

interface ScheduledPostApi {
  id: number;
  content: string;
  scheduledDate: string;
  status: string;
}

interface UpcomingMeta {
  pendingCount: number;
  projectedCount: number;
  isEnabled: boolean;
}

export function useToolsStats() {
  const { user } = useAuth();
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPostApi[]>([]);
  const [upcomingMeta, setUpcomingMeta] = useState<UpcomingMeta | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(true);

  const { data: myPostsData, isLoading: loadingPosts } =
    trpc.generator.myPosts.useQuery({ limit: 200 }, { enabled: !!user });

  useEffect(() => {
    if (!user) {
      setLoadingSchedule(false);
      return;
    }

    let cancelled = false;
    setLoadingSchedule(true);

    Promise.all([
      fetch("/api/schedule", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/auto-publish/upcoming?days=7", { credentials: "include" }).then(
        (r) => r.json()
      ),
    ])
      .then(([scheduleData, upcomingData]) => {
        if (cancelled) return;
        setScheduledPosts(scheduleData.posts || []);
        setUpcomingMeta(upcomingData.meta || null);
      })
      .catch(() => {
        if (!cancelled) {
          setScheduledPosts([]);
          setUpcomingMeta(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingSchedule(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const stats = useMemo(() => {
    const posts = myPostsData?.posts ?? [];
    const published = posts.filter((p) => p.status === "published").length;
    const drafts = posts.filter(
      (p) => p.status === "generated" || p.status === "saved"
    ).length;
    const scheduledFromPosts = posts.filter((p) => p.status === "scheduled").length;
    const pendingSchedule = scheduledPosts.filter(
      (p) => p.status === "pending"
    ).length;

    const themeCounts = new Map<string, number>();
    for (const post of posts) {
      const theme = post.theme || "Autre";
      themeCounts.set(theme, (themeCounts.get(theme) || 0) + 1);
    }

    const topThemes = [...themeCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([theme, count]) => ({ theme, count }));

    const hourCounts = new Map<number, number>();
    for (const post of scheduledPosts) {
      const hour = new Date(post.scheduledDate).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    }

    const bestHours = [...hourCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour, count]) => ({ hour, count }));

    return {
      totalGenerated: posts.length,
      published,
      drafts,
      scheduledFromPosts,
      pendingSchedule,
      upcomingAuto: upcomingMeta?.projectedCount ?? 0,
      autoEnabled: upcomingMeta?.isEnabled ?? false,
      topThemes,
      bestHours,
      recentPosts: posts.slice(0, 8),
    };
  }, [myPostsData, scheduledPosts, upcomingMeta]);

  return {
    loading: loadingPosts || loadingSchedule,
    stats,
    scheduledPosts,
  };
}
