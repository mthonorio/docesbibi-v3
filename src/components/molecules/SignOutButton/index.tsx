"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/atoms/Button";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await signOut({ redirect: false });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <Button variant="outline" onClick={handleSignOut} disabled={loading}>
      {loading ? "Saindo..." : "Sair"}
    </Button>
  );
}
