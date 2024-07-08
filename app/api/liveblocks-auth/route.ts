import { auth } from '@/auth';
import { Liveblocks } from '@liveblocks/node';

const liveblocks = new Liveblocks({
    secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: Request) {
    const session = await auth();
    if (!session || !session.user) {
        return new Response("Unauthorized", { status: 403 });
    }

    const { room } = await request.json();

    const userInfo = {
        name: session.user.name || "Teammate",
        picture: session.user.image || undefined,
    };

    const liveblocksSession = liveblocks.prepareSession(
        session.user.id ?? '',
        { userInfo }
    );

    if (room) {
        liveblocksSession.allow(room, liveblocksSession.FULL_ACCESS);
    }

    const { status, body } = await liveblocksSession.authorize();
    return new Response(body, { status });
}