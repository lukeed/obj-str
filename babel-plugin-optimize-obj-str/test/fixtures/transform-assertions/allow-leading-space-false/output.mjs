var _temp;

import objstr from 'obj-str';
"" + (a ? "" + "a" : "");
"" + (true ? "" + "a" : "") + (b ? " " + "b" : "") + (c ? " " + "c" : "");
"" + (a ? (_temp = true, "") + "a" : "") + (b ? (_temp ? " " : (_temp = true, "")) + "b" : "") + (c ? (_temp ? " " : (_temp = true, "")) + "c" : "");
