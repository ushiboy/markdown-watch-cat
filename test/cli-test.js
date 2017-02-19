const assert = require('assert');
import { parseArgs } from '../src/cli';

describe('cli', () => {

  describe('parseArgs()', () => {

    context('default', () => {

      const path = '/path/to/markdown.md';
      const args = parseArgs([path]);

      it('should return markdown path', () => {
        assert(args.path === path);
      });

      it('should return default port number', () => {
        assert(args.port === 8080);
      });

      it('should return default theme css path', () => {
        assert(args.theme.match(/github-markdown\.css$/) !== null);
      });

      it('should return skip open off', () => {
        assert(args.skip_open === false);
      });

    });

    context('when a port number is specified', () => {

      const path = '/path/to/markdown.md';
      const args = parseArgs([path, '-p', '8888']);

      it('should return specified port number', () => {
        assert(args.port === 8888);
      });

    });

    context('when a theme is specified', () => {

      const path = '/path/to/markdown.md';
      const themePath = '/path/to/theme.css';
      const args = parseArgs([path, '-t', themePath]);

      it('should return specified theme css path', () => {
        assert(args.theme === themePath);
      });

    });

    context('when skipping of open is specified', () => {

      const path = '/path/to/markdown.md';
      const args = parseArgs([path, '-s']);

      it('should return skip open on', () => {
        assert(args.skip_open === true);
      });

    });

  });

});
