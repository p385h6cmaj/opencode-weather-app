const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { cyan, yellow, green, red, bold, reset } = require('../src/lib/colors');

describe('colors', () => {
  describe('cyan', () => {
    it('returns colored text in TTY mode', () => {
      const originalIsTTY = process.stdout.isTTY;
      Object.defineProperty(process.stdout, 'isTTY', { value: true, configurable: true });

      const result = cyan('hola');
      assert.ok(result.includes('\x1b[36m'), 'debería incluir el código cyan');
      assert.ok(result.includes('\x1b[0m'), 'debería incluir el reset');
      assert.ok(result.includes('hola'), 'debería incluir el texto');

      Object.defineProperty(process.stdout, 'isTTY', { value: originalIsTTY, configurable: true });
    });

    it('returns plain text when NO_COLOR is set', () => {
      const originalNoColor = process.env.NO_COLOR;
      process.env.NO_COLOR = '1';

      try {
        const result = cyan('hola');
        assert.strictEqual(result, 'hola', 'NO_COLOR debería desactivar colores');
      } finally {
        if (originalNoColor === undefined) {
          delete process.env.NO_COLOR;
        } else {
          process.env.NO_COLOR = originalNoColor;
        }
      }
    });

    it('returns plain text when not a TTY', () => {
      const originalIsTTY = process.stdout.isTTY;
      Object.defineProperty(process.stdout, 'isTTY', { value: false, configurable: true });

      try {
        const result = cyan('hola');
        assert.strictEqual(result, 'hola', 'sin TTY no debería colorear');
      } finally {
        Object.defineProperty(process.stdout, 'isTTY', { value: originalIsTTY, configurable: true });
      }
    });
  });

  describe('yellow', () => {
    it('returns colored text in TTY mode', () => {
      const originalIsTTY = process.stdout.isTTY;
      Object.defineProperty(process.stdout, 'isTTY', { value: true, configurable: true });

      try {
        const result = yellow('30°C');
        assert.ok(result.includes('\x1b[33m'), 'debería incluir el código amarillo');
        assert.ok(result.includes('30°C'));
      } finally {
        Object.defineProperty(process.stdout, 'isTTY', { value: originalIsTTY, configurable: true });
      }
    });
  });

  describe('green', () => {
    it('returns colored text in TTY mode', () => {
      const originalIsTTY = process.stdout.isTTY;
      Object.defineProperty(process.stdout, 'isTTY', { value: true, configurable: true });

      try {
        const result = green('éxito');
        assert.ok(result.includes('\x1b[32m'), 'debería incluir el código verde');
        assert.ok(result.includes('éxito'));
      } finally {
        Object.defineProperty(process.stdout, 'isTTY', { value: originalIsTTY, configurable: true });
      }
    });
  });

  describe('red', () => {
    it('returns colored text in TTY mode', () => {
      const originalIsTTY = process.stdout.isTTY;
      Object.defineProperty(process.stdout, 'isTTY', { value: true, configurable: true });

      try {
        const result = red('error');
        assert.ok(result.includes('\x1b[31m'), 'debería incluir el código rojo');
        assert.ok(result.includes('error'));
      } finally {
        Object.defineProperty(process.stdout, 'isTTY', { value: originalIsTTY, configurable: true });
      }
    });
  });

  describe('bold', () => {
    it('returns bold text in TTY mode', () => {
      const originalIsTTY = process.stdout.isTTY;
      Object.defineProperty(process.stdout, 'isTTY', { value: true, configurable: true });

      try {
        const result = bold('texto');
        assert.ok(result.includes('\x1b[1m'), 'debería incluir el código bold');
        assert.ok(result.includes('texto'));
      } finally {
        Object.defineProperty(process.stdout, 'isTTY', { value: originalIsTTY, configurable: true });
      }
    });
  });

  describe('reset', () => {
    it('returns the reset escape sequence', () => {
      assert.strictEqual(reset, '\x1b[0m');
    });
  });
});
