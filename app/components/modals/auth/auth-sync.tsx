"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthChannel } from "@/config/auth-channel";

export default function AuthSync() {
    const router = useRouter();

    useEffect(() => {
        const channel = getAuthChannel();

        channel.onmessage = (event) => {
            if (event.data === "auth_changed") {
                router.refresh();
            }
        };

        return () => {
            channel.close();
        };
    }, [router]);

    return null;
}