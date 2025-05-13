// app/community/leaderboard/page.tsx
import LeaderboardContent from "@/components/(custom)/Leaderboard";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: "Top Contributors Leaderboard | n8n-store",
  description: "Discover the most active workflow creators on n8n-store. See who's sharing the most valuable automation templates with the community.",
  keywords: ["n8n leaderboard", "top workflow creators", "n8n contributors", "automation experts", "workflow leaderboard"],
};

export default async function LeaderboardPage() {
  // Server component that loads the data server-side
  return <LeaderboardContent/>;
}