import { access, readFile } from 'node:fs/promises';
import test from 'node:test';
import assert from 'node:assert/strict';

const ROOT = new URL('../', import.meta.url);

async function readText(path) {
  return readFile(new URL(path, ROOT), 'utf8');
}

async function readPngDimensions(path) {
  const buffer = await readFile(new URL(path, ROOT));
  assert.equal(buffer.toString('ascii', 1, 4), 'PNG');
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

test('homepage presents Makers club identity and public content sections', async () => {
  const html = await readText('index.html');

  assert.match(html, /<html lang="ko">/);
  assert.match(html, /<title>메이커스\(Makers\) 동아리/);
  assert.match(html, /무엇이든 만들어보는 문화/);
  assert.match(html, /갤러리/);
  assert.doesNotMatch(html, /이미 굴러가는 결과물/);
  assert.doesNotMatch(html, /요즘 만드는 것들/);
  assert.match(html, /id="activities"/);
  assert.match(html, /id="projects"/);
  assert.match(html, /id="join"/);
  assert.match(html, /id="schedule"/);
});

test('homepage includes Google Analytics tracking tag', async () => {
  const html = await readText('index.html');

  assert.match(html, /https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-TS41WNGN58/);
  assert.match(html, /window\.dataLayer = window\.dataLayer \|\| \[\];/);
  assert.match(html, /function gtag\(\)\{dataLayer\.push\(arguments\);\}/);
  assert.match(html, /gtag\('js', new Date\(\)\);/);
  assert.match(html, /gtag\('config', 'G-TS41WNGN58'\);/);
  assert.ok(html.indexOf('googletagmanager.com/gtag/js') < html.indexOf('<link rel="stylesheet"'));
});

test('homepage presents gallery before activity details', async () => {
  const html = await readText('index.html');
  const nav = html.match(/<nav class="site-nav"[\s\S]*?<\/nav>/)?.[0] ?? '';

  assert.ok(html.indexOf('id="projects"') < html.indexOf('id="activities"'));
  assert.ok(nav.indexOf('href="#projects"') < nav.indexOf('href="#activities"'));
  assert.doesNotMatch(nav, />프로젝트</);
});

test('homepage gallery features Escape from Hwaseong', async () => {
  const html = await readText('index.html');

  assert.match(html, /Escape from Hwaseong/);
  assert.match(html, /https:\/\/escape-from-hwaseong\.web\.app\//);
  assert.match(html, /gallery\/escape-from-hwaseong\.png/);
  await access(new URL('gallery/escape-from-hwaseong.png', ROOT));
});

test('homepage gallery features the cognitive experiment homepage', async () => {
  const html = await readText('index.html');

  assert.match(html, /인지실험 홈페이지/);
  assert.match(html, /https:\/\/jeoungan\.github\.io\/homepage002\//);
  assert.match(html, /gallery\/cognitive-experiment-homepage\.png/);
  await access(new URL('gallery/cognitive-experiment-homepage.png', ROOT));
});

test('homepage gallery features the Midnight Chrome Drift video', async () => {
  const html = await readText('index.html');

  assert.match(html, /Midnight Chrome Drift/);
  assert.match(html, /https:\/\/www\.youtube\.com\/watch\?v=5CBFiwGoz0w/);
  assert.match(html, /gallery\/midnight-chrome-drift\.jpg/);
  await access(new URL('gallery/midnight-chrome-drift.jpg', ROOT));
});

test('homepage gallery features Campus Survival', async () => {
  const html = await readText('index.html');

  assert.match(html, /Campus Survival/);
  assert.match(html, /밝고 귀여운 캠퍼스 그래픽/);
  assert.match(html, /https:\/\/jeoungan\.github\.io\/game0505_2\/game0505_%EC%9E%90%EB%A3%8C\/index\.html/);
  assert.match(html, /gallery\/campus-survival\.png/);
  assert.doesNotMatch(html, /어두운 캠퍼스 분위기/);
  await access(new URL('gallery/campus-survival.png', ROOT));
  assert.deepEqual(await readPngDimensions('gallery/campus-survival.png'), { width: 779, height: 663 });
});

test('homepage header links to the signup form', async () => {
  const html = await readText('index.html');

  assert.match(
    html,
    /<a class="nav-cta" href="https:\/\/forms\.gle\/CxZwUbVsPVLYmVpg7">가입 신청!<\/a>/
  );
});

test('homepage reuses local Makers assets and links the existing schedule app', async () => {
  const html = await readText('index.html');

  assert.match(html, /makers_logo\.png/);
  assert.match(html, /grok-video-a53d6321-deeb-4151-bd2c-b1e758e7f655\.mp4/);
  assert.match(html, /https:\/\/makers-schedule\.web\.app\/\?v=20260427-admin-select-delete-1/);
  assert.doesNotMatch(html, /href="\.\/makers_schedule\/index\.html"/);
});

test('homepage displays local resource images as a visual board', async () => {
  const html = await readText('index.html');
  const resourceImages = [
    'resources/studio-board-coding.jpg',
    'resources/studio-board-prototype.jpg',
    'resources/studio-board-lab.jpg',
    'resources/studio-board-panorama.jpg',
    'resources/studio-board-desk.jpg',
    'resources/studio-board-parts.jpg',
  ];

  const mediaBlocks = html.match(/<figure class="resource-photo/g) ?? [];
  assert.equal(mediaBlocks.length, 6);
  assert.match(html, /class="resource-board"/);
  assert.doesNotMatch(html, /studio-board-agent\.jpg/);
  assert.doesNotMatch(html, /AI 에이전트 대화 캡처/);

  for (const imagePath of resourceImages) {
    assert.match(html, new RegExp(imagePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    await access(new URL(imagePath, ROOT));
  }
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
