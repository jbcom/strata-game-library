import { ReactNode, ComponentType, LazyExoticComponent } from 'react';

export interface DemoMetadata {
  slug: string;
  title: string;
  description: string;
  chips: string[];
  features: string[];
  code: string;
}

export interface DemoSceneProps {
  controls: Record<string, unknown>;
}

export interface DemoControlsProps {
  controls: Record<string, unknown>;
  setControls: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
}

export interface DemoModule {
  metadata: DemoMetadata;
  Scene: ComponentType<DemoSceneProps>;
  Controls?: ComponentType<DemoControlsProps>;
  defaultControls?: Record<string, unknown>;
}

export interface DemoRegistryEntry {
  slug: string;
  title: string;
  category: DemoCategory;
  loader: () => Promise<DemoModule>;
}

export type DemoCategory =
  | 'core'
  | 'environment'
  | 'effects'
  | 'gameplay'
  | 'systems';

export const CATEGORY_LABELS: Record<DemoCategory, string> = {
  core: 'Core Graphics',
  environment: 'Environment',
  effects: 'Visual Effects',
  gameplay: 'Gameplay',
  systems: 'Systems',
};
