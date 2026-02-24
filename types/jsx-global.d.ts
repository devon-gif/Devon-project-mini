/**
 * Global JSX and React namespaces so JSX.IntrinsicElements and React.ReactNode
 * resolve when @types/react isn't available to the IDE.
 */
declare namespace React {
  type ReactNode =
    | string
    | number
    | boolean
    | null
    | undefined
    | ReactElement
    | ReactNode[];
  interface ReactElement {
    type: unknown;
    props: unknown;
    key?: string | null;
  }
  interface ChangeEvent<T = unknown> {
    target: T;
    currentTarget: T;
  }
  interface FormEvent<T = unknown> {
    target: T;
    currentTarget: T;
    preventDefault(): void;
  }
}

declare namespace JSX {
  interface Element extends React.ReactElement {}
  interface ElementClass {
    render(): React.ReactNode;
  }
  interface ElementAttributesProperty {
    props: unknown;
  }
  interface IntrinsicElements {
    [tag: string]: Record<string, unknown>;
  }
}
