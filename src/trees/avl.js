export class AVLNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
    this.height = 1;
    this._x = 0;
    this._y = 0;
  }
}

export class AVLTree {
  constructor() {
    this.root = null;
  }

  getHeight(node) {
    return node ? node.height : 0;
  }

  getBalance(node) {
    return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
  }

  updateHeight(node) {
    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
  }

  rotateRight(y) {
    let x = y.left;
    let T2 = x.right;
    x.right = y;
    y.left = T2;
    this.updateHeight(y);
    this.updateHeight(x);
    return x;
  }

  rotateLeft(x) {
    let y = x.right;
    let T2 = y.left;
    y.left = x;
    x.right = T2;
    this.updateHeight(x);
    this.updateHeight(y);
    return y;
  }

  insert(node, val, logs) {
    if (!node) {
      logs.push({ msg: `Inserted ${val} as a leaf.`, type: 'insert' });
      return new AVLNode(val);
    }

    if (val < node.val) {
      node.left = this.insert(node.left, val, logs);
    } else if (val > node.val) {
      node.right = this.insert(node.right, val, logs);
    } else return node;

    this.updateHeight(node);
    let balance = this.getBalance(node);

    // Left Left Case
    if (balance > 1 && val < node.left.val) {
      logs.push({ msg: `LL Imbalance at ${node.val}. Rotating Right.`, type: 'rotate' });
      return this.rotateRight(node);
    }

    // Right Right Case
    if (balance < -1 && val > node.right.val) {
      logs.push({ msg: `RR Imbalance at ${node.val}. Rotating Left.`, type: 'rotate' });
      return this.rotateLeft(node);
    }

    // Left Right Case
    if (balance > 1 && val > node.left.val) {
      logs.push({ msg: `LR Imbalance at ${node.val}. Double Rotation.`, type: 'rotate' });
      node.left = this.rotateLeft(node.left);
      return this.rotateRight(node);
    }

    // Right Left Case
    if (balance < -1 && val < node.right.val) {
      logs.push({ msg: `RL Imbalance at ${node.val}. Double Rotation.`, type: 'rotate' });
      node.right = this.rotateRight(node.right);
      return this.rotateLeft(node);
    }

    return node;
  }
}
