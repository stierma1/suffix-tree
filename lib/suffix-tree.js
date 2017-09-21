var SuffixNode = require("./suffix-node");
var DocumentNode = require("./document-node");
var WILDCARD_TOKEN = {};

class SuffixTree{
  constructor(){
    this.root = new SuffixNode();
  }

  size(){
    return this.root.size();
  }

  remove(word){
    this.root.remove(word, word);
    this.root.removedDeleted();
  }

  add(word, document){
    var documentNode = new DocumentNode(word, document);
    var currentWord = word;
    while(currentWord.length > 0){
      this.root.addChild(currentWord, documentNode)
      var [c, ...rest] = currentWord;
      currentWord = rest;
    }
    this.root.addChild(currentWord, documentNode)
    return this;
  }

  get(word, dontFilter){
    var docs = this.root.get(word);

    if(dontFilter){
      return docs;
    }

    return docs.filter((docNode) => {
      return docNode.insertionWord === word;
    });
  }

  getPrefix(word, dontFilter){
    var docs = this.root.getAll(word);

    if(dontFilter){
      return docs;
    }

    return docs.filter((doc) => {
      for(var i = 0; i < word.length; i++){
        if(doc.insertionWord[i] !== word[i]){
          return false;
        }
      }
      return true;
    });
  }

  getSuffix(word, dontFilter){
    var docs = this.root.getAll(word);
    if(dontFilter){
      return docs;
    }
    return docs.filter((doc) => {
      for(var i = 0; i < word.length; i++){
        if(doc.insertionWord[doc.insertionWord.length - (word.length - i)] !== word[i]){
          return false;
        }
      }
      return true;
    });
  }

  getPattern(pattern){
    var splits = null;
    if(!(pattern instanceof Array)){
      splits = SuffixTree.parsePattern(pattern);
    } else {
      splits = patthern;
    }

    if(splits.length <= 1){
      return this.get(splits[0]);
    }
    splits = splits.filter((p) => {
      return p !== WILDCARD_TOKEN
    })
    if(splits.length === 2 && splits[0] === "" && splits[1] === ""){
      return SuffixNode.dedupe(this.root.getAll([]));
    }

    var first = splits[0];
    var last = splits[splits.length - 1];
    var prefixSet = null;
    var suffixSet = null;
    var intermediateSets = [];
    if(first !== ""){
      prefixSet = this.getPrefix(first);
    }

    if(last !== ""){
      suffixSet = this.getSuffix(last);
    }

    for(var i = 1; i < splits.length - 1; i++){
      intermediateSets.push(this.getSuffix(splits[i], true));
    }

    var seedSet = null;
    if(prefixSet){
      seedSet = prefixSet;
    } else if(suffixSet){
      seedSet = suffixSet;
    } else {
      seedSet = intermediateSets[0];
    }

    if(suffixSet){
      seedSet = suffixSet.filter((doc) => {
        for(var i in seedSet){
          if(seedSet[i] === doc){
            return true;
          }
        }
        return false;
      });
    }

    for(var i in intermediateSets){
      seedSet = intermediateSets[i].filter((doc) => {
        for(var j in seedSet){
          if(seedSet[j] === doc){
            return true;
          }
        }
        return false;
      });
    }

    return SuffixNode.dedupe(seedSet);
  }

  static parsePattern(pattern){
    if(pattern.indexOf("*") < 0){
      return [pattern];
    }
    var splits = pattern.split("*");
    var patternArr = [splits[0]];
    for(var i = 1; i < splits.length; i++){
      patternArr.push(WILDCARD_TOKEN);
      patternArr.push(splits[i]);
    }
    return patternArr;
  }

  static getWildcardToken(){
    return WILDCARD_TOKEN;
  }
}

module.exports = SuffixTree;
