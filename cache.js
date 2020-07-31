const DEFAULT_CACHE_SIZE = 25;

// cache node
function Node(key, value, expires) {
  this.key = key;
  this.value = value;
  this.next = null;
  this.prev = null;
  this.timestamp = expires ? Date.now() : null;
}

Node.prototype.hasExpired = function (diff) {
  if (diff && this.timestamp) {
    return Date.now() - this.timestamp >= diff;
  }
};

// in-memory LRU cache
function Cache(params = {}) {
  let hash = {};
  let head = null;
  let tail = null;
  let size = 0;
  let options = {
    cacheSize: DEFAULT_CACHE_SIZE,
    expiresAt: null,
    ...params,
  };

  // add a new node to cache
  function add(key, value) {
    const node = new Node(key, value, options.expiresAt);

    if (head) {
      node.next = head;
      head.prev = node;
    }
    // set the tail node
    if (!tail) {
      tail = node;
    }

    head = node;
    size++;

    // remove a node if we reach size limit
    if (size > options.cacheSize) {
      remove(tail);
    }
    hash[key] = node;

    return node;
  }

  // remove the tail node
  // the previous node becomes the tail
  function _remove() {
    if (tail) {
      delete hash[tail.key];
      const prev = tail.prev;
      tail = prev;
      // in case head/tail are the same
      if (prev) {
        prev.next = null;
      }
      size--;
    }
  }

  function remove(node) {
    if (node) {
      delete hash[node.key];

      // if the node is in the middle
      if (node.prev) {
        node.prev.next = node.next;
      }
      if (node.next) {
        node.next.prev = node.prev;
      }
      // if it's the tail node
      if (node === tail) {
        tail = node.prev;
      }
      // if it's the head node
      if (node === head) {
        head = node.next;
      }
      size--;
    }
  }

  // refresh a node, move it to top
  function refresh(node) {
    if (head === node) {
      return;
    }

    // remove from current position
    if (node.prev) {
      node.prev.next = node.next;
    }
    if (node.next) {
      node.next.prev = node.prev;
    }

    // add to top
    node.next = head;
    head.prev = node;
    head = node;

    // update tail if refreshed node is the tail node
    if (tail === node) {
      tail = node.prev;
    }
    node.prev = null;
  }

  // check for cached node
  function find(key) {
    if (key in hash) {
      const node = hash[key];
      if (node.hasExpired(options.expiresAt)) {
        remove(node);
      } else {
        refresh(node);
        return node;
      }
    }
    return null;
  }

  // clear the cache
  function clear() {
    head = null;
    tail = null;
    size = 0;
    hash = {};
    // garabage collector will take care of the rest. right?
  }

  // pretty print cache
  function print() {
    let node = head;
    let out = [];
    while (node) {
      out.push(`[${node.key}: ${node.value}]`);
      node = node.next;
    }
    return out.join(" -> ");
  }

  return {
    add,
    find,
    print,
    clear,
  };
}

// build cache key
Cache.generateKey = (args) => args.map((x) => JSON.stringify(x)).join("-");

module.exports = Cache;
