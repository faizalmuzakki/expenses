// Run: node src/terbilang.check.mjs
import assert from 'node:assert/strict';
import { terbilang } from './terbilang.js';

assert.equal(terbilang(0), 'nol');
assert.equal(terbilang(11), 'sebelas');
assert.equal(terbilang(15), 'lima belas');
assert.equal(terbilang(100), 'seratus');
assert.equal(terbilang(1000), 'seribu');
assert.equal(terbilang(1500), 'seribu lima ratus');
assert.equal(terbilang(48000), 'empat puluh delapan ribu');
assert.equal(terbilang(1247300), 'satu juta dua ratus empat puluh tujuh ribu tiga ratus');
assert.equal(terbilang(111000), 'seratus sebelas ribu');
assert.equal(terbilang(18250000), 'delapan belas juta dua ratus lima puluh ribu');
assert.equal(terbilang(2000000000), 'dua miliar');
assert.equal(terbilang(-23500), 'dua puluh tiga ribu lima ratus');
console.log('terbilang ok');
