import { Button } from "@/components/ui/button";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export default function Home() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Welcome to My App</h1>
    </div>
  );
}
