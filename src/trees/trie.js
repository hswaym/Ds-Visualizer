export class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
  }
}

export class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word, logs) {
    let node = this.root;
    for (const char of word) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
        logs.push({ msg: `Created new node for character '${char}'`, type: 'insert' });
      }
      node = node.children[char];
    }
    node.isEndOfWord = true;
    logs.push({ msg: `Marked end of word for "${word}"`, type: 'insert' });
  }

  search(word) {
    let node = this.root;
    for (const char of word) {
      if (!node.children[char]) return false;
      node = node.children[char];
    }
    return node.isEndOfWord;
  }
}
