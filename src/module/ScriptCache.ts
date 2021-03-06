/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
let counter = 0;
const scriptMap = new Map();

export const ScriptCache = (function (global) {
  return (scripts: any) => {
    const Cache: any = {
      _onLoad: function (key: string) {
        return (cb: any) => {
          const stored = scriptMap.get(key);
          if (stored) {
            stored.promise.then(() => {
              stored.error ? cb(stored.error) : cb(null, stored);
            });
          } else {
            // TODO:
          }
        };
      },

      _scriptTag: (key: string, src: any) => {
        if (!scriptMap.has(key)) {
          const tag: any = document.createElement('script');
          const promise = new Promise((resolve, reject) => {
            const body = document.getElementsByTagName('body')[0];

            tag.type = 'text/javascript';
            tag.async = false; // Load in order

            const cbName = `loaderCB${counter++}${Date.now()}`;
            const cleanup = (): void => {
              const gl = global as any;
              if (gl[cbName] && typeof gl[cbName] === 'function') {
                gl[cbName] = null;
              }
            };

            const handleResult = (state: any) => {
              return (evt: any) => {
                const stored = scriptMap.get(key);
                if (state === 'loaded') {
                  stored.resolved = true;
                  resolve(src);
                  // stored.handlers.forEach(h => h.call(null, stored))
                  // stored.handlers = []
                } else if (state === 'error') {
                  stored.errored = true;
                  // stored.handlers.forEach(h => h.call(null, stored))
                  // stored.handlers = [];
                  reject(evt);
                }

                cleanup();
              };
            };

            tag.onload = handleResult('loaded');
            tag.onerror = handleResult('error');
            tag.onreadystatechange = () => {
              handleResult(tag.readyState);
            };

            // Pick off callback, if there is one
            if (src.match(/callback=CALLBACK_NAME/)) {
              src = src.replace(/(callback=)[^&]+/, `$1${cbName}`);
              const w = window as any;
              w[cbName] = tag.onload;
            } else {
              tag.addEventListener('load', tag.onload);
            }
            tag.addEventListener('error', tag.onerror);

            tag.src = src;
            body.appendChild(tag);
            return tag;
          });
          const initialState = {
            loaded: false,
            error: false,
            promise: promise,
            tag,
          };
          scriptMap.set(key, initialState);
        }
        return scriptMap.get(key);
      },
    };

    Object.keys(scripts).forEach(function (key) {
      const script = scripts[key];
      const C = Cache;
      C[key] = {
        tag: C._scriptTag(key, script),
        onLoad: C._onLoad(key),
      };
    });

    return Cache;
  };
})(window);

export default ScriptCache;
