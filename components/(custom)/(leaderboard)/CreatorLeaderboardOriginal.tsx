import {
  getLeaderboardData,
} from "@/utils/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BarChart,
  Download,
  Users,
  Award,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function CreatorsLeaderboard() {
  // Fetch leaderboard data
  const { topDownloadedWorkflows, topWorkflowCreators, trendingThisMonth } =
    await getLeaderboardData();

    console.log("Top Downloaded Workflows:", topDownloadedWorkflows);

  // Check if we have data to display
  const hasData =
    topDownloadedWorkflows.length > 0 ||
    topWorkflowCreators.length > 0 ||
    trendingThisMonth.length > 0;

  if (!hasData) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-6">Top Creators</h1>
        <div className="max-w-lg mx-auto bg-muted/20 rounded-lg p-10 border">
          <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold mb-3">
            No Creator Data Yet
          </h2>
          <p className="text-muted-foreground mb-6">
            As more workflows are created and shared, creator statistics
            will become available here.
          </p>
          <Button asChild>
            <Link href="/">Browse Workflows</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Top Creators</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover our most valuable workflows and community contributors
        </p>
      </div>

      {/* Most Downloaded Workflows */}
      {topDownloadedWorkflows.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Download className="h-6 w-6 text-primary" />
            Most Downloaded Workflows
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {topDownloadedWorkflows.slice(0, 10).map((workflow, index) => (
              <div
                key={workflow.id}
                className="p-4 border rounded-lg bg-card hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center">
                  {/* Rank */}
                  <div
                    className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full font-semibold mr-4 ${
                      index < 3
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {index + 1}
                  </div>

                  {/* Workflow */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{workflow.title}</div>

                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Avatar className="h-5 w-5 mr-2">
                        <AvatarImage
                          src={workflow.authorProfileImage}
                          alt={workflow.authorName}
                        />
                        <AvatarFallback>
                          {workflow.authorName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>by {workflow.authorName}</span>
                    </div>
                  </div>

                  {/* Download count */}
                  <div className="ml-4 text-center">
                    <div className="text-lg font-bold text-primary">
                      {workflow._count.downloads}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Downloads
                    </div>
                  </div>

                  {/* View button */}
                  <Button variant="outline" size="sm" asChild className="ml-4">
                    <Link href={`/workflow/${workflow.slug}`}>
                      View Workflow
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Top Contributors */}
      {topWorkflowCreators.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Top Contributors
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {topWorkflowCreators.slice(0, 3).map((contributor, index) => (
              <div
                key={contributor.id}
                className={`rounded-xl p-6 border text-center transition-all duration-300 shadow-md hover:shadow-lg ${
                  index === 0
                    ? "bg-gradient-to-b from-yellow-50 to-yellow-50/20 border-yellow-200 dark:from-yellow-950/20 dark:to-yellow-950/5 dark:border-yellow-900/30"
                    : index === 1
                    ? "bg-gradient-to-b from-gray-50 to-gray-50/20 border-gray-200 dark:from-gray-900/20 dark:to-gray-900/5 dark:border-gray-800/30"
                    : "bg-gradient-to-b from-amber-50 to-amber-50/20 border-amber-200 dark:from-amber-950/20 dark:to-amber-950/5 dark:border-amber-900/30"
                }`}
              >
                <div className="relative flex justify-center mb-4">
                  <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-800 shadow-md">
                    <AvatarImage
                      src={contributor.profileImage}
                      alt={contributor.name}
                    />
                    <AvatarFallback className="text-2xl">
                      {contributor.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Position badge */}
                  <div
                    className={`absolute -top-3 -right-3 rounded-full w-9 h-9 flex items-center justify-center text-lg font-bold shadow ${
                      index === 0
                        ? "bg-yellow-400 text-yellow-50"
                        : index === 1
                        ? "bg-gray-400 text-gray-50"
                        : "bg-amber-600 text-amber-50"
                    }`}
                  >
                    {index + 1}
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-1">{contributor.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  @{contributor.username}
                </p>

                <div className="text-3xl font-bold text-primary mb-2">
                  {contributor.workflowCount}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Total Workflows
                </p>

                <Button asChild size="sm" className="w-full">
                  <Link href={`/authors/${contributor.username}`}>
                    View Profile
                  </Link>
                </Button>
              </div>
            ))}
          </div>

          {/* Remaining top contributors */}
          {topWorkflowCreators.length > 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topWorkflowCreators.slice(3, 10).map((contributor, index) => (
                <div
                  key={contributor.id}
                  className="p-4 border rounded-lg bg-card hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center">
                    {/* Rank */}
                    <div className="bg-muted flex items-center justify-center h-8 w-8 rounded-full text-sm font-semibold mr-4">
                      {index + 4}
                    </div>

                    {/* Profile */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={contributor.profileImage}
                          alt={contributor.name}
                        />
                        <AvatarFallback>
                          {contributor.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <div className="font-medium">{contributor.name}</div>
                        <div className="text-xs text-muted-foreground">
                          @{contributor.username}
                        </div>
                      </div>
                    </div>

                    {/* Count */}
                    <div className="ml-auto text-center">
                      <div className="font-bold text-primary">
                        {contributor.workflowCount}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Workflows
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Trending This Month */}
      {trendingThisMonth.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <BarChart className="h-6 w-6 text-primary" />
            Trending This Month
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {trendingThisMonth.slice(0, 10).map((workflow, index) => (
              <div
                key={workflow.id}
                className="p-4 border rounded-lg bg-card hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center">
                  {/* Rank */}
                  <div
                    className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full font-semibold mr-4 ${
                      index < 3
                        ? "bg-primary/80 text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {index + 1}
                  </div>

                  {/* Workflow */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{workflow.title}</div>

                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Avatar className="h-5 w-5 mr-2">
                        <AvatarImage
                          src={workflow.authorProfileImage}
                          alt={workflow.authorName}
                        />
                        <AvatarFallback>
                          {workflow.authorName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>by {workflow.authorName}</span>
                    </div>
                  </div>

                  {/* View count */}
                  <div className="ml-4 text-center">
                    <div className="text-lg font-bold text-primary">
                      {workflow.recentViews}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Views this month
                    </div>
                  </div>

                  {/* View button */}
                  <Button variant="outline" size="sm" asChild className="ml-4">
                    <Link href={`/workflow/${workflow.slug}`}>
                      View Workflow
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Call to action section for creators */}
      <div className="mt-12 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 rounded-xl border border-primary/20">
        <div className="text-center max-w-3xl mx-auto">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/20 p-4 rounded-full">
              <Award className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-4">
            Join the Creator Community! 🚀
          </h3>
          <p className="text-muted-foreground mb-6 text-lg">
            Share your automation expertise with the world. Create workflows,
            build your reputation, and help others automate their work more
            efficiently.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {topWorkflowCreators.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Active Creators
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">
                {topDownloadedWorkflows.reduce(
                  (total, workflow) => total + workflow._count.downloads,
                  0
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Downloads
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {trendingThisMonth.reduce(
                  (total, workflow) => total + workflow.recentViews,
                  0
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Monthly Views
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="gap-2">
              <Link href="/dashboard/wf/create">
                <Award className="h-5 w-5" />
                Create Your First Workflow
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link href="/dashboard/wf">
                <ArrowRight className="h-5 w-5" />
                Manage My Workflows
              </Link>
            </Button>
          </div>

          <div className="mt-6 text-sm text-muted-foreground">
            💡 <strong>Pro Tip:</strong> Workflows with clear documentation and
            step-by-step guides get 3x more downloads!
          </div>
        </div>
      </div>
    </div>
  );
}