# TanStack Form Integration

This directory contains utilities for integrating TanStack Form with RedwoodSDK server functions, solving the FormData/realtime client compatibility issues.

## Overview

TanStack Form provides superior client-side form state management while maintaining compatibility with RedwoodSDK's realtime client by using plain JavaScript objects instead of FormData.

## Key Benefits

- ✅ **Solves FormData/Realtime Incompatibility**: Native plain object submissions
- ✅ **Enhanced State Management**: Automatic form state, validation, and error handling
- ✅ **Type Safety**: Full TypeScript integration with Zod validation
- ✅ **Better UX**: Consistent loading states and validation feedback

## Files

### `config.ts`

Form configuration utilities for consistent setup across the application.

```typescript
import { createFormConfig } from "@/lib/form/config";
import { mySchema } from "@/lib/validators/my-schema";

const formConfig = createFormConfig({
  defaultValues: { name: "", email: "" },
  validationSchema: mySchema,
});
```

### `utils.tsx`

Utility functions and components for form handling.

```typescript
import { FieldErrors, prepareFormData, fieldValidators } from '@/lib/form/utils';

// Display validation errors
<FieldErrors errors={field.state.meta.errors} />

// Prepare form data for server submission
const preparedData = prepareFormData(formState);

// Use common validators
validators: { onChange: fieldValidators.required }
```

### `server-integration.ts`

Hook for integrating TanStack Form with RedwoodSDK server functions.

```typescript
import { useServerFormSubmission } from "@/lib/form/server-integration";

const { handleSubmit, isPending } = useServerFormSubmission({
  serverAction: myServerFunction,
  onSuccess: (data) => toast.success("Success!"),
  onError: (error) => toast.error("Error!"),
});
```

## Usage Patterns

### Basic Form Setup

```typescript
import { useForm } from "@tanstack/react-form";
import { createFormConfig } from "@/lib/form/config";
import { FieldErrors, fieldValidators } from "@/lib/form/utils";

const form = useForm({
  ...createFormConfig({
    defaultValues: { name: "", email: "" },
    validationSchema: mySchema,
  }),
  onSubmit: async ({ value }) => {
    const result = await myServerFunction(value);
    // Handle result
  },
});
```

### Field Component Pattern

```typescript
<form.Field
  name="email"
  validators={{ onChange: fieldValidators.email }}
  children={(field) => (
    <div className="space-y-2">
      <Label htmlFor={field.name}>Email</Label>
      <Input
        id={field.name}
        value={field.state.value || ''}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
      />
      <FieldErrors errors={field.state.meta.errors} />
    </div>
  )}
/>
```

### File Upload Pattern

```typescript
import { createFileFieldValue } from '@/lib/form/utils';

<form.Field
  name="avatar"
  children={(field) => (
    <Input
      type="file"
      accept="image/*"
      onChange={async (e) => {
        const file = e.target.files?.[0];
        const fileValue = await createFileFieldValue(file || null);
        field.handleChange(fileValue);
      }}
    />
  )}
/>
```

### Server Function Integration

```typescript
// Server function (updated to accept plain objects)
"use server";
export async function createUser(data: Record<string, any>) {
  const validated = userSchema.parse(data);
  await db.user.create({ data: validated });
  await renderRealtimeClients({ key: "/users" });
  return { success: true };
}

// Client form
const { handleSubmit, isPending } = useServerFormSubmission({
  serverAction: createUser,
  onSuccess: () => toast.success("User created!"),
  onError: (error) => toast.error("Failed to create user"),
});
```

## Migration from Existing Forms

### Before (Manual State Management)

```typescript
const [formData, setFormData] = useState({ name: "", email: "" });
const [errors, setErrors] = useState({});
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  // Manual FormData creation and conversion
  const formDataObj = new FormData();
  formDataObj.append("name", formData.name);
  formDataObj.append("email", formData.email);

  // Manual conversion to plain object for realtime compatibility
  const plainObject = {
    name: formDataObj.get("name"),
    email: formDataObj.get("email"),
  };

  const result = await serverFunction(plainObject);
  setIsLoading(false);
};
```

### After (TanStack Form)

```typescript
const form = useForm({
  ...createFormConfig({
    defaultValues: { name: "", email: "" },
    validationSchema: userSchema,
  }),
  onSubmit: async ({ value }) => {
    const result = await serverFunction(value); // Direct plain object!
  },
});
```

## Best Practices

1. **Use createFormConfig**: Always use the configuration helper for consistency
2. **Leverage fieldValidators**: Use common validators instead of writing custom ones
3. **Handle Files Properly**: Use createFileFieldValue for file uploads
4. **Type Everything**: Provide proper TypeScript types for form values
5. **Error Handling**: Use FieldErrors component for consistent error display
6. **Server Integration**: Use useServerFormSubmission hook for server function calls

## Common Patterns

### Dynamic Fields

```typescript
// Add/remove fields dynamically
const [contacts, setContacts] = useState([{ name: "", email: "" }]);

const addContact = () => setContacts([...contacts, { name: "", email: "" }]);
const removeContact = (index) =>
  setContacts(contacts.filter((_, i) => i !== index));
```

### Conditional Validation

```typescript
validators: {
  onChange: ({ value, formApi }) => {
    const otherField = formApi.getFieldValue("otherField");
    if (otherField === "required" && !value) {
      return "This field is required when other field is set";
    }
  };
}
```

### Async Validation

```typescript
validators: {
  onChangeAsyncDebounceMs: 500,
  onChangeAsync: async ({ value }) => {
    const exists = await checkIfExists(value);
    return exists ? 'Already exists' : undefined;
  }
}
```

## Troubleshooting

### Common Issues

1. **FormData Errors**: If you see "[Object object]" errors, ensure you're using plain objects, not FormData
2. **Validation Not Working**: Check that you're using the correct validator adapter and schema
3. **Realtime Not Updating**: Ensure server functions call `renderRealtimeClients()` after mutations
4. **Type Errors**: Make sure form values match your Zod schema types

### Performance Tips

1. Use `React.memo` for field components if needed
2. Debounce async validation with `onChangeAsyncDebounceMs`
3. Use `useCallback` for event handlers in complex forms
4. Consider field-level validation vs form-level validation based on use case

## Examples

See the implementation examples in:

- `src/components/forms/` - Migrated form components
- `src/app/pages/*/functions.ts` - Updated server functions
- Integration tests in the test suite
