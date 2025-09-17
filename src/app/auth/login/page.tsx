import { signupWithGoogle } from "./actions";
import { Button } from "@/components/ui/button";
export default function LoginPage() {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center p-6 bg-[#f8f9fa] ">
      <Button variant="outline" onClick={signupWithGoogle}>
        Signup with google
      </Button>
    </div>
  );
}
