
class DocumentNode{
  constructor(word, doc){
    this.insertionWord = word;
    this.document = doc;
    this.deleteMark = false;
  }

  equals(docNode){
    return this.insertionWord === docNode.insertionWord && this.document === docNode.document;
  }
}


module.exports = DocumentNode;
