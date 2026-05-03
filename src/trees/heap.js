export class Heap {
  constructor(type = 'min') {
    this.heap = [];
    this.type = type; // 'min' or 'max'
  }

  getParentIdx(i) { return Math.floor((i - 1) / 2); }
  getLeftChildIdx(i) { return 2 * i + 1; }
  getRightChildIdx(i) { return 2 * i + 2; }

  swap(i1, i2) {
    [this.heap[i1], this.heap[i2]] = [this.heap[i2], this.heap[i1]];
  }

  insert(val, logs) {
    this.heap.push(val);
    logs.push({ msg: `Added ${val} to the end of the heap.`, type: 'insert' });
    this.heapifyUp(this.heap.length - 1, logs);
  }

  heapifyUp(idx, logs) {
    let parentIdx = this.getParentIdx(idx);
    while (idx > 0) {
      const isOutOrder = this.type === 'min' 
        ? this.heap[idx] < this.heap[parentIdx] 
        : this.heap[idx] > this.heap[parentIdx];

      if (isOutOrder) {
        logs.push({ msg: `Swapping ${this.heap[idx]} with parent ${this.heap[parentIdx]}`, type: 'swap' });
        this.swap(idx, parentIdx);
        idx = parentIdx;
        parentIdx = this.getParentIdx(idx);
      } else break;
    }
  }

  extract(logs) {
    if (this.heap.length === 0) return null;
    const root = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      logs.push({ msg: `Moved ${last} to root and heapifying down.`, type: 'extract' });
      this.heapifyDown(0, logs);
    }
    return root;
  }

  heapifyDown(idx, logs) {
    while (true) {
      let smallest = idx;
      let left = this.getLeftChildIdx(idx);
      let right = this.getRightChildIdx(idx);

      if (this.type === 'min') {
        if (left < this.heap.length && this.heap[left] < this.heap[smallest]) smallest = left;
        if (right < this.heap.length && this.heap[right] < this.heap[smallest]) smallest = right;
      } else {
        if (left < this.heap.length && this.heap[left] > this.heap[smallest]) smallest = left;
        if (right < this.heap.length && this.heap[right] > this.heap[smallest]) smallest = right;
      }

      if (smallest !== idx) {
        logs.push({ msg: `Swapping ${this.heap[idx]} with child ${this.heap[smallest]}`, type: 'swap' });
        this.swap(idx, smallest);
        idx = smallest;
      } else break;
    }
  }
}
