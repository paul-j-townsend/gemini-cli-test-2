Now I understand the issue. The SeriesManagement component is actually implementing proper authentication, but
   the other admin components don't use authentication headers. Looking at the CLAUDE.md file, I can see this
  project uses UserSwitcher for development, which suggests it might be using a mock authentication system. Let
  me check how the other components work and align SeriesManagement with the existing pattern.
