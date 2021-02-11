import roberto from 'obj-str';
"" + (true ? "" + 'this-should-be-transformed' : "");
objstr({
  'this-should-be-intact': true
});
