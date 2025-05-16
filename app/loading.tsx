import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-background">
      <div className="relative w-48 h-48 mb-8">
        <Image
          src="/logo.png"
          alt="Solum Health Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-lg text-muted-foreground">Loading...</p>
    </div>
  );
}
