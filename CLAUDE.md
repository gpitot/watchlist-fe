# CLAUDE.md - AI Assistant Development Guide

## Project Overview

**Watchlist FE** is a React-based web application for managing movie and TV show watchlists. Users can search for content, track what they've watched, rate shows, and share their watchlists with others. The app integrates with The Movie Database (TMDB) API via Supabase Edge Functions and uses Supabase for authentication and data storage.

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS + PostCSS
- **State Management**: React Query (v3) for server state
- **Forms**: React Final Form
- **Routing**: React Router v6
- **UI Components**: React Aria Components
- **Backend/Auth**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Package Manager**: Yarn v4 (Berry)

---

## Repository Structure

```
watchlist-fe/
├── src/
│   ├── api/              # API layer and data fetching hooks
│   │   ├── database.ts   # Supabase client initialization
│   │   ├── movies.ts     # Movie-related queries and mutations
│   │   ├── memories.ts   # Memories feature API
│   │   └── user.ts       # User-related API calls
│   ├── components/       # Reusable UI components
│   │   ├── authenticated_route.tsx  # Auth guard component
│   │   ├── stars.tsx     # Rating stars component
│   │   ├── multi_select.tsx  # Multi-select dropdown
│   │   ├── Input.tsx     # Form input component
│   │   └── formMutators.ts  # Final Form utilities
│   ├── hooks/            # Custom React hooks
│   │   ├── useShareWatchlist.ts  # Share functionality
│   │   └── usePushNotifications.ts  # Push notifications
│   ├── interfaces/       # TypeScript types and interfaces
│   │   └── database.types.ts  # Auto-generated Supabase types
│   ├── pages/            # Page components (routes)
│   │   ├── homepage.tsx  # Main watchlist view
│   │   ├── movies.tsx    # Movie table component
│   │   ├── add-movie.tsx # Movie search/add modal
│   │   ├── login.tsx     # Login page
│   │   ├── movie-modal.tsx  # Movie details modal
│   │   └── memories/     # Memories feature pages
│   ├── providers/        # React context providers
│   │   ├── router.tsx    # React Router configuration
│   │   └── user_provider.tsx  # User/auth context
│   ├── App.tsx           # Root app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles (Tailwind imports)
├── supabase/             # Supabase backend code
│   ├── functions/        # Edge Functions (Deno)
│   │   ├── _shared/      # Shared utilities
│   │   ├── add_movie/    # Add movie to watchlist
│   │   ├── search-stream/  # Search TMDB API
│   │   ├── refresh_providers/  # Update streaming providers
│   │   └── ...           # Other functions
│   ├── migrations/       # Database migrations
│   └── config.toml       # Supabase config
├── public/               # Static assets
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite bundler configuration
├── tailwind.config.js    # TailwindCSS configuration
└── .eslintrc.cjs         # ESLint configuration
```

---

## Key Conventions and Patterns

### 1. Import Path Aliases

The project uses TypeScript path aliases defined in `tsconfig.json:22-30` and `vite.config.ts:8-17`:

```typescript
// ✅ Correct - use aliases
import { supabase } from "api/database";
import { AuthenticatedRoute } from "components/authenticated_route";
import { useUserContext } from "providers/user_provider";

// ❌ Incorrect - avoid relative paths
import { supabase } from "../../../api/database";
```

**Available aliases:**
- `api/*` → `src/api/*`
- `components/*` → `src/components/*`
- `pages/*` → `src/pages/*`
- `hooks/*` → `src/hooks/*`
- `providers/*` → `src/providers/*`
- `interfaces/*` → `src/interfaces/*`
- `assets/*` → `src/assets/*`

### 2. Data Fetching with React Query

All server state is managed through React Query hooks defined in the `api/` directory.

**Query Pattern:**
```typescript
// src/api/movies.ts example
export const useGetMovies = (userId?: string) => {
  return useQuery({
    queryKey: ["movies"],
    enabled: userId !== undefined,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movies_users")
        .select("...")
        .match({ user_id: userId });

      if (error) throw new Error(error.message);
      return data;
    },
  });
};
```

**Mutation Pattern:**
```typescript
export const useToggleWatched = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, watched }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      await supabase
        .from("movies_users")
        .update({ watched: !watched })
        .match({ movie_id: id, user_id: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries("movies");
    },
  });
};
```

**Key practices:**
- Export custom hooks (use\*) from `api/` modules
- Use `enabled` parameter for conditional queries
- Always invalidate relevant queries after mutations
- Handle errors by throwing in `queryFn`
- Type the return values explicitly

