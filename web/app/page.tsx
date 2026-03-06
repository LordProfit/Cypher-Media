import { Feed } from "@/components/feed";
import { Header } from "@/components/header";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <Header />
      <div className="mx-auto max-w-xl px-4 py-4">
        <Feed />
      </div>
    </main>
  );
}