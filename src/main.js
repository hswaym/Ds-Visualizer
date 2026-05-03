import './styles/main.css'
import { supabase } from './utils/supabase'
import { AVLTree } from './trees/avl'
import { RedBlackTree } from './trees/rbt'
import { Heap } from './trees/heap'
import { Trie } from './trees/trie'

// ── STATE ──
let currentUser = null;
let currentTreeType = 'dashboard';
let avl = new AVLTree();
let rbt = new RedBlackTree();
let heap = new Heap('min');
let trie = new Trie();
let logs = [];

// ── DOM ELEMENTS ──
const authOverlay = document.getElementById('auth-overlay');
const authForm = document.getElementById('auth-form');
const authToggle = document.getElementById('auth-toggle');
const authTitle = document.getElementById('auth-title');
const authSubmitBtn = document.getElementById('auth-submit-btn');

const userSection = document.getElementById('user-section');
const userInitials = document.getElementById('user-initials');
const userDisplayName = document.getElementById('user-display-name');
const logoutBtn = document.getElementById('logout-btn');

const pageDashboard = document.getElementById('page-dashboard');
const pageTree = document.getElementById('page-tree');
const pageTitle = document.getElementById('page-title');
const treeControls = document.getElementById('tree-controls');
const treeInput = document.getElementById('tree-input');
const insertBtn = document.getElementById('insert-btn');
const resetBtn = document.getElementById('reset-btn');
const svgRoot = document.getElementById('svg-root');
const obsHistory = document.getElementById('obs-history');

const statTotal = document.getElementById('stat-total');
const statLast = document.getElementById('stat-last');

// ── AUTH LOGIC ──
let isLoginMode = true;

async function checkUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    currentUser = user;
    updateUserUI();
    authOverlay.style.display = 'none';
    fetchUserStats();
  } else {
    authOverlay.style.display = 'flex';
  }
}

function updateUserUI() {
  if (currentUser) {
    userSection.style.display = 'flex';
    userDisplayName.textContent = currentUser.email.split('@')[0];
    userInitials.textContent = currentUser.email[0].toUpperCase();
  } else {
    userSection.style.display = 'none';
  }
}

authToggle.onclick = () => {
  isLoginMode = !isLoginMode;
  authTitle.textContent = isLoginMode ? 'Welcome Back' : 'Create Account';
  authSubmitBtn.textContent = isLoginMode ? 'Sign In' : 'Sign Up';
  authToggle.textContent = isLoginMode ? "Don't have an account? Sign Up" : "Already have an account? Sign In";
};

authForm.onsubmit = async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    let result;
    if (isLoginMode) {
      result = await supabase.auth.signInWithPassword({ email, password });
    } else {
      result = await supabase.auth.signUp({ email, password });
    }

    if (result.error) throw result.error;
    
    currentUser = result.data.user;
    updateUserUI();
    authOverlay.style.display = 'none';
    fetchUserStats();
  } catch (err) {
    alert(err.message);
  }
};

logoutBtn.onclick = async () => {
  await supabase.auth.signOut();
  currentUser = null;
  updateUserUI();
  authOverlay.style.display = 'flex';
};

// ── NAVIGATION ──
document.querySelectorAll('.nav-item').forEach(item => {
  item.onclick = () => {
    const page = item.getAttribute('data-page');
    showPage(page);
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
  };
});

function showPage(page) {
  currentTreeType = page;
  if (page === 'dashboard') {
    pageDashboard.style.display = 'block';
    pageTree.style.display = 'none';
    pageTitle.textContent = 'Dashboard';
    treeControls.style.display = 'none';
  } else {
    pageDashboard.style.display = 'none';
    pageTree.style.display = 'flex';
    pageTitle.textContent = page.toUpperCase() + ' Tree';
    treeControls.style.display = 'flex';
    render();
  }
}

