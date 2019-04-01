export declare const ScriptCache: (scripts: any) => {
    _onLoad: (key: string) => (cb: any) => void;
    _scriptTag: (key: string, src: any) => any;
};
export default ScriptCache;
