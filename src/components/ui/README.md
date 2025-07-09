# UI Components

This directory contains reusable UI components for the VetSidekick application, designed to work with the existing Tailwind CSS design system.

## Components

### Button
A standardized button component with multiple variants and sizes.

```tsx
import { Button } from '@/components/ui';

// Basic usage
<Button onClick={() => console.log('clicked')}>Click me</Button>

// With variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>

// With sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// With loading state
<Button loading={true}>Loading...</Button>
```

### Input
A standardized input component with label and error support.

```tsx
import { Input } from '@/components/ui';

const [value, setValue] = useState('');
const [error, setError] = useState('');

<Input
  label="Email"
  type="email"
  value={value}
  onChange={setValue}
  error={error}
  required
  placeholder="Enter your email"
/>
```

### Card
A container component for content sections.

```tsx
import { Card, Button } from '@/components/ui';

<Card 
  title="Card Title"
  actions={<Button size="sm">Action</Button>}
>
  <p>Card content goes here</p>
</Card>
```

### LoadingState
A loading spinner component with customizable message and size.

```tsx
import { LoadingState } from '@/components/ui';

<LoadingState message="Loading data..." size="lg" />
```

### ErrorDisplay
An error display component with optional retry and dismiss functionality.

```tsx
import { ErrorDisplay } from '@/components/ui';

<ErrorDisplay 
  error="Something went wrong"
  onRetry={() => refetch()}
  onDismiss={() => setError(null)}
/>
```

## Usage

Import individual components:
```tsx
import { Button, Input, Card } from '@/components/ui';
```

Or import the entire module:
```tsx
import * as UI from '@/components/ui';

<UI.Button>Click me</UI.Button>
```

## Design System Integration

These components are designed to work seamlessly with the existing VetSidekick design system:

- Uses custom color palette (primary, secondary, neutral, error)
- Follows existing shadow system (shadow-soft, shadow-medium)
- Integrates with custom animations and transitions
- Maintains consistent typography and spacing

## Customization

All components accept a `className` prop for additional styling:

```tsx
<Button className="w-full mt-4">Full width button</Button>
<Input className="mb-6" label="Custom spacing" />
<Card className="max-w-md">Constrained width card</Card>
```