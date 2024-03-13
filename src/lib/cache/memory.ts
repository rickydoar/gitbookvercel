import { CacheBackend, CacheEntry } from './types';
import { isCacheEntryImmutable } from './utils';

export const memoryCache: CacheBackend = {
    name: 'memory',
    replication: 'local',
    async get(key) {
        const memoryCache = getMemoryCache();
        const memoryEntry = memoryCache.get(key);

        if (!memoryEntry) {
            return null;
        }

        if (memoryEntry.meta.expiresAt > Date.now()) {
            return memoryEntry;
        } else {
            memoryCache.delete(key);
        }

        return null;
    },
    async set(key, entry) {
        const memoryCache = getMemoryCache();
        memoryCache.set(key, {
            ...entry,
            meta: {
                ...entry.meta,
                ...(isCacheEntryImmutable(entry.meta) || process.env.NODE_ENV === 'development'
                    ? {}
                    : {
                          // For mutable entries, we limit the cache to 1 minute
                          // as it could be invalidated at any time.
                          expiresAt: Math.min(
                              entry.meta.setAt ?? Date.now() + 60 * 1000,
                              entry.meta.expiresAt,
                          ),
                      }),
            },
        });
    },
    async del(keys) {
        const memoryCache = getMemoryCache();
        keys.forEach((key) => memoryCache.delete(key));
    },
    async revalidateTags(tags) {
        const memoryCache = getMemoryCache();
        const keys: string[] = [];

        memoryCache.forEach((entry, key) => {
            if (tags.some((tag) => entry.meta.tags.includes(tag))) {
                keys.push(key);
                memoryCache.delete(key);
            }
        });

        return {
            keys,
            metas: [],
        };
    },
};

/**
 * With next-on-pages, the code seems to be isolated between the middleware and the handler.
 * To share the cache between the two, we use a global variable.
 */
function getMemoryCache(): Map<string, CacheEntry> {
    // @ts-ignore
    if (!globalThis.gitbookMemoryCache) {
        // @ts-ignore
        globalThis.gitbookMemoryCache = new Map();
    }

    // @ts-ignore
    return globalThis.gitbookMemoryCache;
}
