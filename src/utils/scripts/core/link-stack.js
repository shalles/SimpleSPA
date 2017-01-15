export function LinkNode (val = {}) {
    this.value = val
    this.prev = null
    this.next = null
}

export class LinkStack {
    constructor (val) {
        this.head = new LinkNode(val)
        this.last = this.head
        this.length = 1
    }

    find (val){
        let curNode = this.last
        while (curNode = curNode.prev) {
            if (curNode.value === val) return curNode
        }
        return false
    }

    lastIndexOf (val){
        let idx = 1
        let curNode = this.last
        while (curNode = curNode.prev) {
            --idx
            if (curNode.value === val) return idx
        }
        return idx
    }

    push (val){
        return this.insert(val)
    }

    pop (){
        return this.remove()
    }

    remove (val){
        let node = val ? this.find(val) : this.last
        if(node){
            if (node === this.last){
                this.last = node.prev
            } else {
                node.next.prev = node.prev
            }

            if (node === this.head){
                this.head = node.next
            } else {
                node.prev.next = node.next
            }
            node.next = node.prev = null
            // console.log('remove:', node)
            --this.length
            return node
        }
        return false
    }

    insert (val, behindNode){
        // let node = this.find(key, val)
        let node = new LinkNode(val)

        if(behindNode){
            node.next = behindNode 
            if (behindNode === this.head) {
                this.head = node
            } else {
                behindNode.prev.next = node
                node.prev = behindNode.prev
            }
            behindNode.prev = node

        } else { // 没有参照节点 执行push操作
            node.prev = this.last
            this.last.next = node,
            this.last = node
        }
        // console.log('insert:', node)
        ++this.length
        return node
    }
}
