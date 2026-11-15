// Runs the page language script against a minimal DOM: node --test tests/language.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

function load(storage) {
  const buttons = {};
  for (const id of ['lt', 'en']) {
    const classes = new Set(id === 'lt' ? ['on'] : []);
    const attrs = {};
    buttons[id] = {
      classList: { toggle: (name, on) => (on ? classes.add(name) : classes.delete(name)) },
      setAttribute: (name, value) => { attrs[name] = String(value); },
      on: () => classes.has('on'),
      pressed: () => attrs['aria-pressed'],
    };
  }
  const document = { documentElement: { lang: 'lt' }, getElementById: (id) => buttons[id] };
  vm.runInNewContext(script, { document, localStorage: storage });
  return { lang: () => document.documentElement.lang, buttons };
}

function memory(saved) {
  const items = new Map(saved === undefined ? [] : [['lang', saved]]);
  return { items, getItem: (k) => items.get(k) ?? null, setItem: (k, v) => items.set(k, String(v)) };
}

function assertShown(page, lang) {
  assert.equal(page.lang(), lang);
  for (const [id, button] of Object.entries(page.buttons)) {
    assert.equal(button.on(), id === lang, `${id} highlight`);
    assert.equal(button.pressed(), String(id === lang), `${id} aria-pressed`);
  }
}

test('defaults to Lithuanian', () => {
  assertShown(load(memory()), 'lt');
});

test('restores a saved supported language', () => {
  assertShown(load(memory('en')), 'en');
  assertShown(load(memory('lt')), 'lt');
});

test('falls back to Lithuanian for the Telšiai site Samogitian choice', () => {
  const storage = memory('sgs');
  assertShown(load(storage), 'lt');
  assert.equal(storage.items.get('lang'), 'sgs', 'shared preference kept for the Telšiai site');
});

test('falls back to Lithuanian for any unsupported saved value', () => {
  assertShown(load(memory('de')), 'lt');
});

test('switching persists across reloads', () => {
  const storage = memory();
  const page = load(storage);
  page.buttons.en.onclick();
  assertShown(page, 'en');
  assert.equal(storage.items.get('lang'), 'en');
  assertShown(load(storage), 'en');
  page.buttons.lt.onclick();
  assertShown(page, 'lt');
  assertShown(load(storage), 'lt');
});

test('works when storage is unavailable', () => {
  const blocked = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } };
  const page = load(blocked);
  assertShown(page, 'lt');
  page.buttons.en.onclick();
  assertShown(page, 'en');
});
