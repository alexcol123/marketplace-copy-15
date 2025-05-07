

import CategoriesList from "@/components/(custom)/CategoriesList";
import CardsContainer from "@/components/(custom)/(landing)/CardsContainer";
import Navbar from "@/components/(custom)/(landing)/Navbar";
import Footer from "@/components/(custom)/(landing)/Footer";


export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category: string; search: string }>;
}) {
  const category = (await searchParams).category;
  const search = (await searchParams).search;

  return (
    <div className="flex flex-col min-h-screen bg-background ">
      {/* Navbar */}
      <Navbar/>

      {/* Hero Section */}
      <div className="flex-grow pt-4 ">
        <CategoriesList category={category} search={search} />

        <div className="container mx-auto ">
          <CardsContainer category={category} search={search} />
        </div>
      </div>

      <Footer/>
    </div>
  );
}
