
import { Header } from "@/components/(custom)/(dashboard)/(nav)/Header";
import { Sidebar } from "@/components/(custom)/(dashboard)/(nav)/Sidebar";
import CreateProfileComponent from "@/components/(custom)/(dashboard)/CreateProfileComponent";
import { currentUser } from "@clerk/nextjs/server";

import type { Metadata } from "next";




export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await currentUser();
  const hasProfile = user?.privateMetadata.hasProfile;



  if (!hasProfile) {
  return <CreateProfileComponent/>;
  } else
    return (
      <div className="min-h-screen bg-background">
        {/* Main layout container */}
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar component - fixed on the left */}
          {/* <Sidebar /> */}
          <Sidebar />

          {/* Main content area */}
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Top header with user info, notifications, etc. */}
            {/* <Header /> */}
            <Header/>

            {/* Main scrollable content */}
            <main className="flex-1 overflow-y-auto p-6">
              {/* Dashboard content will be injected here */}
              {children}
            </main>
          </div>
        </div>
      </div>
    );
}
