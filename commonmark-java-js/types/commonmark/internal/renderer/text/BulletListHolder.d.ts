import type { BulletList } from '@/node';
import ListHolder from './ListHolder';
declare class BulletListHolder extends ListHolder {
    private readonly marker;
    constructor(parent: ListHolder | null, list: BulletList);
    getMarker(): string | undefined;
}
export default BulletListHolder;
