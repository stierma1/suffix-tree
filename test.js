var SuffixTree = require("./lib/suffix-tree");
var assert = require("assert");

var docs = {"A":"A", "AA": 1, "AAB": "AAB", "BA":"BA", "B":"B" };

var suff = new SuffixTree();

for(var i in docs){
  suff.add(i, docs[i]);
}

assert(suff.getPattern("A*").length === 3)
assert(suff.getPattern("*A").length === 3)
assert(suff.getPattern("AA*").length === 2)
assert(suff.getPattern("*A*").length === 4)
suff.remove("A")
assert(suff.getPattern("*A*").length === 3)
assert(suff.getPattern("AA")[0].document === 1)