### 3. Authentication Pattern

Authentication is handled via Supabase Auth with context provider pattern.

**UserProvider Context** (`src/providers/user_provider.tsx`):
- Provides `user`, `isLoggedIn`, `loading` state
- Wraps entire app in `App.tsx:15`

**Protected Routes:**
```typescript
// src/providers/router.tsx example
{
  path: "/watchlist",
  element: (
    <AuthenticatedRoute>
      <Homepage />
    </AuthenticatedRoute>
  ),
}
```

**Accessing Auth State:**
```typescript
import { useUserContext } from "providers/user_provider";

const MyComponent = () => {
  const { user, isLoggedIn, loading } = useUserContext();
  // user: Supabase User object or null
};
```

### 4. Component Structure

**Functional Components with TypeScript:**
```typescript
export const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  // Hooks first
  const { user } = useUserContext();
  const { data, isLoading } = useGetMovies(user?.id);
  const { mutate } = useToggleWatched();

  // Event handlers
  const handleClick = () => {
    mutate({ id: movieId, watched: true });
  };

  // Conditional rendering
  if (isLoading) return <LoadingSpinner />;
  if (!data) return <ErrorMessage />;

  // Main render
  return <div>...</div>;
};
```

**Naming conventions:**
- Components: PascalCase (e.g., `AuthenticatedRoute`)
- Files: snake_case for components (e.g., `authenticated_route.tsx`)
- Hooks: camelCase with "use" prefix (e.g., `useGetMovies`)
- API modules: snake_case (e.g., `movies.ts`)

### 5. Styling with TailwindCSS

The project uses TailwindCSS exclusively for styling. No CSS modules or styled-components.

```typescript
// ✅ Use Tailwind utility classes
<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg">
    Click me
  </button>
</div>

// Use classnames library for conditional classes
import classNames from "classnames";

<div className={classNames(
  "base-class",
  { "active-class": isActive },
  { "disabled-class": isDisabled }
)} />
```

**Common patterns:**
- Gradient backgrounds: `bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900`
- Glass morphism: `bg-white/10 backdrop-blur-md border border-white/20`
- Responsive: Use `sm:`, `md:`, `lg:` prefixes

### 6. Forms with React Final Form

Forms use React Final Form library.

```typescript
import { Form, Field } from "react-final-form";

<Form
  onSubmit={handleSubmit}
  render={({ handleSubmit, submitting }) => (
    <form onSubmit={handleSubmit}>
      <Field name="title">
        {({ input, meta }) => (
          <Input {...input} error={meta.error} />
        )}
      </Field>
      <button type="submit" disabled={submitting}>Submit</button>
    </form>
  )}
/>
```

### 7. Supabase Edge Functions

Backend logic lives in `supabase/functions/` as Deno-based Edge Functions.

**Calling from frontend:**
```typescript
// Invoke edge function
const { data, error } = await supabase.functions.invoke("search-stream", {
  method: "POST",
  body: JSON.stringify({ title: "Inception" }),
});
```

**Common functions:**
- `add_movie` - Fetch movie details from TMDB and add to user's watchlist
- `search-stream` - Search TMDB for movies/TV shows
- `refresh_providers` - Update streaming provider availability
- `send-email-notification` - SendGrid email notifications

### 8. Database Types

Types are auto-generated from Supabase schema using:
```bash
yarn db:types
```

This generates `src/interfaces/database.types.ts` from the Supabase project schema.

**Usage:**
```typescript
import { Database } from "interfaces/database.types";

// Supabase client is typed
export const supabase = createClient<Database>(url, key);

// Extract table types
type Movie = Database["public"]["Tables"]["movies"]["Row"];
```

### 9. Environment Variables

Environment variables use Vite's `import.meta.env` API.

**Configuration:**
```bash
# .env (create from .env.example)
VITE_SUPABASE_PROJECT_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Usage:**
```typescript
const url = import.meta.env.VITE_SUPABASE_PROJECT_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

All environment variables must be prefixed with `VITE_` to be exposed to the client.

---

## Development Workflow

### Initial Setup

