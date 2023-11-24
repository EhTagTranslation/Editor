import { gunzipSync, strToU8, strFromU8 } from 'fflate';

// eval
(typeof globalThis !== 'undefined'
    ? globalThis
    : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
        ? global
        : typeof self !== 'undefined'
          ? self
          : {})[__EH_TOOL_RELEASE_CALLBACK__](
    JSON.parse(strFromU8(gunzipSync(strToU8(atob('__EH_TOOL_RELEASE_DATA__'), true)))),
);
