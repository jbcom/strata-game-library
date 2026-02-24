#!/usr/bin/env node
/**
 * Simple Jules API wrapper for creating sessions
 * Usage: JULES_API_KEY=xxx node scripts/jules-session.mjs <repo> "<prompt>"
 *
 * For local interactive use: npx @google/jules
 */

const API_KEY = process.env.JULES_API_KEY;
const BASE_URL = 'https://jules.googleapis.com/v1alpha';

async function listSources() {
  const res = await fetch(`${BASE_URL}/sources`, {
    headers: { 'X-Goog-Api-Key': API_KEY }
  });
  const data = await res.json();
  return data.sources || [];
}

async function createSession(sourceName, prompt, branch = 'main', title = null) {
  const res = await fetch(`${BASE_URL}/sessions`, {
    method: 'POST',
    headers: {
      'X-Goog-Api-Key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt,
      sourceContext: {
        source: sourceName,
        githubRepoContext: {
          startingBranch: branch
        }
      },
      automationMode: 'AUTO_CREATE_PR',
      title: title || prompt.slice(0, 50)
    })
  });
  return await res.json();
}

async function listSessions() {
  const res = await fetch(`${BASE_URL}/sessions`, {
    headers: { 'X-Goog-Api-Key': API_KEY }
  });
  const data = await res.json();
  return data.sessions || [];
}

async function main() {
  const [,, command, ...args] = process.argv;

  if (!API_KEY) {
    console.error('Error: JULES_API_KEY environment variable required');
    process.exit(1);
  }

  switch (command) {
    case 'sources':
      const sources = await listSources();
      sources.forEach(s => console.log(s.name));
      break;

    case 'sessions':
      const sessions = await listSessions();
      sessions.forEach(s => {
        console.log(`${s.name.split('/')[1]} | ${s.state} | ${s.prompt?.slice(0, 60)}...`);
      });
      break;

    case 'create':
      const [repo, prompt] = args;
      if (!repo || !prompt) {
        console.error('Usage: jules-session.mjs create <owner/repo> "<prompt>"');
        process.exit(1);
      }
      const sourceName = `sources/github/${repo}`;
      const session = await createSession(sourceName, prompt);
      if (session.error) {
        console.error('Error:', session.error.message);
      } else {
        console.log(`Created: ${session.name}`);
        console.log(`URL: https://jules.google.com/session/${session.name.split('/')[1]}`);
      }
      break;

    default:
      console.log(`
Jules Session Manager

Commands:
  sources   - List available GitHub sources
  sessions  - List active sessions
  create    - Create a new session

Usage:
  JULES_API_KEY=xxx node scripts/jules-session.mjs sources
  JULES_API_KEY=xxx node scripts/jules-session.mjs sessions
  JULES_API_KEY=xxx node scripts/jules-session.mjs create jbcom/strata-game-library "Fix issue #85"

For interactive local use:
  npx @google/jules
`);
  }
}

main().catch(console.error);
