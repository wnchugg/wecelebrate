#!/usr/bin/env node
/**
 * update-claude-md.mjs
 *
 * Claude Code PostToolUse hook. Runs after every Write or Edit tool call.
 * Detects when a new feature file was created or a key routing/API file
 * was changed, then injects a reminder into Claude's context to review
 * and update CLAUDE.md if the change represents meaningful new functionality.
 *
 * Triggers on:
 *   Write  → new admin page, new user page, new backend module, new hook/service
 *   Edit   → routes.tsx (new routes), server/index.tsx (new API endpoints)
 *
 * Never triggers on:
 *   - CLAUDE.md itself (would cause an infinite loop)
 *   - Test files (__tests__/, .test., .spec., /tests/)
 *   - Non-source files (config, lock files, etc.)
 */

import { readFileSync } from 'fs';

// ── Read hook input from stdin ────────────────────────────────────────────────
let input;
try {
  input = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  // Malformed or missing input — exit silently
  process.exit(0);
}

const { tool_name: toolName, tool_input: toolInput, cwd = '' } = input;
const filePath = toolInput?.file_path || '';

if (!filePath) process.exit(0);

// ── Guard: never trigger on CLAUDE.md itself ──────────────────────────────────
if (filePath.endsWith('CLAUDE.md')) process.exit(0);

// ── Guard: never trigger on test files ───────────────────────────────────────
if (
  filePath.includes('__tests__') ||
  filePath.includes('.test.') ||
  filePath.includes('.spec.') ||
  filePath.includes('/tests/')
) process.exit(0);

// ── Guard: only care about source + supabase directories ─────────────────────
if (!filePath.includes('/src/') && !filePath.includes('/supabase/')) process.exit(0);

// Compute path relative to project root for cleaner pattern matching
const rel = filePath.startsWith(cwd + '/') ? filePath.slice(cwd.length + 1) : filePath;

// ── Pattern matching ──────────────────────────────────────────────────────────
let message = null;

if (toolName === 'Write') {
  // Write = brand-new file just created

  const adminPage = rel.match(/^src\/app\/pages\/admin\/([A-Z][^/]+)\.tsx$/);
  const userPage  = rel.match(/^src\/app\/pages\/([A-Z][^/]+)\.tsx$/);
  const backend   = rel.match(/^supabase\/functions\/server\/([^/]+)\.(ts|tsx)$/);
  const hook      = rel.match(/^src\/app\/hooks\/(use[A-Z][^/]+)\.ts$/);
  const service   = rel.match(/^src\/app\/services\/([^/]+)\.(ts|tsx)$/);

  if (adminPage) {
    message =
      `New admin page \`${adminPage[1]}\` was just created (${rel}). ` +
      `If this is a new admin feature — not a refactor of something existing — ` +
      `update CLAUDE.md: add it to the admin capabilities list in "What This Application Does" ` +
      `and/or the "Common Tasks" section.`;

  } else if (userPage) {
    message =
      `New user-facing page \`${userPage[1]}\` was just created (${rel}). ` +
      `If this adds a new step to the employee gift flow or a new user capability, ` +
      `update the flow description in CLAUDE.md's "What This Application Does" section.`;

  } else if (backend) {
    message =
      `New backend module \`${backend[1]}\` was just created (${rel}). ` +
      `If this adds a new API capability or resolves a known gap, update the ` +
      `"Known Gaps" or architecture section in CLAUDE.md.`;

  } else if (hook) {
    message =
      `New hook \`${hook[1]}\` was just created (${rel}). ` +
      `If this exposes significant new data-fetching or feature behaviour, ` +
      `consider mentioning it in CLAUDE.md under the relevant section.`;

  } else if (service) {
    message =
      `New service \`${service[1]}\` was just created (${rel}). ` +
      `If this is a major new capability (e.g., a new integration or business logic module), ` +
      `update CLAUDE.md's "What This Application Does" or architecture notes.`;
  }

} else if (toolName === 'Edit') {
  // Edit = existing file modified

  if (rel === 'src/app/routes.tsx') {
    message =
      `\`routes.tsx\` was just edited. If new routes were added (not just reordered or renamed), ` +
      `update CLAUDE.md to document the new pages or user flows, especially if they affect ` +
      `the core employee gift flow or add new admin sections.`;

  } else if (rel === 'supabase/functions/server/index.tsx') {
    message =
      `The main backend API file (\`index.tsx\`) was just edited. ` +
      `If new public endpoints were added (e.g., \`POST /public/orders\`) or a ` +
      `"Known Gaps" item was resolved, update that section in CLAUDE.md accordingly.`;
  }
}

// No relevant change detected — exit silently
if (!message) process.exit(0);

// ── Output context back to Claude ─────────────────────────────────────────────
// additionalContext is injected into Claude's conversation by the hooks system.
process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext:
        `[CLAUDE.md check] ${message} ` +
        `Use your judgement: only update CLAUDE.md if this is genuinely new ` +
        `functionality — skip for minor edits, bug fixes, and refactors.`,
    },
  }) + '\n'
);
