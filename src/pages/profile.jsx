"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Profile() {
  const router = useRouter();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const token = localStorage.getItem("token");
    if(!token){
      router.push("/login");
    }
    if (storedUsername) {
      router.replace(`/profile/${storedUsername}`);
    } else {
      router.replace("/login");
    }
  }, [router]);

  return <p>Redirecionando...</p>;
}
