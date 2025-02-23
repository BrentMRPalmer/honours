## Export module variables at EOF

Example of ❌:

```typescript
export interface ComponentProps {}

export function Component(props: ComponentProps) {}
```

Example of ✅:

```typescript
interface ComponentProps {}

function Component(props: ComponentProps) {}

export { Component };

export type { ComponentProps };
```

## Import and export typescript types as type

Example of ❌:

```typescript
import { Type } from '@/types';

export { Type };
```

Example of ✅:

```typescript
import type { Type } from '@/types';

export type { Type };
```

## Use absolute over relative paths

Example of ❌:

```typescript
import {} from '../../lib/util.ts';
```

Example of ✅:

```typescript
import {} from '@/lib/util.ts';
```

## Import `Icon` variant from lucide

Example of ❌:

```typescript
import { Database } from 'lucide-react';
```

Example of ✅:

```typescript
import { DatabaseIcon } from 'lucide-react';
```

## Use kebab case for file names

Example of ❌:

```bash
globalStore.ts
```

Example of ✅:

```bash
global-store.ts
```

## Use pascal case for function and context names

Example of ❌:

```typescript
const viewContext = createContext();

function viewComponent() {}
```

Example of ✅:

```typescript
const ViewContext = createContext();

function ViewComponent() {}
```

## Use Camel Case for variable names

Example of ❌:

```typescript
let num_connections = 0;
```

Example of ✅:

```typescript
let numConnections = 0;
```
