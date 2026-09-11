export type ModalAccessibilityControllerDependencies<T> = {
  dismiss: () => void;
  getInitialFocusTarget: () => T | null;
  findNodeHandle: (target: T | null) => number | null;
  setAccessibilityFocus: (nodeHandle: number) => void;
};

export function createModalAccessibilityController<T>(
  dependencies: ModalAccessibilityControllerDependencies<T>,
) {
  function focusInitial() {
    const nodeHandle = dependencies.findNodeHandle(dependencies.getInitialFocusTarget());
    if (nodeHandle !== null) dependencies.setAccessibilityFocus(nodeHandle);
  }

  return {
    dismiss: dependencies.dismiss,
    focusInitial,
  };
}
