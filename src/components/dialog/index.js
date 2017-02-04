var getType = function(a) {
    return Object.prototype.toString.call(a).slice(8, -1);
}
var Dialog = {
    _init: function() {
        this.containerEl = window.document.createElement('div');
        this.containerEl.id = 'c-dialog';
        this.containerEl.className = 'display-none';
        window.document.body.appendChild(this.containerEl);
    },
    loading: function(str){
        this.containerEl.innerHTML = '<div class="toast c-loading c-loading-chrysanthemum"><span class="msg">正在加载...</span></div>';
        this.show();
    },
    show: function() {
        this.containerEl.classList.remove('display-none');
    },
    hide: function() {
        this.containerEl.classList.add('display-none');
    }
}

Dialog._init();
module.exports = {
    loading: Dialog.loading.bind(Dialog),
    hide: Dialog.hide.bind(Dialog)
}