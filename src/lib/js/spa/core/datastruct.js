function LinkNode(val){
    this.value = val || {};
    this.prev = null;
    this.next = null;
}

function LinkStack(val){
    this.head = new LinkNode(val);
    this.last = this.head;
    this.length = 1;
}

LinkStack.prototype = {
    find: function(val){
        for(var curNode = this.last; curNode; curNode = curNode.prev){
            if(curNode.value === val)
                return curNode;
        }
        return false;
    },
    lastIndexOf: function(val){
        var idx = 1;
        var self = this;
        for(var curNode = this.last; curNode; curNode = curNode.prev){
            idx--;
            if(curNode.value === val)
                return idx;
        }
        return idx;
    },
    push: function(val){
        return this.insert(val);
    },
    pop: function(){
        return this.remove();
    },
    remove: function(val){
        var node = val ? this.find(val) : this.last;
        if(node){
            if(node === this.last){
                this.last = node.prev;
            } else {
                node.next.prev = node.prev;
            }

            if(node === this.head){
                this.head = node.next;
            } else {
                node.prev.next = node.next;
            }
            node.next = node.prev = null;
            // console.log('remove:', node);
            this.length--;
            return node;
        }
        return false;
    },
    insert: function(val, behindNode){
        // var node = this.find(key, val);
        var node = new LinkNode(val);

        if(behindNode){
            node.next = behindNode; 
            if(behindNode === this.head) {
                this.head = node;
            } else {
                behindNode.prev.next = node;
                node.prev = behindNode.prev;
            }
            behindNode.prev = node;

        } else { // 没有参照节点 执行push操作
            node.prev = this.last;
            this.last.next = node,
            this.last = node;
        }
        // console.log('insert:', node);
        this.length++;
        return node;
    }
}


module.exports = {
    LinkStack: LinkStack,
    LinkNode: LinkNode
}