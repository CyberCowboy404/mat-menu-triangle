import { Directive, HostListener, Input } from '@angular/core'

type MenuPosition = "top" | "bottom"

export type MatMenuTriangleConfig = {
  classNameSelector: string
  left?: number
  right?: number
}

@Directive({
  selector: '[efMatMenuTriangle]'
})
export class MatMenuTriangleDirective {
  mutationObserver: MutationObserver
  resizeMutationObserver: MutationObserver
  private triangleElement: HTMLDivElement
  private observer: MutationObserver
  @Input() triangleClassName: string = "mat-menu-triangle"
  @Input() triangleTopClassName: string = "mat-menu-triangle-top"
  @Input() triangleBottomClassName: string = "mat-menu-triangle-bottom"
  @Input() boundingBoxTopClassName: string = "bounding-box-top"
  @Input() boundingBoxBottomClassName: string = "bounding-box-bottom"
  private matMenuContainer: HTMLElement | null
  private boundingBoxContainer: HTMLElement | null
  @Input() efMatMenuTriangle: MatMenuTriangleConfig[]
  @Input() efMatMenuTriangleIndent: number = 15
  activeConfig: MatMenuTriangleConfig
  resizeHandler: EventListener
  overlayContainerSelector: string = ".cdk-overlay-connected-position-bounding-box"
  currentBottomPosition: number
  currentTopPosition: number

  constructor() {
  }

  ngOnInit () {
    const id: string = "mat-menu-triangle-styles"
    const cssElem = document.getElementById(id)
    if (cssElem) return

    // Common styles
    const triangleStylesCommon = `
      position: absolute;
      display: none;
      opacity: 0;
      width: 20px;
      height: 20px;
      overflow: hidden;
    `;
    const trianglePseudoStylesCommon = `
      content: "";
      position: absolute;
      width: 20px;
      height: 20px;
      background: #fff;
      transform: rotate(45deg);
      left: 0;
      box-shadow: 1px 2px 5px 0px rgb(188 188 188);
    `;
    // Main styles
    const triangleStyles: string = `
    .cdk-overlay-connected-position-bounding-box.${this.boundingBoxBottomClassName} {
      padding-top: ${this.efMatMenuTriangleIndent}px;
    }
    .cdk-overlay-connected-position-bounding-box.${this.boundingBoxTopClassName} {
      padding-bottom: ${this.efMatMenuTriangleIndent}px;
    }

    .mat-menu-panel + .${this.triangleClassName} {
      display: block;
      opacity: 1;
    }

    .${this.triangleTopClassName} {
      ${triangleStylesCommon}
      top: calc(-20px + ${this.efMatMenuTriangleIndent}px);
    }

    .${this.triangleBottomClassName} {
      ${triangleStylesCommon}
      bottom: calc(-20px + ${this.efMatMenuTriangleIndent}px);
    }

    .${this.triangleTopClassName}:after {
      ${trianglePseudoStylesCommon}
      top: 15px;
    }

    .${this.triangleBottomClassName}:after {
      ${trianglePseudoStylesCommon}
      top: -15px;
    }
    `
    const css: HTMLStyleElement = document.createElement("style")

    css.id = id
    css.appendChild(document.createTextNode(triangleStyles))
    document.head.appendChild(css)

    this.removeTriangleFromDOM()
  }

  ngOnDestroy () {
    this.observer.disconnect()
    this.resizeMutationObserver?.disconnect()
  }

  @HostListener("click", ["$event.target"]) click (element: HTMLElement) {
    this.efMatMenuTriangle.forEach(config => {
      const className = config.classNameSelector
      if (element.classList.contains(className) || element.closest(`.${className}`)) {
        const shownPosition: MenuPosition = this.getPosition()
        this.activeConfig = config
        this.drawTriangle(shownPosition)
        this.observeResize()
      }
    })
  }

  /** Mat menu appears to close to the trigger element. This method adds indent relative to the position of menu 
   * @returns { MenuPosition } the position from which the menu was shown. "bottom" if position of menu on top of element and "top" if menu under element.
  */
  private getPosition (): MenuPosition {
    const overlayContainer: HTMLElement | null = document.querySelector(this.overlayContainerSelector)
    if (overlayContainer) {
      const top = getComputedStyle(overlayContainer).top
      return !!parseInt(top) ? "bottom" : "top"
    }
    return "top"
  }

  private drawTriangle (position: MenuPosition) {
    const { left, right } = this.activeConfig
    this.matMenuContainer = document.querySelector(".mat-menu-panel")
    this.boundingBoxContainer = document.querySelector(".cdk-overlay-connected-position-bounding-box")

    if (!this.triangleElement) {
      this.triangleElement = document.createElement("div")
    }

    const triangleClassList = this.triangleElement.classList
    const boundingBoxClassList = this.boundingBoxContainer?.classList

    boundingBoxClassList?.remove(this.boundingBoxTopClassName)
    boundingBoxClassList?.remove(this.boundingBoxBottomClassName)
    triangleClassList.remove(this.triangleTopClassName)
    triangleClassList.remove(this.triangleBottomClassName)
    triangleClassList.add(this.triangleClassName)

    this.matMenuContainer?.parentElement?.appendChild(this.triangleElement)

    this.triangleElement.style.left = ""
    this.triangleElement.style.right = "null"

    this.activeConfig.left ? this.triangleElement.style.left = left + "px" : this.triangleElement.style.right = right + "px"

    if (position === "top") {
      triangleClassList.add(this.triangleBottomClassName)
      boundingBoxClassList?.add(this.boundingBoxTopClassName)
    } else if (position === "bottom") {
      triangleClassList.add(this.triangleTopClassName)
      boundingBoxClassList?.add(this.boundingBoxBottomClassName)
    }
  }

  /** Removes inserted element from mat menu overlay container on mat menu close event.
   * If we not remove inserted element from the container mat menu module will be creating duplicated elements
   * as result we will have a lot of repeated elements which are difficult to handle
   */
  private removeTriangleFromDOM () {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((record) => {
        record.removedNodes.forEach((removed: Node) => {
          if ((removed as HTMLElement).classList.contains("mat-menu-panel")) {
            this.removeTriangle()
          }
        })
      })
    })

    this.observer.observe(document.body, { subtree: true, childList: true })
  }

  private removeTriangle () {
    const elemToRemove = document.querySelector(`.${this.triangleClassName}`)
    elemToRemove && document.querySelector(`.${this.triangleClassName}`)?.remove()
  }

  private observeResize () {
    const matMenuContainer = document.querySelector(this.overlayContainerSelector)
    this.resizeMutationObserver = new MutationObserver((mutations: MutationRecord[]) => {
      this.drawTriangle(this.getPosition())
    })

    matMenuContainer && this.resizeMutationObserver.observe(matMenuContainer, {
      subtree: false,
      childList: false,
      attributeOldValue: true,
      attributeFilter: ["style"]
    })
  }
}
