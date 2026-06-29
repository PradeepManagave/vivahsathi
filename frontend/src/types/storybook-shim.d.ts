declare module '@storybook/react' {
  type AnyComp = React.ComponentType<unknown> | React.ForwardRefExoticComponent<unknown>;
  export interface Meta<T = any> {
    title?: string;
    component?: AnyComp;
    decorators?: unknown[];
    parameters?: Record<string, unknown>;
    args?: Partial<T>;
    argTypes?: Record<string, unknown>;
    tags?: string[];
  }
  export interface StoryObj<T = any> {
    args?: Partial<T>;
    render?: (args: T) => React.ReactNode;
    decorators?: unknown[];
    parameters?: Record<string, unknown>;
    play?: (context: unknown) => void | Promise<void>;
    name?: string;
  }
  export type StoryFn<T = any> = (args: T) => React.ReactNode;
}
