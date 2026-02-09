import { AnyFunction } from '@softsky/utils'

export class Base {
  protected runOnDestroy: AnyFunction[] = []

  /** Will run all runOnDestroy functions and unregister from all events */
  public destroy() {
    for (let index = 0; index < this.runOnDestroy.length; index++)
      this.runOnDestroy[index]!()
  }

  /** Build object with all found objects via querySelector */
  protected populateElementsWithSelector(
    element: HTMLElement,
    selectors: Record<string, string>,
  ) {
    for (const key in selectors) {
      ;(this as unknown as Record<string, HTMLElement>)[key] =
        element.querySelector(selectors[key]!)!
    }
  }

  /** Safely append element to document body when available. */
  protected appendToBody(element: HTMLElement): void {
    const append = () => {
      document.body?.append(element)
    }
    if (document.body) {
      append()
      return
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', append, { once: true })
      return
    }
    append()
  }

  /**
   * Register autocleared event handler.
   * If using classes methods don't forget to `bind(this)`
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  protected registerEvent<T extends Event>(
    target: EventTarget,
    type: string,
    listener: (event: T) => void,
    options: AddEventListenerOptions = {},
  ): void {
    options.passive ??= true
    target.addEventListener(type, listener as EventListener, options)
    this.runOnDestroy.push(() => {
      target.removeEventListener(type, listener as EventListener)
    })
  }
}
