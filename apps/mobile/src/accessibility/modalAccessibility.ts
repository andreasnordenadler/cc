export type ModalAccessibilityControllerDependencies<T> = {
  dismiss: () => void;
  canDismiss?: () => boolean;
  getInitialFocusTarget: () => T | null;
  findNodeHandle: (target: T | null) => number | null;
  setAccessibilityFocus: (nodeHandle: number) => void;
};

export function createModalAccessibilityController<T>(
  dependencies: ModalAccessibilityControllerDependencies<T>,
) {
  function dismiss() {
    if (dependencies.canDismiss?.() === false) return;
    dependencies.dismiss();
  }

  function focusInitial() {
    const nodeHandle = dependencies.findNodeHandle(dependencies.getInitialFocusTarget());
    if (nodeHandle !== null) dependencies.setAccessibilityFocus(nodeHandle);
  }

  return {
    dismiss,
    focusInitial,
  };
}
