"use client";

let channel: BroadcastChannel | null = null;

export function getAuthChannel() {
  if (!channel) {
    channel = new BroadcastChannel("auth_channel_codelearn");
  }
  return channel;
}

export function broadcastAuthChange() {
  const ch = getAuthChannel();
  ch.postMessage("auth_changed");
}