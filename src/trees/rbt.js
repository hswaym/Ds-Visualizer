export class RBTNode {
  constructor(val, color = 'RED') {
    this.val = val;
    this.color = color; // 'RED' or 'BLACK'
    this.left = null;
    this.right = null;
    this.parent = null;
  }
}

export class RedBlackTree {
  constructor() {
    this.NIL = new RBTNode(null, 'BLACK');
    this.root = this.NIL;
  }

  rotateLeft(x) {
    let y = x.right;
    x.right = y.left;
    if (y.left !== this.NIL) y.left.parent = x;
    y.parent = x.parent;
    if (x.parent === null) this.root = y;
    else if (x === x.parent.left) x.parent.left = y;
    else x.parent.right = y;
    y.left = x;
    x.parent = y;
  }

  rotateRight(y) {
    let x = y.left;
    y.left = x.right;
    if (x.right !== this.NIL) x.right.parent = y;
    x.parent = y.parent;
    if (y.parent === null) this.root = x;
    else if (y === y.parent.right) y.parent.right = x;
    else y.parent.left = x;
    x.right = y;
    y.parent = x;
  }

  insert(val, logs) {
    let node = new RBTNode(val);
    node.left = this.NIL;
    node.right = this.NIL;

    let y = null;
    let x = this.root;

    while (x !== this.NIL) {
      y = x;
      if (node.val < x.val) x = x.left;
      else x = x.right;
    }

    node.parent = y;
    if (y === null) this.root = node;
    else if (node.val < y.val) y.left = node;
    else y.right = node;

    logs.push({ msg: `Inserted ${val} as a RED leaf.`, type: 'insert' });
    this.fixInsert(node, logs);
  }

  fixInsert(k, logs) {
    while (k.parent && k.parent.color === 'RED') {
      if (k.parent === k.parent.parent.left) {
        let u = k.parent.parent.right;
        if (u.color === 'RED') {
          logs.push({ msg: `Uncle is RED. Recoloring parent, uncle and grandparent.`, type: 'recolor' });
          u.color = 'BLACK';
          k.parent.color = 'BLACK';
          k.parent.parent.color = 'RED';
          k = k.parent.parent;
        } else {
          if (k === k.parent.right) {
            k = k.parent;
            this.rotateLeft(k);
          }
          logs.push({ msg: `Uncle is BLACK. Rotating and recoloring.`, type: 'rotate' });
          k.parent.color = 'BLACK';
          k.parent.parent.color = 'RED';
          this.rotateRight(k.parent.parent);
        }
      } else {
        let u = k.parent.parent.left;
        if (u.color === 'RED') {
          u.color = 'BLACK';
          k.parent.color = 'BLACK';
          k.parent.parent.color = 'RED';
          k = k.parent.parent;
        } else {
          if (k === k.parent.left) {
            k = k.parent;
            this.rotateRight(k);
          }
          k.parent.color = 'BLACK';
          k.parent.parent.color = 'RED';
          this.rotateLeft(k.parent.parent);
        }
      }
      if (k === this.root) break;
    }
    this.root.color = 'BLACK';
  }
}
