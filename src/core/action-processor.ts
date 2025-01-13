type ActionExecutor = () => void;

/** Action queue. Controls the orderly execution of actions. */
class ActionProcessor {
  private queue: ActionExecutor[] = [];

  private isRunning = false;

  public get length(): number {
    return this.queue.length;
  }

  public enqueue(executor: ActionExecutor): void {
    this.queue.push(executor);

    if (!this.isRunning) {
      this.isRunning = true;

      this.process();
    }
  }

  public dequeue(): ActionExecutor | null {
    if (this.isEmpty()) {
      return null;
    }

    return this.queue.shift() as ActionExecutor;
  }

  public isEmpty(): boolean {
    return this.queue.length === 0;
  }

  private process() {
    window.requestAnimationFrame(this.exec);
  }

  private exec = () => {
    const executor = this.dequeue();

    if (!executor) {
      return;
    }

    executor();

    if (this.isEmpty()) {
      this.isRunning = false;
    } else {
      this.process();
    }
  };
}

export default ActionProcessor;
