import objstr from 'obj-str';
"" + (keyIsValueId ? "" + "keyIsValueId" : "");
"" + (false ? "" + 'quoted' : "");
"" + (true ? "" + "unquoted" : "");
"" + (probably ? "" + identifierExpression : "");
"" + (maybe ? "" + (compound + expression) : "");
"" + (maybeMemberExpression ? "" + member.expression : "");
"" + (true ? "" + 'constant-true-first' : "") + (foo ? " " + 'anything else' : "");

function separatorHelpers() {
  var _temp, _temp2;

  "" + (keyIsValueId ? (_temp = true, "") + "keyIsValueId" : "") + (false ? (_temp ? " " : (_temp = true, "")) + 'quoted' : "") + (true ? (_temp ? " " : (_temp = true, "")) + "unquoted" : "") + (probably ? (_temp ? " " : (_temp = true, "")) + identifierExpression : "") + (maybe ? (_temp ? " " : (_temp = true, "")) + (compound + expression) : "") + (maybeMemberExpression ? (_temp ? " " : (_temp = true, "")) + member.expression : "");
  "" + (a ? (_temp2 = true, "") + 'not-nested' : "") + (c ? (_temp2 ? " " : (_temp2 = true, "")) + ("" + (b ? "" + "nested" : "")) : "");

  function perScope() {
    var _temp3;

    "" + (a ? (_temp3 = true, "") + "a" : "") + (b ? (_temp3 ? " " : (_temp3 = true, "")) + "b" : "") + (c ? (_temp3 ? " " : (_temp3 = true, "")) + "c" : "");
  }
}
