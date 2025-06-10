import CreatePost from "@/components/CreatePost";
import WhoToFollow from "@/components/whoToFollow";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const user = await currentUser();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <div className="lg:cols-span-6">{user ? <CreatePost /> : null}</div>
      <div className="hidden lg:block lg:cols-span-4 sticky top-20">
        <WhoToFollow />
      </div>
    </div>
  );
}
