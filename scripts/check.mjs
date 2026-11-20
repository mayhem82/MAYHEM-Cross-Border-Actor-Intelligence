import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const docs = new URL('../docs/', import.meta.url);
const context = { window: {} };
for (const name of ['civic', 'cases', 'global', 'preservation']) {
  const file = new URL('data/' + name + '.js', docs);
  runInNewContext(readFileSync(file, 'utf8'), context, { filename: file.pathname });
}
const { civic, cases, globalRecords, preservation } = context.window;
const strands = [civic, cases, globalRecords];
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
        const saved = preservation[entry.id];
        assert(saved, 'Missing capture for ' + entry.id);
        const excerpt = readFileSync(new URL(saved.path, docs));
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
console.log('Verified ' + seen.size + ' unique records and ' + sources.size + ' evidence captures.');
