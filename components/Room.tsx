"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import Loader from "@/components/Loader";
import { LiveMap } from "@liveblocks/client";

interface RoomProps {
  children: ReactNode;
  roomId: string;
  fallback: NonNullable<ReactNode> | null;
};

export const Room = ({ 
  children, 
  roomId, 
  fallback,
 }: RoomProps) => {
  const publicApiKey = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY || "";
  return (
    <LiveblocksProvider
      publicApiKey={publicApiKey}
    >
      <RoomProvider id={roomId} 
        initialPresence={{
          cursor: null, cursorColor: null, editingText: null
        }}
        initialStorage={{
          canvasObjects: new LiveMap()
        }}
        >
      <ClientSideSuspense fallback={<Loader />}>
        {children}
      </ClientSideSuspense>
    </RoomProvider>
    </LiveblocksProvider>
  );
}