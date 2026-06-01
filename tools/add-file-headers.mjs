/**
 * Добавляет заголовок в начало файлов .js / .jsx по словарю file-headers.json
 * Запуск: node tools/add-file-headers.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const map = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'file-headers.json'), 'utf8')
);

const MARKER = 'ЧТО ЭТО:';

function makeHeader(relativePath, body) {
  const desc = map[relativePath.replace(/\\/g, '/')];
  if (!desc) return null;
  const lines = desc.split('\n').map((l) => l.trim()).filter(Boolean);
  const what = lines[0] || relativePath;
  const dutyLine = lines.find((l) => /^За что отвечает:/i.test(l)) || lines[1] || '';
  const duty = dutyLine.replace(/^За что отвечает:\s*/i, '').trim() || what;
  const name = path.basename(relativePath);
  const block = `/**
 * ФАЙЛ: ${name}
 * ЧТО ЭТО: ${what}
 * ЗА ЧТО ОТВЕЧАЕТ: ${duty}
 */`;
  const isJsx = relativePath.endsWith('.jsx');
  const useBlock = body.trimStart().startsWith('/**');
  if (useBlock) {
    const end = body.indexOf('*/');
    if (end === -1) return block + '\n' + body;
    const rest = body.slice(end + 2).replace(/^\s*\n/, '');
    if (rest.includes(MARKER)) return null;
    return block + '\n' + rest;
  }
  return block + '\n' + body;
}

let updated = 0;
let skipped = 0;
let missing = 0;

for (const [rel, _desc] of Object.entries(map)) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    console.warn('Нет файла:', rel);
    missing++;
    continue;
  }
  const body = fs.readFileSync(full, 'utf8');
  if (body.includes(MARKER) && body.trimStart().startsWith('/**')) {
    skipped++;
    continue;
  }
  const next = makeHeader(rel, body);
  if (!next || next === body) {
    skipped++;
    continue;
  }
  fs.writeFileSync(full, next, 'utf8');
  updated++;
  console.log('OK', rel);
}

console.log(`\nГотово: обновлено ${updated}, пропущено ${skipped}, нет на диске ${missing}`);