// ── TREE OPERATIONS ──
insertBtn.onclick = async () => {
  const val = parseInt(treeInput.value);
  if (isNaN(val)) return;

  const currentLogs = [];
  if (currentTreeType === 'avl') {
    avl.root = avl.insert(avl.root, val, currentLogs);
  } else if (currentTreeType === 'rbt') {
    rbt.insert(val, currentLogs);
  } else if (currentTreeType === 'heap') {
    heap.insert(val, currentLogs);
  }

  // Save to History
  if (currentUser) {
    await supabase.from('user_history').insert({
      user_id: currentUser.id,
      tree_type: currentTreeType,
      operation: 'insert',
      value: val.toString()
    });
    fetchUserStats();
  }

  // Add to local logs
  currentLogs.forEach(l => {
    addLog(l.msg);
  });

  treeInput.value = '';
  render();
};

resetBtn.onclick = () => {
  if (currentTreeType === 'avl') avl = new AVLTree();
  if (currentTreeType === 'rbt') rbt = new RedBlackTree();
  if (currentTreeType === 'heap') heap = new Heap('min');
  obsHistory.innerHTML = '';
  render();
};

function addLog(msg) {
  const div = document.createElement('div');
  div.className = 'obs-entry';
  div.innerHTML = `<div class="obs-entry-text">${msg}</div><div class="obs-entry-time">${new Date().toLocaleTimeString()}</div>`;
  obsHistory.prepend(div);
}

// ── RENDERING ──
function render() {
  svgRoot.innerHTML = '';
  let root = null;
  let isRBT = currentTreeType === 'rbt';

  if (currentTreeType === 'avl') root = avl.root;
  else if (currentTreeType === 'rbt') root = rbt.root;
  else if (currentTreeType === 'heap') root = buildHeapTree(0);

  if (root && root.val !== null) {
    const nodes = [];
    traverse(root, 0, 0, 400, nodes, isRBT ? rbt.NIL : null);
    
    // Draw edges
    nodes.forEach(n => {
      if (n.left && n.left.val !== null) drawEdge(n.x, n.y, n.left.x, n.left.y);
      if (n.right && n.right.val !== null) drawEdge(n.x, n.y, n.right.x, n.right.y);
    });

    // Draw nodes
    nodes.forEach(n => {
      drawNode(n.x, n.y, n.val, n.color);
    });
  }
}

function traverse(node, x, y, offset, nodes, nil) {
  if (!node || node === nil || node.val === null) return null;
  const n = { val: node.val, x: 450 + x, y: 50 + y, color: node.color };
  n.left = traverse(node.left, x - offset, y + 80, offset / 2, nodes, nil);
  n.right = traverse(node.right, x + offset, y + 80, offset / 2, nodes, nil);
  nodes.push(n);
  return n;
}

function buildHeapTree(idx) {
  if (idx >= heap.heap.length) return null;
  const node = { val: heap.heap[idx] };
  node.left = buildHeapTree(2 * idx + 1);
  node.right = buildHeapTree(2 * idx + 2);
  return node;
}

function drawNode(x, y, val, color) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', x);
  circle.setAttribute('cy', y);
  circle.setAttribute('r', 22);
  circle.setAttribute('class', 'node-circle');
  
  if (color === 'RED') {
    circle.style.fill = 'var(--red)';
    circle.style.stroke = '#ef4444';
  } else if (color === 'BLACK') {
    circle.style.fill = 'var(--surface3)';
    circle.style.stroke = '#475569';
  }

  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', x);
  text.setAttribute('y', y);
  text.setAttribute('class', 'node-text');
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('dominant-baseline', 'middle');
  text.textContent = val;

  g.appendChild(circle);
  g.appendChild(text);
  svgRoot.appendChild(g);
}

function drawEdge(x1, y1, x2, y2) {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', x1);
  line.setAttribute('y1', y1);
  line.setAttribute('x2', x2);
  line.setAttribute('y2', y2);
  line.setAttribute('class', 'edge-line');
  svgRoot.appendChild(line);
}

// ── DATA FETCHING ──
async function fetchUserStats() {
  if (!currentUser) return;

  const { data, count } = await supabase
    .from('user_history')
    .select('*', { count: 'exact' })
    .eq('user_id', currentUser.id);

  if (data) {
    statTotal.textContent = count || 0;
    if (data.length > 0) {
      const last = data[data.length - 1];
      statLast.textContent = `${last.tree_type} - ${last.operation} (${last.value})`;
    }
  }
}

// ── INITIALIZE ──
checkUser();
showPage('dashboard');