1. **Install dependencies:**
   ```bash
   yarn install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Start development server:**
   ```bash
   yarn dev
   ```

### Available Scripts

```bash
yarn dev              # Start Vite dev server (http://localhost:5173)
yarn build            # TypeScript check + production build
yarn lint             # Run ESLint
yarn preview          # Preview production build
yarn local:supabase   # Start local Supabase instance
yarn local:functions  # Serve Supabase functions locally
yarn db:types         # Generate TypeScript types from Supabase schema
```

### Local Development with Supabase

**Start local Supabase (optional):**
```bash
yarn local:supabase
```

This starts a local Supabase instance excluding realtime, storage-api, imgproxy, kong, and inbucket services.

**Serve functions locally:**
```bash
yarn local:functions
```

### Making Changes

#### Adding a New Page

1. Create page component in `src/pages/`:
   ```typescript
   // src/pages/my-new-page.tsx
   export const MyNewPage: React.FC = () => {
     return <div>My New Page</div>;
   };
   ```

2. Add route in `src/providers/router.tsx`:
   ```typescript
   {
     path: "/my-new-page",
     element: (
       <AuthenticatedRoute>
         <MyNewPage />
       </AuthenticatedRoute>
     ),
   }
   ```

#### Adding a New API Hook

1. Add hook to appropriate module in `src/api/`:
   ```typescript
   // src/api/movies.ts
   export const useGetMovieDetails = (movieId: number) => {
     return useQuery({
       queryKey: ["movie", movieId],
       queryFn: async () => {
         const { data, error } = await supabase
           .from("movies")
           .select("*")
           .eq("id", movieId)
           .single();

         if (error) throw new Error(error.message);
         return data;
       },
     });
   };
   ```

2. Use in component:
   ```typescript
   import { useGetMovieDetails } from "api/movies";

   const MovieDetails = ({ movieId }) => {
     const { data, isLoading } = useGetMovieDetails(movieId);
     // ...
   };
   ```

#### Adding a New Supabase Function

1. Create function directory in `supabase/functions/`:
   ```bash
   mkdir supabase/functions/my-function
   ```

2. Add `index.ts`:
   ```typescript
   // supabase/functions/my-function/index.ts
   import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

   serve(async (req) => {
     const { param } = await req.json();

     // Your logic here

     return new Response(
       JSON.stringify({ result: "success" }),
       { headers: { "Content-Type": "application/json" } },
     );
   });
   ```

3. Invoke from frontend:
   ```typescript
   const { data, error } = await supabase.functions.invoke("my-function", {
     method: "POST",
     body: JSON.stringify({ param: "value" }),
   });
   ```

### Database Schema Updates

1. Make changes in Supabase dashboard or write migration SQL
2. Apply migration (if using migrations)
3. Regenerate types:
   ```bash
   yarn db:types
   ```

---

## Code Quality Guidelines

### TypeScript

- **Strict mode enabled** - all strict TypeScript checks are on
- Use explicit types for function parameters and return values
- Prefer interfaces for object shapes, types for unions/primitives
- Avoid `any` - use `unknown` if type is truly unknown

```typescript
// ✅ Good
interface MovieProps {
  id: number;
  title: string;
  rating: number | null;
}

export const MovieCard: React.FC<MovieProps> = ({ id, title, rating }) => {
  // ...
};

// ❌ Avoid
export const MovieCard = (props: any) => {
  // ...
};
```

### ESLint

The project uses ESLint with:
- `eslint:recommended`
- `@typescript-eslint/recommended`
- `react-hooks/recommended`

**Rules to follow:**
- No unused variables or parameters (enforced by `noUnusedLocals`, `noUnusedParameters`)
- React hooks rules (proper dependency arrays)
- React Refresh rules (component exports)

### File Naming

- **Components**: `snake_case.tsx` (e.g., `authenticated_route.tsx`)
- **Non-component code**: `snake_case.ts` (e.g., `database.ts`)
- **Component names**: PascalCase (e.g., `AuthenticatedRoute`)

### Error Handling

**In React Query:**
```typescript
// Throw errors in queryFn - React Query handles them
queryFn: async () => {
  const { data, error } = await supabase.from("table").select();
  if (error) throw new Error(error.message);
  return data;
}
```

**In components:**
```typescript
// Use isError and error from React Query
const { data, isLoading, isError, error } = useGetMovies(userId);

