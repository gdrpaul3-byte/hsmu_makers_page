import { readFile } from 'node:fs/promises';
import test from 'node:test';
import assert from 'node:assert/strict';

const ROOT = new URL('../', import.meta.url);

async function readText(path) {
  return readFile(new URL(path, ROOT), 'utf8');
}

test('homepage presents Makers club identity and public content sections', async () => {
  const html = await readText('index.html');

  assert.match(html, /<html lang="ko">/);
  assert.match(html, /<title>메이커스\(Makers\) 동아리/);
  assert.match(html, /무엇이든 만들어보는 문화/);
  assert.match(html, /id="activities"/);
  assert.match(html, /id="projects"/);
  assert.match(html, /id="join"/);
  assert.match(html, /id="schedule"/);
});

test('homepage reuses local Makers assets and links the existing schedule app', async () => {
  const html = await readText('index.html');

  assert.match(html, /makers_logo\.png/);
  assert.match(html, /grok-video-a53d6321-deeb-4151-bd2c-b1e758e7f655\.mp4/);
  assert.match(html, /https:\/\/makers-schedule\.web\.app\/\?v=20260427-admin-select-delete-1/);
  assert.doesNotMatch(html, /href="\.\/makers_schedule\/index\.html"/);
  assert.match(html, /ai_rookie\/Screenshot 2026-04-26 223033\.png/);
});

test('homepage does not expose member private contact details', async () => {
  const html = await readText('index.html');

  assert.doesNotMatch(html, /010-\d{4}-\d{4}/);
  for (const studentId of ['20231901', '20242014', '20242704', '20252704', '20262720']) {
    assert.doesNotMatch(html, new RegExp(studentId));
  }
});

test('homepage style and script files are wired and avoid banned card stripe pattern', async () => {
  const html = await readText('index.html');
  const css = await readText('styles.css');
  const script = await readText('script.js');

  assert.match(html, /href="\.\/styles\.css"/);
  assert.match(html, /src="\.\/script\.js"/);
  assert.doesNotMatch(css, /border-(left|right)\s*:\s*(?:[2-9]|\d{2,})px/i);
  assert.match(script, /data-copy-email/);
});
