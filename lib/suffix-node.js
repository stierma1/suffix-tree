
class SuffixNode{
  constructor(){
    this.documentNodes = [];
    this.children = {};
    this._childDocCache = [];
  }

  addChild(word, documentNode){
    var [char, ...rest] = word;
    this._childDocCache = [];
    if(char){
      if(!this.children[char]){
        this.children[char] = new SuffixNode();
      }
      this.children[char].addChild(rest, documentNode);
    } else {
      if(this.documentNodes.filter((doc) => {
        return doc === documentNode;
      }).length === 0){
        this.documentNodes.push(documentNode);
      }
    }
  }

  remove(word, fullWord){
    this._childDocCache = [];
    var[char, ...rest] = word;
    if(rest.length === 0){
      if(this.children[char] && this.children[char].documentNodes.length > 0){
        for(var i in this.children[char].documentNodes){
          var doc = this.children[char].documentNodes[i];
          if(doc.insertionWord === fullWord){
            doc.deleteMark = true;
          }
        }
      }
    } else if(this.children[char]) {
      this.children[char].remove(rest, fullWord);
    }
  }

  removedDeleted(){

    this.documentNodes = this.documentNodes.filter((doc) => {
      return !doc.deleteMark;
    })
    this._childDocCache = this._childDocCache.filter((doc) => {
      return !doc.deleteMark;
    })

    for(var i in this.children){
      this.children[i].removedDeleted();
    }

    this.compact();
  }

  compact(){
    for(var i in this.children){
      var child = this.children[i];
      var keep = false;
      if(child.documentNodes.length > 0){
        keep = true;
      } else {
        for(var j in child.children){
          keep = true;
          break;
        }
      }
      if(!keep){
        delete this.children[i]
      }
    }
  }

  get(word){
    var [char, ...rest] = word;
    if(char && this.children[char]){
      return this.children[char].get(rest);
    } else if(char){
      return [];
    } else {
      return this.documentNodes;
    }
  }

  getAll(word){
    var [char, ...rest] = word;

    if(char && this.children[char]){ //Need to go further
      return this.children[char].getAll(rest);
    } else if(char){ //DeadEnd
      return [];
    } else { //Reached the end of the word now need to collect all docs

      if(this._childDocCache.length > 0){
        return this._childDocCache;
      }
      var childrenDocs = [].concat(this.documentNodes);
      for(var i in this.children){
        var childDocs = this.children[i].getAll([]);
        for(var j in childDocs){
          childrenDocs.push(childDocs[j]);
        }
      }

      this._childDocCache = SuffixNode.dedupe(childrenDocs);

      return this._childDocCache;
    }
  }

  static dedupe(docs){
    if(docs.length === 0){
      return [];
    }
    var deduped = [docs[0]];

    for(var i in docs){
      var matched = false;
      for(var j in deduped){
        if(docs[i].equals(deduped[j])){
          matched = true;
          break;
        }
      }
      if(!matched){
        deduped.push(docs[i]);
      }
    }
    return deduped;
  }

  size(){
    var sum = 1;
    for(var i in this.children){
      sum += this.children[i].size();
    }

    return sum;
  }
}

module.exports = SuffixNode;
