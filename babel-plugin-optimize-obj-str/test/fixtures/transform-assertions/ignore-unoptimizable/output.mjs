import objstr from 'obj-str';

function optimized() {
  '' + (true ? 'should-optimize-object-literal' : '');
}

function ignored() {
  objstr(cannotOptimizeReference);
  objstr('cannot-optimize-invalid-string-use');
  objstr({
    'cannot-optimize-spread': true,
    ...spread
  });
  objstr({
    'cannot-optimize': true
  }, {
    'invalid-use-multiple-args': true
  });
}
