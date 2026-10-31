// Compatibility polyfill for Node < 22.19 environments where zlib.createZstdDecompress is not present.
// Prevents undici 8.x from crashing at module load time.
const zlib = require('node:zlib');

if (!zlib.createZstdDecompress) {
  zlib.createZstdDecompress = function () {
    const { PassThrough } = require('node:stream');
    return new PassThrough();
  };
}

if (!zlib.constants) {
  zlib.constants = {};
}

if (!zlib.constants.ZSTD_d_windowLogMax) {
  zlib.constants.ZSTD_d_windowLogMax = 23;
}