if (isError) {
  return <ErrorMessage message={error.message} />;
}
```

### Performance Considerations

1. **Conditional queries**: Use `enabled` parameter to prevent unnecessary requests
   ```typescript
   useQuery({
     queryKey: ["movies"],
     enabled: userId !== undefined,
     queryFn: fetchMovies,
   })
   ```

2. **Memoization**: Use `useMemo` for expensive computations
   ```typescript
   const allProviderOptions = useMemo(() => {
     // Expensive computation
     return processData(data);
   }, [data]);
   ```

3. **Query invalidation**: Only invalidate what changed
   ```typescript
   onSuccess: () => {
     queryClient.invalidateQueries("movies"); // Not all queries
   }
   ```

---

## Common Tasks for AI Assistants

### 1. Adding a Feature

**Steps:**
1. Identify if database changes are needed
2. Create/update Supabase function if backend logic required
3. Add/update API hooks in `src/api/`
4. Create/update components in `src/components/`
5. Create/update pages in `src/pages/`
6. Add routes in `src/providers/router.tsx` if new page
7. Test locally with `yarn dev`
8. Run linter with `yarn lint`

### 2. Fixing a Bug

**Steps:**
1. Reproduce the issue
2. Check browser console for errors
3. Check network tab for failed API calls
4. Review relevant React Query hooks for error handling
5. Check Supabase function logs if backend issue
6. Fix and verify
7. Run linter

### 3. Updating Styles

**Guidelines:**
- Use existing Tailwind patterns from the codebase
- Maintain consistent spacing (use scale: p-4, p-8, gap-4, etc.)
- Keep gradient backgrounds consistent with theme
- Test responsive breakpoints (mobile, tablet, desktop)
- Use the existing color palette (slate-900, purple-900, purple-600, etc.)

### 4. Refactoring Code

**Best practices:**
- Extract repeated logic into custom hooks
- Move reusable UI into `components/`
- Keep components focused (single responsibility)
- Maintain existing naming conventions
- Don't break existing API contracts
- Update imports if moving files

---

## Troubleshooting

### Common Issues

**1. Import errors:**
- Verify path aliases are correct
- Check `tsconfig.json` and `vite.config.ts` are in sync
- Restart dev server after config changes

**2. Supabase connection errors:**
- Check `.env` file exists and has correct values
- Verify environment variables are prefixed with `VITE_`
- Check Supabase project is running

**3. Type errors after schema changes:**
- Run `yarn db:types` to regenerate types
- Restart TypeScript server in IDE

**4. React Query not updating:**
- Check `queryKey` is unique and consistent
- Verify `invalidateQueries` is called with correct key
- Check `enabled` parameter isn't blocking the query

**5. Build errors:**
- Run `yarn lint` to check for linting issues
- Check TypeScript errors with `yarn build`
- Clear `dist/` folder and rebuild

---

## Testing Strategy

Currently, the project does not have automated tests. When adding tests:

**Recommended approach:**
- Unit tests: Vitest (fast, Vite-native)
- Component tests: React Testing Library
- E2E tests: Playwright or Cypress

**Priority areas for testing:**
- Custom hooks in `src/api/`
- Form validation logic
- Authentication flows
- Critical user paths (add movie, rate, share)

---

## Deployment

The project is a static frontend that can be deployed to:
- Vercel (recommended for Vite projects)
- Netlify
- Cloudflare Pages
- Any static hosting service

**Build command:** `yarn build`
**Output directory:** `dist/`

**Environment variables to set:**
- `VITE_SUPABASE_PROJECT_URL`
- `VITE_SUPABASE_ANON_KEY`

**Supabase Functions:**
Deploy separately using Supabase CLI:
```bash
supabase functions deploy <function-name>
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/main.tsx` | Application entry point |
| `src/App.tsx` | Root component with providers |
| `src/providers/router.tsx` | Route configuration |
| `src/providers/user_provider.tsx` | Auth context provider |
| `src/api/database.ts` | Supabase client instance |
| `src/api/movies.ts` | Movie-related data hooks |
| `src/interfaces/database.types.ts` | Generated Supabase types |
| `vite.config.ts` | Vite bundler config |
| `tsconfig.json` | TypeScript config |
| `tailwind.config.js` | TailwindCSS config |
| `package.json` | Dependencies and scripts |
| `.env.example` | Environment variable template |

---

## Additional Notes

- **Mobile responsiveness**: The app has mobile-specific UI improvements (see commit `718845b`)
- **Authentication**: Google OAuth is the primary login method
- **Sharing**: Users can share watchlists via `/watchlist/share/:userId` URL
- **Providers**: Users can filter movies by streaming service providers
- **Memories**: Secondary feature for adding notes/memories about movies

---

## Getting Help

**Documentation:**
- [React Query Docs](https://tanstack.com/query/v3/docs/react/overview)
- [Supabase Docs](https://supabase.com/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Vite Docs](https://vitejs.dev/)
- [React Router Docs](https://reactrouter.com/)

**Project-specific:**
- Check existing patterns in similar files
- Review recent commits for context
- Examine API hooks in `src/api/` for backend interaction patterns

---

*Last updated: January 2026*
