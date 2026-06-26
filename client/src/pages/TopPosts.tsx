import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  TrendingUp,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  ExternalLink,
  Flame,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Users,
  Award,
  SearchX
} from "lucide-react";
import { IllustrationSlot } from "@/components/IllustrationSlot";

interface ViralPost {
  id: number;
  authorName: string;
  authorHeadline: string;
  authorProfileUrl: string;
  authorProfilePicture: string;
  authorFollowers: number;
  content: string;
  postUrl: string;
  likes: number;
  comments: number;
  shares: number;
  impressions: number;
  theme: string;
  language: string;
  rank: number;
  publishedAt: string;
}

// Données statiques des meilleures publications
const topPostsData: ViralPost[] = [
  {
    id: 1,
    authorName: "Richard van der Blom",
    authorHeadline: "LinkedIn Expert | Keynote Speaker | Helping professionals grow on LinkedIn",
    authorProfileUrl: "https://www.linkedin.com/in/richardvanderblom",
    authorProfilePicture: "https://media.licdn.com/dms/image/v2/D4E03AQGQhVh9QfKhZg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1698230573858?e=1740614400&v=beta&t=example",
    authorFollowers: 255000,
    content: `The best-performing LinkedIn post I've ever seen wasn't created by a marketing team.

No big budget.
No slick design.
No AI.
No perfect framework.

It was written by a mid-level manager.
At the end of a long day.
From the heart.

She shared why she joined her company.
What she believes in.
How she found purpose in everyday work.
That's it. That's all.

No corporate messaging. No polished wording.

The result?
• 80,000+ impressions
• Dozens of job applications
• More engagement than anything the company page had ever posted

Why did it work?

Because people trust people — not logos.
Because authenticity travels faster than polish.
Because employee content isn't content. It's connection.

This is the true power of employee advocacy.

It's not about amplifying company news.
It's about building trust from the inside out.

Still debating if employee activity on LinkedIn is "worth it"?

Trust me!
It's essential.

Companies investing in this now will be the ones everyone's watching — and chasing — in 2026.`,
    postUrl: "https://www.linkedin.com/posts/richardvanderblom_the-best-performing-linkedin-post-ive-ever-activity-7407687412987871232-p1yB",
    likes: 182,
    comments: 78,
    shares: 45,
    impressions: 80000,
    theme: "Employee Advocacy",
    language: "EN",
    rank: 1,
    publishedAt: "2024-12-19"
  },
  {
    id: 2,
    authorName: "Georgia St John-Smith",
    authorHeadline: "Entrepreneur | Business Coach | LinkedIn Growth Expert",
    authorProfileUrl: "https://www.linkedin.com/in/georgiastjohnsmith",
    authorProfilePicture: "https://media.licdn.com/dms/image/v2/example2",
    authorFollowers: 75854,
    content: `2024: Sh*t went down in my world. Car crash. Break up. Business challenges pushing me to my edge.

2025: A puppy. A new car. Peace.

I posted on LinkedIn exactly a year ago, (that's when it all went down in flames).

And that post has aged veryyyy well... 👀

1 year ago, I said:
🚫 I'm not going to fight against the people who have wronged me.
❤️🔥 I'm going to reclaim my power by being in my true energy of creation.

Which for me means:
- Hiring a therapist
- Going to dance classes to refuel my feminine energy
- Serving my clients
- Showing up to turn my genius ideas for my business into reality
- Getting creative with my content
- Taking my time to rest
- Alchemising my pain into something productive

And do you wanna know what I did?

1. My priority was my mental health so I hired a therapist. Took time for deep rest and healing.

2. Then I came back, ready to fly.
- I launched the "Phoenix Season" challenge, and 170 people joined.
- Had my first ever $80k month
- Launched the LinkedIn Growth challenge "Hot Growth Summer", 127 people joined.
- Got featured in Times Square with my mentor
- Gained 40,000 new followers on LinkedIn

And after allllll that you know what I learnt the most?

Don't be a f*cking push over to life.

Life will be hard. Sh*t does happen.

Look after yourself.
Focus on your passions.
Always.

When things have been it's hardest, mentally. I discovered the power of your passions.

That alone is worth millions.`,
    postUrl: "https://www.linkedin.com/posts/georgiastjohnsmith_2024-sht-went-down-in-my-world-car-crash-activity-7407691166625841152-MCTB",
    likes: 325,
    comments: 92,
    shares: 67,
    impressions: 150000,
    theme: "Résilience",
    language: "EN",
    rank: 2,
    publishedAt: "2024-12-19"
  },
  {
    id: 3,
    authorName: "Elmer Lopez 🏆",
    authorHeadline: "Content Creator | LinkedIn Growth Expert",
    authorProfileUrl: "https://www.linkedin.com/in/elmerlopez96",
    authorProfilePicture: "https://media.licdn.com/dms/image/v2/example3",
    authorFollowers: 35526,
    content: `Quick breakdown on how I hit 11M impressions & gained 28k followers in 1 year on Linkedin👇🏽

There wasn't just 1 single type of content that helped me hit those numbers.

2024 was different, I was able to hit 80M impressions using video only.

2025, the algorithm shifted and video performance dropped hard.

So I stopped going all in on one format.

Instead, I spread my content across multiple posting types:
1. Text posts
2. Images
3. Videos
4. Carousels

Just how everyone learns differently.
Everyone consumes their content differently.

That's why its good to have a spread of all posting formats.

& sure you're going to have those weeks where you don't feel like posting at all.

But once you've been consistent for a decent amount of time, you eventually build a backlog of content that has previously gone viral.

On weeks where I don't feel like posting, I repost that past viral content.

& most of the time, it still performs…

That is the real growth hack on this platform.

1. Post consistently
2. Re-use your past viral content
3. Post all format types

Do that, and you will be on the same path 🤝

What questions do you have about growing on Linkedin?`,
    postUrl: "https://www.linkedin.com/posts/elmerlopez96_quick-breakdown-on-how-i-hit-11m-impressions-activity-7408917676351225857-TakZ",
    likes: 33,
    comments: 11,
    shares: 8,
    impressions: 11000000,
    theme: "Stratégie LinkedIn",
    language: "EN",
    rank: 3,
    publishedAt: "2024-12-23"
  },
  {
    id: 4,
    authorName: "Youssef Koutari",
    authorHeadline: "Entrepreneur | Expert LinkedIn | Créateur de contenu",
    authorProfileUrl: "https://www.linkedin.com/in/youssefkoutari",
    authorProfilePicture: "",
    authorFollowers: 15000,
    content: `Le succès n'est pas une destination, c'est un voyage quotidien.

Chaque matin, vous avez le choix :
→ Rester dans votre zone de confort
→ Ou faire un pas vers vos rêves

Les entrepreneurs qui réussissent ne sont pas ceux qui n'ont jamais échoué.

Ce sont ceux qui ont transformé chaque échec en leçon.

Voici ce que j'ai appris après 5 ans d'entrepreneuriat :

1️⃣ L'échec est votre meilleur professeur
2️⃣ Votre réseau est votre valeur nette
3️⃣ La constance bat le talent
4️⃣ Investissez dans vous-même d'abord
5️⃣ Entourez-vous de personnes qui vous élèvent

Le chemin sera difficile.
Les doutes seront présents.
Mais la récompense en vaut la peine.

Quelle est la leçon la plus importante que vous avez apprise cette année ?

#Entrepreneuriat #Leadership #Motivation`,
    postUrl: "https://www.linkedin.com/in/youssefkoutari",
    likes: 450,
    comments: 85,
    shares: 120,
    impressions: 95000,
    theme: "Entrepreneuriat",
    language: "FR",
    rank: 4,
    publishedAt: "2024-12-20"
  },
  {
    id: 5,
    authorName: "Sarah Chen",
    authorHeadline: "Tech Leader | AI Enthusiast | Building the future",
    authorProfileUrl: "https://www.linkedin.com/in/sarahchen",
    authorProfilePicture: "",
    authorFollowers: 120000,
    content: `I got rejected from 47 jobs before landing my dream role.

Here's what nobody tells you about job hunting:

The rejection emails hurt.
The ghosting is worse.
The self-doubt is the hardest part.

But here's what I learned:

Every "no" is data.
Every rejection is redirection.
Every closed door opens another.

After 6 months of searching:
- 200+ applications
- 47 rejections
- 15 interviews
- 1 life-changing offer

What made the difference?

I stopped applying to jobs.
I started building relationships.

I reached out to 50 people in my target companies.
Not to ask for jobs.
To learn about their journey.

3 of those conversations led to referrals.
1 of those referrals became my current role.

The job market is tough.
But your network is tougher.

If you're struggling right now, keep going.
Your breakthrough is closer than you think.

Who's hiring in your network? Drop it in the comments 👇`,
    postUrl: "https://www.linkedin.com/in/sarahchen",
    likes: 2500,
    comments: 340,
    shares: 180,
    impressions: 500000,
    theme: "Carrière",
    language: "EN",
    rank: 5,
    publishedAt: "2024-12-21"
  }
];

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

