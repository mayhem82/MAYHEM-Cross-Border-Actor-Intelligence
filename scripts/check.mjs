import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const docs = new URL('../docs/', import.meta.url);
const context = { window: {} };
for (const name of ['civic', 'cases', 'global', 'batch_a', 'batch_b', 'preservation', 'translations']) {
  const file = new URL('data/' + name + '.js', docs);
  runInNewContext(readFileSync(file, 'utf8'), context, { filename: file.pathname });
}
const { civic, cases, globalRecords, batchA, batchB, preservation, translations } = context.window;
const strands = [civic, cases, globalRecords, batchA, batchB];
const sources = new Map(strands.flatMap(strand => strand.sources).map(s => [s.id, s]));
const seen = new Set();
const sum = bytes => createHash('sha256').update(bytes).digest('hex');

for (const strand of strands) {
  for (const [section, entries] of Object.entries(strand)) {
    for (const entry of entries) {
      assert(entry.id && entry.title, 'Every record requires an ID and title');
      assert(!seen.has(entry.id), 'Repeated ID ' + entry.id);
      seen.add(entry.id);
      if (section === 'sources') {
        assert.equal(new URL(entry.url).protocol, 'https:');
        assert(entry.quote && entry.locator && entry.context, entry.id + ' lacks source context');
        if (entry.footage) {
          for (const field of ['creator', 'recorded', 'location', 'timecode', 'verification', 'context']) {
            assert(typeof entry.footage[field] === 'string' && entry.footage[field].trim(), entry.id + ' lacks footage ' + field);
          }
        }
        const saved = preservation[entry.id];
        assert(saved, 'Missing capture for ' + entry.id);
        const excerpt = readFileSync(new URL(saved.path, docs));
        assert.match(saved.recorded, /^\d{4}-\d{2}-\d{2}$/, entry.id + ' lacks a recording date');
        assert(excerpt.toString('utf8').split(/\r?\n/).includes('Registered: ' + saved.recorded), entry.id + ' recording date differs from the preserved excerpt');
        assert.equal(sum(excerpt), saved.sha256, entry.id + ' excerpt checksum mismatch');
        assert(excerpt.toString('utf8').includes(entry.quote), entry.id + ' quote differs from capture');
        if (saved.documentPath) {
          assert.equal(sum(readFileSync(new URL(saved.documentPath, docs))), saved.originalSha256);
        }
      } else {
        assert(entry.sources.length, entry.id + ' has no cited evidence');
        for (const id of entry.sources) assert(sources.has(id), entry.id + ' cites missing ' + id);
        if (section === 'connections') assert(entry.from && entry.to && entry.layer, entry.id + ' has no map endpoints or layer');
        if (section === 'judicial') assert(entry.caseId && entry.stage, entry.id + ' lacks case or disposition');
      }
    }
  }
}
assert.equal(Object.keys(preservation).length, sources.size, 'Archive manifest and source register differ');
const allRows = new Map(strands.flatMap(strand => Object.values(strand).flat()).map(row => [row.id, row]));
for (const [id, fields] of Object.entries(translations)) {
  const row = allRows.get(id);
  assert(row, 'Translation references a missing record ' + id);
  for (const [field, translated] of Object.entries(fields)) {
    assert(['title', 'publisher', 'quote', 'locator'].includes(field), id + ' has an unsupported translated field');
    assert(typeof row[field] === 'string' && row[field].trim(), id + ' lacks the original ' + field);
    assert(typeof translated === 'string' && translated.trim(), id + ' has an empty ' + field + ' translation');
  }
}
console.log('Verified ' + seen.size + ' unique records and ' + sources.size + ' evidence captures.');
