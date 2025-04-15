import type { Node } from 'commonmark-java-js';
import type ContentView from './views/abstracts/contentview';

class NodeRelationMap implements Map<typeof Node, typeof ContentView> {
  private nodeRelationMap: Map<typeof Node, typeof ContentView>;

  constructor(map?: Map<typeof Node, typeof ContentView>) {
    this.nodeRelationMap = new Map(map);
  }

  get size(): number {
    return this.nodeRelationMap.size;
  }

  get(key: typeof Node): typeof ContentView | undefined {
    return this.nodeRelationMap.get(key);
  }

  set(key: typeof Node, value: typeof ContentView): this {
    this.nodeRelationMap.set(key, value);
    return this;
  }

  add(map: Map<typeof Node, typeof ContentView>): this {
    for (const [key, value] of map) {
      this.set(key, value);
    }

    return this;
  }

  exclude(excludes: Array<typeof Node>): this {
    for (const key of excludes) {
      this.has(key) && this.delete(key);
    }

    return this;
  }

  delete(key: typeof Node): boolean {
    return this.nodeRelationMap.delete(key);
  }

  clear(): void {
    this.nodeRelationMap.clear();
  }

  has(key: typeof Node): boolean {
    return this.nodeRelationMap.has(key);
  }

  keys(): MapIterator<typeof Node> {
    return this.nodeRelationMap.keys();
  }

  values(): MapIterator<typeof ContentView> {
    return this.nodeRelationMap.values();
  }

  entries(): MapIterator<[typeof Node, typeof ContentView]> {
    return this.nodeRelationMap.entries();
  }

  forEach(
    callbackfn: (
      value: typeof ContentView,
      key: typeof Node,
      map: Map<typeof Node, typeof ContentView>
    ) => void,
    thisArg?: any
  ): void {
    this.nodeRelationMap.forEach(callbackfn, thisArg);
  }

  [Symbol.iterator](): MapIterator<[typeof Node, typeof ContentView]> {
    return this.nodeRelationMap[Symbol.iterator]();
  }

  [Symbol.toStringTag]: string = 'NodeRelationMap';
}

export default NodeRelationMap;