export default function TopPosts() {
  const [posts, setPosts] = useState<ViralPost[]>(topPostsData);
  const [selectedWeek, setSelectedWeek] = useState(getWeekNumber(new Date()));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [expandedPost, setExpandedPost] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "FR" | "EN">("all");

  const filteredPosts = posts.filter(post => 
    filter === "all" || post.language === filter
  );

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Award className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500 to-amber-500 text-black";
      case 2:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-black";
      case 3:
        return "bg-gradient-to-r from-amber-600 to-orange-600 text-white";
      default:
        return "bg-white/10 text-white";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500/20 via-red-500/20 to-pink-500/20 border border-white/10 p-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent" />
          <div className="relative flex items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500">
                  <Flame className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Top Publications</h1>
                  <p className="text-white/60">Les publications LinkedIn les plus virales de la semaine</p>
                </div>
              </div>

              {/* Week selector */}
              <div className="flex items-center gap-4 mt-6">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  <span className="text-white/80">Semaine {selectedWeek}, {selectedYear}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                    onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                    onClick={() => setSelectedWeek(Math.min(52, selectedWeek + 1))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Drop an image at public/images/hero-top-posts.png to fill this */}
            <IllustrationSlot
              src="/images/hero-top-posts.png"
              alt=""
              className="hidden lg:block w-56 h-36 shrink-0"
            />
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-500/20">
                  <Flame className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{posts.length}</p>
                  <p className="text-xs text-muted-foreground">Publications virales</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-pink-500/20">
                  <Heart className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(posts.reduce((acc, p) => acc + p.likes, 0))}
                  </p>
                  <p className="text-xs text-muted-foreground">Likes totaux</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/20">
                  <Eye className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(posts.reduce((acc, p) => acc + p.impressions, 0))}
                  </p>
                  <p className="text-xs text-muted-foreground">Impressions totales</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/20">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(posts.reduce((acc, p) => acc + p.authorFollowers, 0))}
                  </p>
                  <p className="text-xs text-muted-foreground">Followers cumulés</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <Tabs defaultValue="all" className="w-full" onValueChange={(v) => setFilter(v as any)}>
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="all" className="data-[state=active]:bg-white/10">
              Toutes
            </TabsTrigger>
            <TabsTrigger value="FR" className="data-[state=active]:bg-white/10">
              🇫🇷 Français
            </TabsTrigger>
            <TabsTrigger value="EN" className="data-[state=active]:bg-white/10">
              🇬🇧 English
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Posts List */}
        {filteredPosts.length === 0 ? (
          <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
            <CardContent className="py-16 text-center">
              {/* Drop an image at public/images/empty-top-posts.png to fill this */}
              <IllustrationSlot
                src="/images/empty-top-posts.png"
                icon={SearchX}
                alt=""
                className="w-16 h-16 mx-auto mb-4"
                iconClassName="w-12 h-12 mx-auto mb-4"
              />
              <h3 className="text-lg font-medium text-white">Aucune publication pour ce filtre</h3>
              <p className="text-muted-foreground mt-1">Essayez une autre langue ou une autre semaine</p>
            </CardContent>
          </Card>
        ) : (
        <div className="space-y-4">
          {filteredPosts.map((post, index) => (
            <Card 
              key={post.id} 
              className={`bg-card/50 border-white/10 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-white/20 ${
                post.rank === 1 ? "ring-2 ring-yellow-500/30" : ""
              }`}
            >
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  {/* Rank indicator */}
                  <div className={`w-full sm:w-16 flex-shrink-0 flex flex-row sm:flex-col items-center justify-center ${getRankBadgeColor(post.rank)} py-2 sm:py-4 gap-2 sm:gap-0`}>
                    {getRankIcon(post.rank)}
                    {post.rank <= 3 && (
                      <span className="text-xs font-bold sm:mt-1">
                        {post.rank === 1 ? "1er" : post.rank === 2 ? "2ème" : "3ème"}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 sm:p-6">
                    {/* Author info */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                          {post.authorName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-white text-sm sm:text-base truncate">{post.authorName}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{post.authorHeadline}</p>
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                            <Badge variant="outline" className="text-xs border-white/20">
                              <Users className="w-3 h-3 mr-1" />
                              {formatNumber(post.authorFollowers)} followers
                            </Badge>
                            <Badge variant="outline" className="text-xs border-white/20">
                              {post.theme}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/20 text-white hover:bg-white/10 w-full sm:w-auto flex-shrink-0"
                        onClick={() => window.open(post.postUrl, "_blank")}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Voir sur LinkedIn
                      </Button>
                    </div>

                    {/* Post content */}
                    <div className="mb-4">
                      <p className={`text-white/80 whitespace-pre-line ${expandedPost === post.id ? "" : "line-clamp-6"}`}>
                        {post.content}
                      </p>
                      {post.content.length > 400 && (
                        <Button
                          variant="link"
                          className="text-purple-400 p-0 h-auto mt-2"
                          onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                        >
                          {expandedPost === post.id ? "Voir moins" : "Voir plus..."}
                        </Button>
                      )}
                    </div>

                    {/* Engagement stats */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-1 sm:gap-2 text-pink-400">
                        <Heart className="w-4 h-4" />
                        <span className="text-xs sm:text-sm font-medium">{formatNumber(post.likes)}</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 text-blue-400">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-xs sm:text-sm font-medium">{formatNumber(post.comments)}</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 text-green-400">
                        <Share2 className="w-4 h-4" />
                        <span className="text-xs sm:text-sm font-medium">{formatNumber(post.shares)}</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 text-purple-400">
                        <Eye className="w-4 h-4" />
                        <span className="text-xs sm:text-sm font-medium">{formatNumber(post.impressions)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}

        {/* CTA */}
        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-white/10">
          <CardContent className="p-8 text-center">
            <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              Inspirez-vous des meilleurs
            </h3>
            <p className="text-white/60 mb-6 max-w-lg mx-auto">
              Utilisez ces publications virales comme inspiration pour créer votre propre contenu engageant avec notre générateur IA.
            </p>
            <Button 
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              onClick={() => window.location.href = "/generate"}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Générer du contenu inspiré
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
