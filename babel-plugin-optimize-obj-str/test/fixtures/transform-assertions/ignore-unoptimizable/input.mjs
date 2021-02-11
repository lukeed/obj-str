import objstr from 'obj-str';

function optimized() {
	objstr({ 'should-optimize-object-literal': true });
}

function ignored() {
	objstr(cannotOptimizeReference);
	objstr('cannot-optimize-invalid-string-use');
	objstr({ 'cannot-optimize-spread': true, ...spread });
	objstr({ 'cannot-optimize': true }, { 'invalid-use-multiple-args': true });
}
