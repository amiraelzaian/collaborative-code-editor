import * as Y from "yjs";
import { prisma } from "../lib/prisma";

const SAVE_DELAY_MS = 2000;

interface Entry {
    doc: Y.Doc;
    refs: number; // how many sockets are using this doc right now
    timer: NodeJS.Timeout | null;
    dirty: boolean; // has changes not yet saved
}

// one in-memory Y.Doc per open room; we store the Promise so two
// people joining at the same time share ONE load from the database
const entries = new Map<string, Promise<Entry>>();

async function save(roomId: string, entry: Entry) {
    if (entry.timer) {
        clearTimeout(entry.timer);
        entry.timer = null;
    }
    if (!entry.dirty) return;
    entry.dirty = false;

    const state = new Uint8Array(Y.encodeStateAsUpdate(entry.doc));
    try {
        await prisma.documentSnapshot.upsert({
            where: { roomId },
            create: { roomId, state },
            update: { state, version: { increment: 1 } },
            select: { version: true },
        });
    } catch (err) {
        entry.dirty = true; // try again on the next change
        console.error(`[yjs] save failed for room ${roomId}:`, err);
    }
}

function scheduleSave(roomId: string, entry: Entry) {
    if (entry.timer) clearTimeout(entry.timer);
    entry.timer = setTimeout(() => void save(roomId, entry), SAVE_DELAY_MS);
}

async function load(roomId: string): Promise<Entry> {
    const doc = new Y.Doc();
    const snapshot = await prisma.documentSnapshot.findUnique({
        where: { roomId },
        select: { state: true },
    });
    if (snapshot && snapshot.state.length > 0) {
        Y.applyUpdate(doc, new Uint8Array(snapshot.state));
    }

    const entry: Entry = { doc, refs: 0, timer: null, dirty: false };
    doc.on("update", () => {
        entry.dirty = true;
        scheduleSave(roomId, entry);
    });
    return entry;
}

export async function acquireDoc(roomId: string): Promise<Y.Doc> {
    let promise = entries.get(roomId);
    if (!promise) {
        promise = load(roomId);
        entries.set(roomId, promise);
        promise.catch(() => entries.delete(roomId)); // failed load: allow retry
    }
    const entry = await promise;
    entry.refs += 1;
    return entry.doc;
}

export async function getDoc(roomId: string): Promise<Y.Doc | null> {
    const promise = entries.get(roomId);
    return promise ? (await promise).doc : null;
}

export async function releaseDoc(roomId: string) {
    const promise = entries.get(roomId);
    if (!promise) return;
    const entry = await promise;

    entry.refs -= 1;
    if (entry.refs > 0) return;

    await save(roomId, entry); // save BEFORE dropping from memory
    if (entry.refs === 0) {
        // nobody joined while we were saving
        entry.doc.destroy();
        entries.delete(roomId);
    }
}