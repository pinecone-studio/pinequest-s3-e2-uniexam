"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

const ULAANBAATAR_TIMEZONE = "Asia/Ulaanbaatar";

const getGreetingByHour = () => {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hour12: false,
      timeZone: ULAANBAATAR_TIMEZONE,
    }).format(new Date()),
  );

  if (hour >= 4 && hour <= 10) {
    return "Өглөөний мэнд";
  }

  if (hour >= 11 && hour <= 17) {
    return "Өдрийн мэнд";
  }

  return "Оройн мэнд";
};

export const Header = () => {
  const { user, isLoaded } = useUser();
  const [greeting, setGreeting] = useState(getGreetingByHour);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setGreeting(getGreetingByHour());
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  const displayName =
    user?.fullName ||
    user?.firstName ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress ||
    "хэрэглэгч";

  return (
    <header className="mb-3">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        {greeting}, {isLoaded ? displayName : "хэрэглэгч"}
      </h1>
      <p className="mt-1 text-slate-500">
        Энэ долоо хоногийн шалгалтын мэдээлэл, явцыг эндээс хараарай.
      </p>
    </header>
  );
};
