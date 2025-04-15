import type { Text } from '@/node';
import type { DelimiterRun } from '@/parser';
/**
 * Delimiter (emphasis, strong emphasis or custom emphasis).
 */
declare class Delimiter implements DelimiterRun {
    readonly characters: Text[];
    readonly delimiterChar: string;
    private readonly originalLength;
    private readonly canOpen;
    private readonly canClose;
    previous: Delimiter | null;
    next: Delimiter | null;
    constructor(characters: Text[], delimiterChar: string, canOpen: boolean, canClose: boolean, previous: Delimiter | null);
    getCanOpen(): boolean;
    getCanClose(): boolean;
    length(): number;
    getOriginalLength(): number;
    getOpener(): Text;
    getCloser(): Text;
    getOpeners(length: number): Text[];
    getClosers(length: number): Text[];
}
export default Delimiter;
